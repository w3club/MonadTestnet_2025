const inquirer = require("inquirer");
const { ethers } = require("ethers");
const chalk = require("chalk");
const clear = require("console-clear");
const { 
  ROUTER_CONTRACT, 
  WMON_CONTRACT, 
  USDC_CONTRACT, 
  USDT_CONTRACT, 
  TEST1_CONTRACT, 
  TEST2_CONTRACT,
  DAK_CONTRACT,
  ABI
} = require("./ABI");
const { RPC_URL, TX_EXPLORER } = require("../../utils/chain");
const wallets = require("../../utils/wallets.json");

const availableTokens = {
  MON:   { name: "MON",   address: null,           decimals: 18, native: true  },
  WMON:  { name: "WMON",  address: WMON_CONTRACT,  decimals: 18, native: false },
  USDC:  { name: "USDC",  address: USDC_CONTRACT,  decimals: 6,  native: false },
  DAK:   { name: "DAK",   address: DAK_CONTRACT,   decimals: 18, native: false },
  USDT:  { name: "USDT",  address: USDT_CONTRACT,  decimals: 6,  native: false },
  TEST1: { name: "TEST1", address: TEST1_CONTRACT, decimals: 18, native: false },
  TEST2: { name: "TEST2", address: TEST2_CONTRACT, decimals: 18, native: false }
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchERC20Data(tokenAddress, provider) {
  const erc20ABI = [
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
  ];
  const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, provider);
  const symbol = await tokenContract.symbol();
  const decimals = await tokenContract.decimals();
  return { symbol, decimals };
}

async function getTokenBalance(provider, walletAddress, token) {
  if (token.native) {
    const balance = await provider.getBalance(walletAddress);
    return ethers.utils.formatUnits(balance, token.decimals);
  } else {
    const erc20ABI = [
      "function balanceOf(address) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];
    const tokenContract = new ethers.Contract(token.address, erc20ABI, provider);
    const balance = await tokenContract.balanceOf(walletAddress);
    return ethers.utils.formatUnits(balance, token.decimals);
  }
}

async function approveTokenIfNeeded(wallet, token, amount, routerAddress) {
  if (token.native) return;
  const erc20ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];
  const tokenContract = new ethers.Contract(token.address, erc20ABI, wallet);
  const currentAllowance = await tokenContract.allowance(wallet.address, routerAddress);
  if (currentAllowance.lt(amount)) {
    const gasLimitForApprove = Math.floor(Math.random() * (350000 - 250000 + 1)) + 250000;
    console.log(chalk.magenta(`🔑 [APPROVAL] Approving ${token.name}...`));
    await tokenContract.approve(routerAddress, ethers.constants.MaxUint256, { gasLimit: gasLimitForApprove });
    await sleep(1000);
    console.log(chalk.magenta(`✅ [APPROVAL] ${token.name} approved for swap.`));
  }
}

