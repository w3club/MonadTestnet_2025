const inquirer = require("inquirer");
const { ethers } = require("ethers");
const chalk = require("chalk");
const clear = require("console-clear");

const {
  KURU_UTILS_ABIS,
  KURU_UTILS_ADDRESS,
  ROUTER_ABIS,
  MON_ADDRESS,
  WMON_ADDRESS,
  ROUTER_ADDRESS
} = require("./ABI");

const STANDARD_TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)"
];

const { RPC_URL, TX_EXPLORER } = require("../../utils/chain");
const wallets = require("../../utils/wallets.json");
const { filterMarketPools } = require("./scripts/apis");

let tokenList = [
  { symbol: "MON", contract: MON_ADDRESS, decimals: 18, native: true },
  { symbol: "WMON", contract: WMON_ADDRESS, decimals: 18, native: false },
  { symbol: "CHOG", contract: "0xe0590015a873bf326bd645c3e1266d4db41c4e6b", decimals: 6, native: false },
  { symbol: "DAK", contract: "0x0F0BDEbF0F83cD1EE3974779Bcb7315f9808c714", decimals: 6, native: false },
  { symbol: "YAKI", contract: "0xfe140e1dCe99Be9F4F15d657CD9b7BF622270C50", decimals: 6, native: false },
  { symbol: "Other", contract: null, decimals: null, native: false }
];

async function getERC20Data(provider, tokenAddress) {
  const token = new ethers.Contract(tokenAddress, STANDARD_TOKEN_ABI, provider);
  const [name, symbol, decimals] = await Promise.all([
    token.name(),
    token.symbol(),
    token.decimals()
  ]);
  return { name, symbol, decimals };
}

async function approveTokenIfNeeded(wallet, tokenAddress, amount, spender) {
  const token = new ethers.Contract(tokenAddress, STANDARD_TOKEN_ABI, wallet);
  const allowance = await token.allowance(wallet.address, spender);
  if (allowance.lt(amount)) {
    const tokenData = await getERC20Data(wallet.provider, tokenAddress);
    console.log(chalk.cyan(`Approving token [${tokenData.symbol}] for router usage...`));
    const tx = await token.approve(spender, ethers.constants.MaxUint256);
    await tx.wait();
    console.log(chalk.cyan("Token approved."));
  }
}

async function getTokenBalance(provider, wallet, token) {
  if (token.native) {
    return ethers.utils.formatEther(await provider.getBalance(wallet.address));
  } else {
    const contract = new ethers.Contract(token.contract, STANDARD_TOKEN_ABI, provider);
    let formatted = ethers.utils.formatUnits(await contract.balanceOf(wallet.address), token.decimals);
    if (token.symbol === "CHOG" || token.symbol === "DAK") {
      // Adjust the value by dividing by 1e12 to show a human-readable balance
      formatted = (parseFloat(formatted) / 1e12).toFixed(5);
    }
    return formatted;
  }
}

async function chooseWallet(provider) {
  const { walletChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "walletChoice",
      message: "On which addresses would you like to operate?",
      choices: [
        { name: "All Wallets", value: "all" },
        { name: "Specific ID", value: "specific" }
      ]
    }
  ]);
  let selectedWallets = [];
  if (walletChoice === "all") {
    selectedWallets = wallets.map(w => new ethers.Wallet(w.privateKey, provider));
  } else {
    const { walletId } = await inquirer.prompt([
      {
        type: "input",
        name: "walletId",
        message: "Please insert the wallet ID to use:",
        validate: input => !isNaN(input) && Number(input) > 0 ? true : "Enter a valid wallet ID"
      }
    ]);
    const walletInfo = wallets.find(w => w.id === Number(walletId));
    if (!walletInfo) {
      console.log(chalk.red("Wallet not found."));
      process.exit(1);
    }
    selectedWallets.push(new ethers.Wallet(walletInfo.privateKey, provider));
  }
  return selectedWallets[0];
}

