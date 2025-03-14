// swap.js - DirolSwap

const inquirer = require("inquirer");
const { ethers } = require("ethers");
const chalk = require("chalk");
const clear = require("console-clear");

const { ABI, TOKENS, ROUTER_CONTRACT } = require("./ABI");
const { RPC_URL, TX_EXPLORER } = require("../../utils/chain");
const wallets = require("../../utils/wallets.json");

// Construct availableTokens including native MON token
const availableTokens = {
  MON: { name: "MON", address: null, decimals: 18, native: true }
};
TOKENS.forEach(token => {
  availableTokens[token.symbol] = { ...token, native: false };
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function approveTokenIfNeeded(wallet, token, amount, routerAddress) {
  if (token.native) return;
  const erc20ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];
  const tokenContract = new ethers.Contract(token.address, erc20ABI, wallet);
  const allowance = await tokenContract.allowance(wallet.address, routerAddress);
  if (allowance.lt(amount)) {
    const gasLimit = Math.floor(Math.random() * (350000 - 250000 + 1)) + 250000;
    console.log(chalk.cyan(`💼 Approving ${token.name} for swap...`));
    const tx = await tokenContract.approve(routerAddress, ethers.constants.MaxUint256, { gasLimit });
    console.log(chalk.cyan(`🚀 Approval Tx sent: ${TX_EXPLORER}${tx.hash}`));
    await tx.wait();
    console.log(chalk.green(`✅ ${token.name} approved successfully.`));
    await sleep(1000);
  }
}

async function performSwap(wallet, provider, tokenA, tokenB, swapAmountInput, fee, slippageBps) {
  const routerContract = new ethers.Contract(ROUTER_CONTRACT, ABI, wallet);
  const amountIn = tokenA.native
    ? ethers.utils.parseEther(swapAmountInput)
    : ethers.utils.parseUnits(swapAmountInput, tokenA.decimals);

  // Calculate expected output (mintOut) based on swap type
  let expectedOut;
  if (tokenA.native && !tokenB.native) {
    expectedOut = await routerContract.calculateNativeToTokenAmountOutMin(tokenB.address, fee, amountIn, slippageBps);
  } else if (!tokenA.native && tokenB.native) {
    expectedOut = await routerContract.calculateTokenToNativeAmountOutMin(tokenA.address, fee, amountIn, slippageBps);
  } else if (!tokenA.native && !tokenB.native) {
    expectedOut = await routerContract.calculateAmountOutMin(tokenA.address, tokenB.address, fee, amountIn, slippageBps);
  } else {
    console.log(chalk.red("Swap between native tokens is not supported."));
    return;
  }

  const expectedOutHuman = tokenB.native
    ? ethers.utils.formatEther(expectedOut)
    : ethers.utils.formatUnits(expectedOut, tokenB.decimals);
  console.log(chalk.green(`\n💵 Expected minimum output: ${expectedOutHuman} ${tokenB.name}`));

  // Gas configuration
  const feeData = await provider.getFeeData();
  const maxFeePerGas = feeData.lastBaseFeePerGas.mul(110).div(100);
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas.mul(110).div(100);
  const gasLimit = Math.floor(Math.random() * (350000 - 250000 + 1)) + 250000;
  const txOverrides = {
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
  };

  // Approve tokenA if needed (for non-native tokens)
  if (!tokenA.native) {
    await approveTokenIfNeeded(wallet, tokenA, amountIn, ROUTER_CONTRACT);
  }

  const { confirmSwap } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmSwap",
      message: `🔄 Proceed to swap ${swapAmountInput} ${tokenA.name} for at least ${expectedOutHuman} ${tokenB.name}?`,
      default: true,
    }
  ]);
  if (!confirmSwap) {
    console.log(chalk.yellow("⚠️ Swap canceled."));
    return;
  }

  let tx;
  const currentTime = Math.floor(Date.now() / 1000);
  const deadline = currentTime + 3600; // 1 hour deadline

  if (tokenA.native && !tokenB.native) {
    console.log(chalk.cyan("Executing swapExactNativeForTokens..."));
    tx = await routerContract.swapExactNativeForTokens(tokenB.address, fee, expectedOut, { value: amountIn, ...txOverrides });
  } else if (!tokenA.native && tokenB.native) {
    console.log(chalk.cyan("Executing swapExactTokensForNative..."));
    tx = await routerContract.swapExactTokensForNative(tokenA.address, fee, amountIn, expectedOut, txOverrides);
  } else if (!tokenA.native && !tokenB.native) {
    console.log(chalk.cyan("Executing token-to-token swap..."));
    tx = await routerContract.swap(tokenA.address, tokenB.address, fee, amountIn, expectedOut, txOverrides);
  }

  console.log(chalk.cyan(`🚀 Swap Tx sent: ${TX_EXPLORER}${tx.hash}`));
  const receipt = await tx.wait();
  console.log(chalk.green(`✅ Swap confirmed in block ${receipt.blockNumber}`));
}