async function performSwap(wallet, tokenA, tokenB, swapAmountInput, provider) {
  const randomGasLimit = Math.floor(Math.random() * (350000 - 250000 + 1)) + 250000;

  // Convert MON -> WMON (deposit)
  if (tokenA.native && tokenB.name === "WMON") {
    const amountIn = ethers.utils.parseEther(swapAmountInput);
    const wmonContract = new ethers.Contract(WMON_CONTRACT, ["function deposit() payable"], wallet);
    console.log(chalk.magenta("💰 [DEPOSIT] Converting MON to WMON via deposit..."));
    const tx = await wmonContract.deposit({ value: amountIn, gasLimit: randomGasLimit });
    console.log(chalk.blue(`🚀 [TX SENT] ${TX_EXPLORER}${tx.hash}`));
    const receipt = await tx.wait();
    console.log(chalk.blue(`✔️ [CONFIRMED] Block: ${receipt.blockNumber}`));
    return;
  }

  // Convert WMON -> MON (withdraw)
  if (tokenA.name === "WMON" && tokenB.native) {
    const amountIn = ethers.utils.parseUnits(swapAmountInput, tokenA.decimals);
    const wmonContract = new ethers.Contract(WMON_CONTRACT, ["function withdraw(uint256)"], wallet);
    console.log(chalk.magenta("💸 [WITHDRAW] Converting WMON to MON via withdraw..."));
    const tx = await wmonContract.withdraw(amountIn, { gasLimit: randomGasLimit });
    console.log(chalk.blue(`🚀 [TX SENT] ${TX_EXPLORER}${tx.hash}`));
    const receipt = await tx.wait();
    console.log(chalk.blue(`✔️ [CONFIRMED] Block: ${receipt.blockNumber}`));
    return;
  }

  // Regular Token Swaps
  const routerContract = new ethers.Contract(ROUTER_CONTRACT, ABI.router, wallet);
  const currentTime = Math.floor(Date.now() / 1000);
  const deadline = currentTime + 3600 * 6;

  const path = [
    tokenA.native ? WMON_CONTRACT : tokenA.address,
    tokenB.native ? WMON_CONTRACT : tokenB.address
  ];

  const amountIn = tokenA.native
    ? ethers.utils.parseEther(swapAmountInput)
    : ethers.utils.parseUnits(swapAmountInput, tokenA.decimals);

  const amountsOut = await routerContract.getAmountsOut(amountIn, path);
  const expectedOut = amountsOut[amountsOut.length - 1];

  const humanReadableOut = tokenB.native
    ? ethers.utils.formatEther(expectedOut)
    : ethers.utils.formatUnits(expectedOut, tokenB.decimals);

  console.log(chalk.magenta(`🔄 [SWAP] Expected to receive: [${humanReadableOut} ${tokenB.name}]`));

  if (!tokenA.native) {
    await approveTokenIfNeeded(wallet, tokenA, amountIn, ROUTER_CONTRACT);
  }
  if (!tokenB.native) {
    await approveTokenIfNeeded(wallet, tokenB, expectedOut, ROUTER_CONTRACT);
  }

  const feeData = await provider.getFeeData();
  const maxFeePerGas = feeData.lastBaseFeePerGas ? feeData.lastBaseFeePerGas.mul(110).div(100) : null;
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ? feeData.maxPriorityFeePerGas.mul(110).div(100) : null;
  const txOverrides = { gasLimit: randomGasLimit };
  if (maxFeePerGas) txOverrides.maxFeePerGas = maxFeePerGas;
  if (maxPriorityFeePerGas) txOverrides.maxPriorityFeePerGas = maxPriorityFeePerGas;

  let tx;
  if (tokenA.native) {
    tx = await routerContract.swapExactETHForTokens(
      expectedOut,
      path,
      wallet.address,
      deadline,
      { value: amountIn, ...txOverrides }
    );
  } else if (tokenB.native) {
    tx = await routerContract.swapExactTokensForETH(
      amountIn,
      expectedOut,
      path,
      wallet.address,
      deadline,
      txOverrides
    );
  } else {
    tx = await routerContract.swapExactTokensForTokens(
      amountIn,
      expectedOut,
      path,
      wallet.address,
      deadline,
      txOverrides
    );
  }

  console.log(chalk.magenta(`🔄 [SWAP] Executing swap [${tokenA.name} -> ${tokenB.name}]...`));
  console.log(chalk.blue(`🚀 [TX SENT] ${TX_EXPLORER}${tx.hash}`));
  const receipt = await tx.wait();
  console.log(chalk.blue(`✔️ [CONFIRMED] Block: ${receipt.blockNumber}`));
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  let useSameWallet = false;
  let currentWallet;

  do {
    if (!useSameWallet || !currentWallet) {
      const { walletId } = await inquirer.prompt([
        {
          type: "input",
          name: "walletId",
          message: chalk.magenta("💼 Enter the Wallet ID to perform the Swap:"),
          validate: input => !isNaN(input) && Number(input) > 0 ? true : "Enter a valid wallet ID"
        }
      ]);

      const walletInfo = wallets.find(w => w.id === Number(walletId));
      if (!walletInfo) {
        console.log(chalk.magenta("❌ Wallet not found. Try again."));
        continue;
      }
      currentWallet = new ethers.Wallet(walletInfo.privateKey, provider);
    }

    const tokenChoices = [
      { name: "MON",   value: "MON"   },
      { name: "WMON",  value: "WMON"  },
      { name: "USDC",  value: "USDC"  },
      { name: "USDT",  value: "USDT"  },
      { name: "DAK",  value: "DAK"  },
      { name: "TEST1", value: "TEST1" },
      { name: "TEST2", value: "TEST2" },
      { name: "Other", value: "OTHER" }
    ];

    const { tokenAChoice } = await inquirer.prompt([
      {
        type: "list",
        name: "tokenAChoice",
        message: chalk.magenta("🔹 Select the token you want to swap (source):"),
        choices: tokenChoices
      }
    ]);

    let tokenA;
    if (tokenAChoice !== "OTHER") {
      tokenA = availableTokens[tokenAChoice];
    } else {
      const { address: tokenAddress } = await inquirer.prompt([
        { type: "input", name: "address", message: chalk.magenta("🔹 Enter the token contract address:") }
      ]);
      const erc20Data = await fetchERC20Data(tokenAddress, provider);
      tokenA = {
        name: erc20Data.symbol,
        address: tokenAddress,
        decimals: erc20Data.decimals,
        native: false
      };
    }

    const { tokenBChoice } = await inquirer.prompt([
      {
        type: "list",
        name: "tokenBChoice",
        message: chalk.magenta("🔹 Select the token you want to receive (target):"),
        choices: tokenChoices
      }
    ]);

    let tokenB;
    if (tokenBChoice !== "OTHER") {
      tokenB = availableTokens[tokenBChoice];
    } else {
      const { address: tokenAddress } = await inquirer.prompt([
        { type: "input", name: "address", message: chalk.magenta("🔹 Enter the token contract address:") }
      ]);
      const erc20Data = await fetchERC20Data(tokenAddress, provider);
      tokenB = {
        name: erc20Data.symbol,
        address: tokenAddress,
        decimals: erc20Data.decimals,
        native: false
      };
    }

    const balanceA = await getTokenBalance(provider, currentWallet.address, tokenA);
    const balanceB = await getTokenBalance(provider, currentWallet.address, tokenB);

    console.log(chalk.magenta("💼 Current Balances:"));
    console.log(chalk.magenta(`   ${tokenA.name}: ${balanceA}`));
    console.log(chalk.magenta(`   ${tokenB.name}: ${balanceB}`));

    const { swapAmount } = await inquirer.prompt([
      {
        type: "input",
        name: "swapAmount",
        message: chalk.magenta(`🔹 How much ${tokenA.name} do you want to swap?`),
        validate: input => !isNaN(input) && Number(input) > 0 ? true : "Enter a positive number"
      }
    ]);

    await performSwap(currentWallet, tokenA, tokenB, swapAmount, provider);

    const newBalanceA = await getTokenBalance(provider, currentWallet.address, tokenA);
    const newBalanceB = await getTokenBalance(provider, currentWallet.address, tokenB);

    console.log(chalk.magenta("💼 Balances After Swap:"));
    console.log(chalk.magenta(`   ${tokenA.name}: ${newBalanceA}`));
    console.log(chalk.magenta(`   ${tokenB.name}: ${newBalanceB}`));

    const { doAnother } = await inquirer.prompt([
      { type: "confirm", name: "doAnother", message: chalk.magenta("🔄 Do you want to perform another swap?"), default: false }
    ]);
    if (!doAnother) break;

    const { useSame } = await inquirer.prompt([
      { type: "confirm", name: "useSame", message: chalk.magenta("🔄 Use the same wallet?"), default: true }
    ]);
    useSameWallet = useSame;
    clear();
  } while (true);
}

main().catch(console.error);