async function chooseTokens(provider) {
  const { sourceTokenChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "sourceTokenChoice",
      message: "Select the source token:",
      choices: tokenList.map(t => ({ name: t.symbol, value: t.symbol }))
    }
  ]);
  let sourceToken = tokenList.find(t => t.symbol === sourceTokenChoice);
  if (sourceTokenChoice === "Other") {
    const { contract } = await inquirer.prompt([
      { type: "input", name: "contract", message: "Enter token contract address:" }
    ]);
    const data = await getERC20Data(provider, contract);
    sourceToken = { symbol: data.symbol, contract, decimals: data.decimals, native: false };
  }
  const { targetTokenChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "targetTokenChoice",
      message: "Select the target token:",
      choices: tokenList.map(t => ({ name: t.symbol, value: t.symbol }))
    }
  ]);
  let targetToken = tokenList.find(t => t.symbol === targetTokenChoice);
  if (targetTokenChoice === "Other") {
    const { contract } = await inquirer.prompt([
      { type: "input", name: "contract", message: "Enter token contract address:" }
    ]);
    const data = await getERC20Data(provider, contract);
    targetToken = { symbol: data.symbol, contract, decimals: data.decimals, native: false };
  }
  return { sourceToken, targetToken };
}

async function runSwap(provider, activeWallet) {
  clear();
  const { sourceToken, targetToken } = await chooseTokens(provider);

  const sourceBalanceBefore = await getTokenBalance(provider, activeWallet, sourceToken);
  const targetBalanceBefore = await getTokenBalance(provider, activeWallet, targetToken);
  console.log(chalk.green(`Wallet selected: [${activeWallet.address}]`));
  console.log(chalk.green(`${sourceToken.symbol} balance: ${sourceBalanceBefore}`));
  console.log(chalk.green(`${targetToken.symbol} balance: ${targetBalanceBefore}`));

  const { swapAmountInput } = await inquirer.prompt([
    {
      type: "input",
      name: "swapAmountInput",
      message: `Enter the amount of ${sourceToken.symbol} to swap:`,
      validate: input => !isNaN(input) && Number(input) > 0 ? true : "Enter a positive number"
    }
  ]);

  let amountIn;
  if (sourceToken.native) {
    amountIn = ethers.utils.parseEther(swapAmountInput);
  } else {
    amountIn = ethers.utils.parseUnits(swapAmountInput, sourceToken.decimals);
  }

  const pair = {
    baseToken: sourceToken.contract,
    quoteToken: targetToken.contract
  };

  console.log(chalk.cyan("Querying pool for the pair..."));
  let poolResponse;
  try {
    poolResponse = await filterMarketPools([pair]);
  } catch (error) {
    console.error(chalk.red("Error filtering market pools:"), error);
    return;
  }

  let poolAddress;
  if (poolResponse.data && poolResponse.data.length > 0) {
    poolAddress = poolResponse.data[0].market;
  } else {
    console.log(chalk.yellow(`No pool found for [${sourceToken.symbol}/${targetToken.symbol}]. Trying inverted pair...`));
    const invertedPair = {
      baseToken: targetToken.contract,
      quoteToken: sourceToken.contract
    };
    let poolResponseInverted;
    try {
      poolResponseInverted = await filterMarketPools([invertedPair]);
    } catch (error) {
      console.error(chalk.red("Error filtering market pools (inverted):"), error);
      return;
    }
    if (poolResponseInverted.data && poolResponseInverted.data.length > 0) {
      poolAddress = poolResponseInverted.data[0].market;
      console.log(chalk.green(`Using inverted route for pool query [${targetToken.symbol}/${sourceToken.symbol}]`));
    } else {
      console.error(chalk.red(`No route found for Pool [${sourceToken.symbol}/${targetToken.symbol}] or its inversion.`));
      return;
    }
  }
  console.log(chalk.green("Pool address:"), poolAddress);

  // Calculate minAmountOut (here we can use a proper estimator, but for now we default to 1)
  // You can later integrate a price estimator or SDK method to get a more accurate value.
  const _minAmountOut = ethers.BigNumber.from("1");

  // Determine swap parameters
  let isBuy, nativeSend, debitToken, creditToken;
  if (sourceToken.symbol === "MON") {
    isBuy = [true];
    nativeSend = [true];
    debitToken = MON_ADDRESS;
    creditToken = targetToken.contract;
  } else if (targetToken.symbol === "MON") {
    isBuy = [false];
    nativeSend = [false];
    debitToken = sourceToken.contract;
    creditToken = MON_ADDRESS;
  } else {
    isBuy = [false];
    nativeSend = [false];
    debitToken = sourceToken.contract;
    creditToken = targetToken.contract;
  }

  if (!sourceToken.native && sourceToken.symbol !== "MON") {
    await approveTokenIfNeeded(activeWallet, sourceToken.contract, amountIn, ROUTER_ADDRESS);
  }
  if (!targetToken.native && targetToken.symbol === "MON") {
    await approveTokenIfNeeded(activeWallet, targetToken.contract, amountIn, ROUTER_ADDRESS);
  }

  const randomGasLimit = Math.floor(Math.random() * (280000 - 180000 + 1)) + 180000;
  const block = await provider.getBlock("latest");
  const baseFee = block.baseFeePerGas;
  const feeMultiplier = 1.15;
  const maxFeePerGas = baseFee.mul(Math.floor(feeMultiplier * 100)).div(100);
  const maxPriorityFeePerGas = maxFeePerGas;

  const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABIS, activeWallet);
  console.log(chalk.cyan(`Swapping ${swapAmountInput} ${sourceToken.symbol} for ${targetToken.symbol}...`));

  const txOverrides = {
    gasLimit: randomGasLimit,
    maxFeePerGas: maxFeePerGas,
    maxPriorityFeePerGas: maxPriorityFeePerGas,
    value: sourceToken.native ? amountIn : 0
  };

  try {
    const tx = await router.anyToAnySwap(
      [poolAddress],
      isBuy,
      nativeSend,
      debitToken,
      creditToken,
      amountIn,
      _minAmountOut,
      txOverrides
    );
    console.log(chalk.cyan(`Swap Tx sent! ${TX_EXPLORER}${tx.hash}`));
    const receipt = await tx.wait();
    console.log(chalk.cyan(`Tx confirmed in block ${receipt.blockNumber}`));
  } catch (error) {
    if (error.code === "CALL_EXCEPTION") {
      console.error(chalk.red("Swap transaction failed: CALL_EXCEPTION. Please check your inputs and try again."));
    } else {
      console.error(chalk.red("Swap transaction error:"), error);
    }
    return;
  }

  const sourceBalanceAfter = await getTokenBalance(provider, activeWallet, sourceToken);
  const targetBalanceAfter = await getTokenBalance(provider, activeWallet, targetToken);
  console.log(chalk.green("Balances after swap:"));
  console.log(chalk.green(`${sourceToken.symbol} balance: ${sourceBalanceAfter}`));
  console.log(chalk.green(`${targetToken.symbol} balance: ${targetBalanceAfter}`));
}

async function main() {
  clear();
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  let activeWallet = await chooseWallet(provider);
  let continueSwap = true;

  while (continueSwap) {
    await runSwap(provider, activeWallet);

    const { anotherSwap } = await inquirer.prompt([
      {
        type: "confirm",
        name: "anotherSwap",
        message: "Would you like to perform another swap?",
        default: false
      }
    ]);

    if (!anotherSwap) {
      continueSwap = false;
      console.log(chalk.cyan("Exiting swap."));
      break;
    }

    const { useSameWallet } = await inquirer.prompt([
      {
        type: "confirm",
        name: "useSameWallet",
        message: "Would you like to use the same wallet?",
        default: true
      }
    ]);

    if (!useSameWallet) {
      activeWallet = await chooseWallet(provider);
    }

    clear();
  }
}

main().catch(error => {
  console.error(chalk.red("Error:"), error);
});
