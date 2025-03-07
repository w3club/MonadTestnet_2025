// basicSwap.js

const inquirer = require("inquirer");
const chalk = require("chalk");
const clear = require("console-clear");
const { ethers } = require("ethers");

const chain = require("../../utils/chain.js");
const wallets = require("../../utils/wallets.json");
const { ROUTER_CONTRACT, ABI } = require("./ABI.js");

const erc20Abi = [
  "function balanceOf(address) view returns (uint256)",
  "function symbol() view returns (string)",
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)"
];

const provider = new ethers.providers.JsonRpcProvider(chain.RPC_URL);

async function getTokenSymbol(tokenAddress) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    return await tokenContract.symbol();
  } catch {
    return "UNKNOWN";
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function ensureApproval(wallet, tokenAddress) {
  const signer = new ethers.Wallet(wallet.privateKey, provider);
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);
  const allowance = await tokenContract.allowance(wallet.address, ROUTER_CONTRACT);
  if (allowance.eq(0)) {
    const symbol = await getTokenSymbol(tokenAddress);
    const latestBlock = await provider.getBlock("latest");
    const priorityFee = ethers.utils.parseUnits("1", "gwei");
    const maxFee = latestBlock.baseFeePerGas.add(priorityFee).mul(105).div(100);
    const randomGasLimit = getRandomInt(250000, 380000);
    console.log(chalk.magenta(`Approving - [${symbol}] to be used by Router`));
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
    console.log(chalk.magenta(`[${symbol}] Approved!`));
  }
}

async function protectBuySwap(wallet, tokenAddress, buyAmount) {
  const signer = new ethers.Wallet(wallet.privateKey, provider);
  const fee = buyAmount.mul(1).div(100);
  const totalValue = buyAmount.add(fee);
  const deadline = Math.floor(Date.now() / 1000) + 6 * 3600;
  const randomGasLimit = getRandomInt(250000, 380000);
  const latestBlock = await provider.getBlock("latest");
  const priorityFee = ethers.utils.parseUnits("1", "gwei");
  const maxFee = latestBlock.baseFeePerGas.add(priorityFee).mul(105).div(100);
  const routerContract = new ethers.Contract(ROUTER_CONTRACT, ABI, signer);

  try {
    console.log(chalk.blue(`Wallet [${wallet.address}] buying ${ethers.utils.formatEther(buyAmount)} MON (Fee: ${ethers.utils.formatEther(fee)} MON)`));
    const tx = await routerContract.protectBuy(
      buyAmount,
      0,
      fee,
      tokenAddress,
      wallet.address,
      deadline,
      {
        value: totalValue,
        gasLimit: randomGasLimit,
        maxFeePerGas: maxFee,
        maxPriorityFeePerGas: priorityFee
      }
    );
    console.log(chalk.green(`Tx Sent: [${chain.TX_EXPLORER}${tx.hash}]`));
    const receipt = await tx.wait();
    console.log(chalk.green(`Tx Confirmed in Block [${receipt.blockNumber}] for Wallet [${wallet.address}]`));
  } catch (error) {
    console.error(chalk.red(`Error during buying for wallet [${wallet.address}]: ${error}`));
  }
}

async function protectSellSwap(wallet, tokenAddress, sellAmount) {
  const signer = new ethers.Wallet(wallet.privateKey, provider);
  const deadline = Math.floor(Date.now() / 1000) + 6 * 3600;
  const randomGasLimit = getRandomInt(250000, 380000);
  const latestBlock = await provider.getBlock("latest");
  const priorityFee = ethers.utils.parseUnits("1", "gwei");
  const maxFee = latestBlock.baseFeePerGas.add(priorityFee).mul(105).div(100);
  const routerContract = new ethers.Contract(ROUTER_CONTRACT, ABI, signer);

  try {
    console.log(chalk.blue(`Wallet [${wallet.address}] selling ${ethers.utils.formatEther(sellAmount)}`));
    const tx = await routerContract.protectSell(
      sellAmount,
      0,
      tokenAddress,
      wallet.address,
      deadline,
      {
        gasLimit: randomGasLimit,
        maxFeePerGas: maxFee,
        maxPriorityFeePerGas: priorityFee
      }
    );
    console.log(chalk.green(`Tx Sent: [${chain.TX_EXPLORER}${tx.hash}]`));
    const receipt = await tx.wait();
    console.log(chalk.green(`Tx Confirmed in Block [${receipt.blockNumber}] for Wallet [${wallet.address}]`));
  } catch (error) {
    console.error(chalk.red(`Error during selling for wallet [${wallet.address}]: ${error}`));
  }
}

