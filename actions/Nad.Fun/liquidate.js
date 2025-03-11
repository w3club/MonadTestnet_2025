const inquirer = require("inquirer");
const chalk = require("chalk");
const { ethers } = require("ethers");
const clear = require("console-clear");

const chain = require("../../utils/chain.js");
const wallets = require("../../utils/wallets.json");
const { ROUTER_CONTRACT, ABI } = require("./ABI.js");

const erc20Abi = [
  "function balanceOf(address) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)"
];

const provider = new ethers.providers.JsonRpcProvider(chain.RPC_URL);
const TX_EXPLORER = chain.TX_EXPLORER;

// Target token is MON (native)
const targetToken = { name: "MON", address: null, decimals: 18, native: true };

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getTokenSymbol(tokenAddress) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    return await tokenContract.symbol();
  } catch {
    return "UNKNOWN";
  }
}

async function getTokenDecimals(tokenAddress) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    return await tokenContract.decimals();
  } catch {
    return 18;
  }
}

async function getTokenBalance(walletAddress, token) {
  try {
    if (token.native) {
      const balance = await provider.getBalance(walletAddress);
      return ethers.utils.formatEther(balance);
    } else {
      const tokenContract = new ethers.Contract(token.address, erc20Abi, provider);
      const balance = await tokenContract.balanceOf(walletAddress);
      return ethers.utils.formatUnits(balance, token.decimals);
    }
  } catch (err) {
    console.error(chalk.red(`Error fetching balance for token [${token.name}].`));
    return "0";
  }
}

async function ensureApproval(wallet, token) {
  if (token.native) return;
  try {
    const signer = new ethers.Wallet(wallet.privateKey, provider);
    const tokenContract = new ethers.Contract(token.address, erc20Abi, signer);
    const allowance = await tokenContract.allowance(wallet.address, ROUTER_CONTRACT);
    if (allowance.eq(0)) {
      const randomGasLimit = getRandomInt(250000, 380000);
      console.log(chalk.magenta(`Approving [${token.name}] for Router...`));
      const latestBlock = await provider.getBlock("latest");
      const priorityFee = ethers.utils.parseUnits("1", "gwei");
      const maxFee = latestBlock.baseFeePerGas.add(priorityFee).mul(105).div(100);
      const tx = await tokenContract.approve(
        ROUTER_CONTRACT,
        ethers.constants.MaxUint256,
        {
          gasLimit: randomGasLimit,
          maxFeePerGas: maxFee,
          maxPriorityFeePerGas: priorityFee
        }
      );
      await tx.wait();
      console.log(chalk.magenta(`[${token.name}] Approved!`));
    }
  } catch (err) {
    console.error(chalk.red(`Approval error for [${token.name}]. Skipping token approval.`));
  }
}

async function liquidateSellSwap(wallet, token) {
  const signer = new ethers.Wallet(wallet.privateKey, provider);
  const routerContract = new ethers.Contract(ROUTER_CONTRACT, ABI, signer);
  const randomGasLimit = getRandomInt(250000, 380000);
  const latestBlock = await provider.getBlock("latest");
  const priorityFee = ethers.utils.parseUnits("1", "gwei");
  const maxFee = latestBlock.baseFeePerGas.add(priorityFee).mul(105).div(100);
  const deadline = Math.floor(Date.now() / 1000) + 6 * 3600;
  
  const tokenContract = new ethers.Contract(token.address, erc20Abi, provider);
  const rawBalance = await tokenContract.balanceOf(wallet.address);
  if (rawBalance.eq(0)) return null;
  
  // Sell the entire token balance
  const sellAmount = rawBalance;
  
  try {
    console.log(chalk.blue(`Wallet [${wallet.address}] selling ${ethers.utils.formatUnits(sellAmount, token.decimals)} ${token.name}`));
    const tx = await routerContract.protectSell(
      sellAmount,
      0,
      token.address,
      wallet.address,
      deadline,
      {
        gasLimit: randomGasLimit,
        maxFeePerGas: maxFee,
        maxPriorityFeePerGas: priorityFee
      }
    );
    console.log(chalk.green(`Tx Sent: [${TX_EXPLORER}${tx.hash}]`));
    const receipt = await tx.wait();
    console.log(chalk.green(`Tx Confirmed In Block [${receipt.blockNumber}] for Wallet [${wallet.address}]`));
    return { txHash: tx.hash, blockNumber: receipt.blockNumber };
  } catch (error) {
    if (error.message.includes("Signer had insufficient balance")) {
      console.error(chalk.red("Insufficient balance for signing transaction. Skipping token swap."));
    } else {
      console.error(chalk.red(`Swap error for wallet [${wallet.address}], token [${token.name}].`));
    }
    return null;
  }
}

async function liquidateWallet(wallet, tokens) {
  console.log(chalk.cyan(`\nChecking Balances For Wallet - [${wallet.address}]`));
  console.log(chalk.cyan(`Swapping Existing Token Assets for ${targetToken.name}\n`));
  
  const monBalanceBefore = await getTokenBalance(wallet.address, targetToken);
  
  for (let token of tokens) {
    let balanceBefore = await getTokenBalance(wallet.address, token);
    if (Number(balanceBefore) === 0) continue;
    
    console.log(chalk.magenta(`Balance ${token.name} before Swap - [${balanceBefore}]`));
    console.log(chalk.magenta(`Balance ${targetToken.name} before Swap - [${monBalanceBefore}]`));
    console.log(chalk.yellow(`Swap - [${token.name}/${targetToken.name}]`));
    
    await ensureApproval(wallet, token);
    let swapResult;
    try {
      swapResult = await liquidateSellSwap(wallet, token);
    } catch (err) {
      console.error(chalk.red(`Swap error for [${token.name}], skipping.`));
      continue;
    }
    
    if (swapResult) {
      console.log(chalk.cyan(`Tx Hash Sent! - [${TX_EXPLORER}${swapResult.txHash}]`));
      console.log(chalk.cyan(`Tx Confirmed In Block - [${swapResult.blockNumber}]`));
    } else {
      console.log(chalk.red(`Swap could not be executed for ${token.name} -> ${targetToken.name}.`));
    }
    
    let balanceAfter = await getTokenBalance(wallet.address, token);
    let monBalanceAfter = await getTokenBalance(wallet.address, targetToken);
    console.log(chalk.magenta(`Balance ${token.name} after Swap - [${balanceAfter}]`));
    console.log(chalk.magenta(`Balance ${targetToken.name} after Swap - [${monBalanceAfter}]\n`));
    
    await sleep(2000);
  }
}

async function main() {
  const { tokenAddressesInput } = await inquirer.prompt([
    {
      type: "input",
      name: "tokenAddressesInput",
      message: "Enter the token contract addresses to liquidate (separated by spaces):"
    }
  ]);
  
  const tokenAddresses = tokenAddressesInput.split(" ").filter(addr => addr.trim() !== "");
  const tokens = [];
  
  for (let addr of tokenAddresses) {
    const symbol = await getTokenSymbol(addr);
    const decimals = await getTokenDecimals(addr);
    tokens.push({ name: symbol, address: addr, decimals, native: false });
  }
  
  for (let w of wallets) {
    try {
      await liquidateWallet(w, tokens);
    } catch (err) {
      console.error(chalk.red(`Error processing wallet [${w.address}]. Skipping wallet.`));
      continue;
    }
  }
  
  console.log(chalk.green("\nLiquidation process completed."));
}

clear();
main().catch(console.error);