async function main() {
  clear();
  console.log(chalk.yellow("🔄 Welcome to DirolSwap!"));

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  // Wallet selection: All wallets or Specific wallet IDs
  const { walletOption } = await inquirer.prompt([
    {
      type: "list",
      name: "walletOption",
      message: "Select wallet option:",
      choices: [
        { name: "All wallets", value: "all" },
        { name: "Specific wallet IDs", value: "specific" }
      ]
    }
  ]);

  let selectedWallets;
  if (walletOption === "all") {
    selectedWallets = wallets;
  } else {
    const walletChoices = wallets.map(w => ({
      name: `Wallet ${w.id} - ${w.address}`,
      value: w
    }));
    const { chosenWallets } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "chosenWallets",
        message: "Select the wallets to perform the swap:",
        choices: walletChoices,
        validate: input => input.length > 0 ? true : "Select at least one wallet."
      }
    ]);
    selectedWallets = chosenWallets;
  }

  // Token selection menu: tokenA (given) and tokenB (received)
  const tokenChoices = Object.keys(availableTokens).map(key => ({
    name: availableTokens[key].name,
    value: key
  }));

  const { tokenASymbol } = await inquirer.prompt([
    {
      type: "list",
      name: "tokenASymbol",
      message: "Select the token you want to swap (token you give):",
      choices: tokenChoices
    }
  ]);
  const tokenA = availableTokens[tokenASymbol];

  const { tokenBSymbol } = await inquirer.prompt([
    {
      type: "list",
      name: "tokenBSymbol",
      message: "Select the token you want to receive (token you get):",
      choices: tokenChoices
    }
  ]);
  const tokenB = availableTokens[tokenBSymbol];

  const { swapAmount } = await inquirer.prompt([
    {
      type: "input",
      name: "swapAmount",
      message: `Enter the amount of ${tokenA.name} to swap:`,
      validate: input => !isNaN(input) && Number(input) > 0 ? true : "Enter a positive number"
    }
  ]);

  const { fee, slippageBps } = await inquirer.prompt([
    {
      type: "input",
      name: "fee",
      message: "Enter the fee (uint24) for the swap (e.g., 3000):",
      default: "3000",
      validate: input => !isNaN(input) && Number(input) > 0 ? true : "Enter a valid fee"
    },
    {
      type: "input",
      name: "slippageBps",
      message: "Enter the slippage (in bps) (e.g., 50):",
      default: "50",
      validate: input => !isNaN(input) && Number(input) >= 0 ? true : "Enter a valid slippage value"
    }
  ]);
  const feeValue = Number(fee);
  const slippageValue = Number(slippageBps);

  // Execute swap for each selected wallet
  for (let walletInfo of selectedWallets) {
    console.log(chalk.yellow(`\n💼 Processing swap for Wallet ${walletInfo.id} - ${walletInfo.address}`));
    const wallet = new ethers.Wallet(walletInfo.privateKey, provider);
    await performSwap(wallet, provider, tokenA, tokenB, swapAmount, feeValue, slippageValue);
  }
}

main().catch(error => {
  console.error(chalk.red("Error occurred:"), error);
});