async function getTokenBalance(walletAddress, tokenAddress) {
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
  const balance = await tokenContract.balanceOf(walletAddress);
  return ethers.utils.formatUnits(balance, "ether");
}

async function main() {
  const { walletId } = await inquirer.prompt([
    {
      type: "input",
      name: "walletId",
      message: "Enter the wallet ID to use:",
      validate: value => (!isNaN(value) && Number(value) > 0) || "Enter a valid wallet ID."
    }
  ]);
  const wallet = wallets.find(w => w.id === Number(walletId));
  if (!wallet) {
    console.error(chalk.red("Wallet not found."));
    process.exit(1);
  }

  console.log(chalk.green(`Selected Wallet - [${wallet.address}]`));

  const { tokenAddress } = await inquirer.prompt([
    {
      type: "input",
      name: "tokenAddress",
      message: "Enter the token contract address:"
    }
  ]);

  const symbol = await getTokenSymbol(tokenAddress);
  console.log(chalk.green(`Token Found - [${symbol}]`));

  const nativeBalance = await provider.getBalance(wallet.address);
  console.log(chalk.blue(`MON Balance - [${ethers.utils.formatEther(nativeBalance)}] MON`));
  const tokenBalance = await getTokenBalance(wallet.address, tokenAddress);
  console.log(chalk.blue(`${symbol} Balance - [${tokenBalance}] ${symbol}`));

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        { name: "Buy", value: "buy" },
        { name: "Sell", value: "sell" }
      ]
    }
  ]);

  if (action === "buy") {
    const { buyAmountInput } = await inquirer.prompt([
      {
        type: "input",
        name: "buyAmountInput",
        message: "Enter the amount of MON to use for buying:",
        validate: value => (!isNaN(parseFloat(value)) && parseFloat(value) > 0) || "Enter a valid number greater than 0."
      }
    ]);
    const buyAmount = ethers.utils.parseUnits(buyAmountInput, "ether");
    await ensureApproval(wallet, tokenAddress);
    await protectBuySwap(wallet, tokenAddress, buyAmount);
  } else {
    const { sellAmountInput } = await inquirer.prompt([
      {
        type: "input",
        name: "sellAmountInput",
        message: `Enter the amount of ${symbol} to sell:`,
        validate: value => (!isNaN(parseFloat(value)) && parseFloat(value) > 0) || "Enter a valid number greater than 0."
      }
    ]);
    const sellAmount = ethers.utils.parseUnits(sellAmountInput, "ether");
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    const rawBalance = await tokenContract.balanceOf(wallet.address);
    if (sellAmount.gt(rawBalance)) {
      console.error(chalk.red("Insufficient token balance."));
      process.exit(1);
    }
    await ensureApproval(wallet, tokenAddress);
    await protectSellSwap(wallet, tokenAddress, sellAmount);
  }

  const updatedNativeBalance = await provider.getBalance(wallet.address);
  console.log(chalk.blue(`Updated MON Balance - [${ethers.utils.formatEther(updatedNativeBalance)}] MON`));
  const updatedTokenBalance = await getTokenBalance(wallet.address, tokenAddress);
  console.log(chalk.blue(`Updated ${symbol} Balance - [${updatedTokenBalance}] ${symbol}`));

  const { doAnother } = await inquirer.prompt([
    { type: "confirm", name: "doAnother", message: "Would you like to perform another swap?", default: false }
  ]);
  if (!doAnother) process.exit(0);
  clear();
  main();
}

main().catch(console.error);
