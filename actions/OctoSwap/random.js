const { ethers } = require("ethers");
const chalk = require("chalk");
const clear = require("console-clear");
const { RPC_URL, TX_EXPLORER } = require("../../utils/chain");
const wallets = require("../../utils/wallets.json");
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

const availableTokens = {
  MON:   { name: "MON",   address: null,           decimals: 18, native: true  },
  WMON:  { name: "WMON",  address: WMON_CONTRACT,  decimals: 18, native: false },
  USDC:  { name: "USDC",  address: USDC_CONTRACT,  decimals: 6,  native: false },
  DAK:   { name: "DAK",   address: DAK_CONTRACT,   decimals: 18, native: false },
  USDT:  { name: "USDT",  address: USDT_CONTRACT,  decimals: 6,  native: false },
  TEST1: { name: "TEST1", address: TEST1_CONTRACT, decimals: 18, native: false },
  TEST2: { name: "TEST2", address: TEST2_CONTRACT, decimals: 18, native: false }
};

const tokenKeys = Object.keys(availableTokens);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function truncateToDecimals(amountString, decimals) {
  const floatVal = parseFloat(amountString);
  return floatVal.toFixed(decimals);
}

function formatAmount(amount) {
  const num = Number(amount);
  return (Math.floor(num * 1000) / 1000).toString();
}

async function getTokenBalance(provider, walletAddress, token) {
  if (token.native) {
    const balanceBN = await provider.getBalance(walletAddress);
    return ethers.utils.formatUnits(balanceBN, token.decimals);
  } else {
    const erc20ABI = ["function balanceOf(address) view returns (uint256)"];
    const tokenContract = new ethers.Contract(token.address, erc20ABI, provider);
    const balanceBN = await tokenContract.balanceOf(walletAddress);
    return ethers.utils.formatUnits(balanceBN, token.decimals);
  }
}

async function approveTokenIfNeeded(wallet, token, amountBN, routerAddress) {
  if (token.native) return;
  const erc20ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];
  const tokenContract = new ethers.Contract(token.address, erc20ABI, wallet);
  const currentAllowance = await tokenContract.allowance(wallet.address, routerAddress);
  if (currentAllowance.lt(amountBN)) {
    const gasLimitForApprove = getRandomInt(250000, 350000);
    console.log(chalk.magenta(`🔐 Approving [${token.name}]...`));
    await tokenContract.approve(routerAddress, ethers.constants.MaxUint256, { gasLimit: gasLimitForApprove });
    await sleep(1000);
    console.log(chalk.magenta(`✅ [${token.name}] Approved.`));
  }
}

async function performSwap(wallet, tokenA, tokenB, swapAmountInput, provider) {
  const randomGasLimit = getRandomInt(250000, 350000);
  if (tokenA.native && tokenB.name === "WMON") {
    const amountIn = ethers.utils.parseEther(swapAmountInput);
    const wmonContract = new ethers.Contract(WMON_CONTRACT, ["function deposit() payable"], wallet);
    console.log(chalk.magenta("💰 [DEPOSIT] Converting MON to WMON via deposit..."));
    const tx = await wmonContract.deposit({ value: amountIn, gasLimit: randomGasLimit });
    console.log(chalk.blue(`🚀 [TX SENT] ${TX_EXPLORER}${tx.hash}`));
    const receipt = await tx.wait();
    console.log(chalk.blue(`✔️  [CONFIRMED] Block: ${receipt.blockNumber}`));
    return;
  }
  if (tokenA.name === "WMON" && tokenB.native) {
    const amountIn = ethers.utils.parseUnits(swapAmountInput, tokenA.decimals);
    const wmonContract = new ethers.Contract(WMON_CONTRACT, ["function withdraw(uint256)"], wallet);
    console.log(chalk.magenta("💸 [WITHDRAW] Converting WMON to MON..."));
    const tx = await wmonContract.withdraw(amountIn, { gasLimit: randomGasLimit });
    console.log(chalk.blue(`🚀 [TX SENT] ${TX_EXPLORER}${tx.hash}`));
    const receipt = await tx.wait();
    console.log(chalk.blue(`✔️  [CONFIRMED] Block: ${receipt.blockNumber}`));
    return;
  }
  const routerContract = new ethers.Contract(ROUTER_CONTRACT, ABI.router, wallet);
  const deadline = Math.floor(Date.now() / 1000) + 6 * 3600;
  const path = [
    tokenA.native ? WMON_CONTRACT : tokenA.address,
    tokenB.native ? WMON_CONTRACT : tokenB.address
  ];
  let amountIn;
  if (tokenA.native) {
    amountIn = ethers.utils.parseEther(swapAmountInput);
  } else {
    amountIn = ethers.utils.parseUnits(swapAmountInput, tokenA.decimals);
  }
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
  const baseFee = feeData.lastBaseFeePerGas || ethers.utils.parseUnits("1", "gwei");
  const maxFeePerGas = baseFee.mul(110).div(100);
  const priorityFee = feeData.maxPriorityFeePerGas || ethers.utils.parseUnits("2", "gwei");
  const maxPriorityFeePerGas = priorityFee.mul(110).div(100);
  const txOverrides = {
    gasLimit: randomGasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas
  };
  let tx;
  if (tokenA.native) {
    tx = await routerContract.swapExactETHForTokens(expectedOut, path, wallet.address, deadline, {
      value: amountIn,
      ...txOverrides
    });
  } else if (tokenB.native) {
    tx = await routerContract.swapExactTokensForETH(amountIn, expectedOut, path, wallet.address, deadline, txOverrides);
  } else {
    tx = await routerContract.swapExactTokensForTokens(amountIn, expectedOut, path, wallet.address, deadline, txOverrides);
  }
  console.log(chalk.magenta(`🔄 [SWAP] Executing [${tokenA.name} -> ${tokenB.name}]...`));
  console.log(chalk.blue(`🚀 [TX SENT] ${TX_EXPLORER}${tx.hash}`));
  const receipt = await tx.wait();
  console.log(chalk.blue(`✔️  [CONFIRMED] Block: ${receipt.blockNumber}`));
}

function pickRandomSwap(tokensWithBalance, lastSwap) {
  const wmonToken = tokensWithBalance.find(t => t.name === "WMON");
  if (tokensWithBalance.length === 1 && tokensWithBalance[0].name === "MON") {
    const possibleTokens = Object.values(availableTokens).filter(
      t => t.name !== "MON"
    );
    let chosen;
    const tries = 5;
    for (let i = 0; i < tries; i++) {
      chosen = possibleTokens[getRandomInt(0, possibleTokens.length - 1)];
      if (!lastSwap || lastSwap.tokenA !== "MON" || lastSwap.tokenB !== chosen.name) {
        break;
      }
    }
    return { tokenA: availableTokens.MON, tokenB: chosen };
  }
  let possibleSources = tokensWithBalance;
  if (lastSwap) {
    possibleSources = possibleSources.filter(t => t.name !== lastSwap.tokenA);
    if (possibleSources.length === 0) {
      possibleSources = tokensWithBalance;
    }
  }
  const tokenA = possibleSources[getRandomInt(0, possibleSources.length - 1)];
  let possibleTargets;
  if (tokenA.name === "MON") {
    possibleTargets = tokensWithBalance.filter(t => t.name !== "MON");
    const otherTokens = Object.values(availableTokens).filter(t => t.name !== "MON");
    if (possibleTargets.length === 0) {
      possibleTargets = otherTokens;
    } else {
      possibleTargets = [...new Set([...possibleTargets, ...otherTokens])];
    }
  } else if (tokenA.name === "WMON") {
    possibleTargets = [availableTokens.MON];
  } else {
    const notAllowed = ["WMON", tokenA.name];
    possibleTargets = tokensWithBalance.filter(t => !notAllowed.includes(t.name));
    if (possibleTargets.length === 0) {
      possibleTargets = Object.values(availableTokens).filter(
        x => !notAllowed.includes(x.name)
      );
    }
  }
  if (lastSwap) {
    possibleTargets = possibleTargets.filter(t => t.name !== lastSwap.tokenB);
    if (possibleTargets.length === 0) {
      possibleTargets = Object.values(availableTokens).filter(t => t.name !== tokenA.name);
    }
  }
  const tokenB = possibleTargets[getRandomInt(0, possibleTargets.length - 1)];
  return { tokenA, tokenB };
}

async function chooseSwapAmount(tokenA, tokenB, provider, walletAddress) {
  if (tokenA.native && tokenB.name !== "WMON") {
    const minVal = 0.02;
    const maxVal = 0.08;
    const randomVal = (Math.random() * (maxVal - minVal)) + minVal;
    return randomVal.toFixed(5);
  }
  if (!tokenA.native && tokenB.native && tokenA.name !== "WMON") {
    const balStr = await getTokenBalance(provider, walletAddress, tokenA);
    const balNum = Number(balStr);
    const fraction = getRandomInt(50, 70) / 100;
    const rawVal = balNum * fraction;
    return truncateToDecimals(String(rawVal), tokenA.decimals);
  }
  if (!tokenA.native && !tokenB.native && tokenA.name !== "WMON" && tokenB.name !== "WMON") {
    const balStr = await getTokenBalance(provider, walletAddress, tokenA);
    const balNum = Number(balStr);
    const fraction = getRandomInt(50, 70) / 100;
    const rawVal = balNum * fraction;
    return truncateToDecimals(String(rawVal), tokenA.decimals);
  }
  if (tokenA.native && tokenB.name === "WMON") {
    const minVal = 0.02;
    const maxVal = 0.08;
    const randomVal = (Math.random() * (maxVal - minVal)) + minVal;
    return randomVal.toFixed(5);
  }
  if (tokenA.name === "WMON" && tokenB.native) {
    const balStr = await getTokenBalance(provider, walletAddress, tokenA);
    const balNum = Number(balStr);
    const fraction = getRandomInt(50, 70) / 100;
    const rawVal = balNum * fraction;
    return truncateToDecimals(String(rawVal), tokenA.decimals);
  }
  return "0.01";
}

// Función para barajar (shuffle) un array usando el algoritmo de Fisher-Yates
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function main() {
  clear();
  console.log(chalk.cyan.bold("🐙 OctoSwap Random Swaps 🐙"));
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  // Barajar las wallets para usarlas en orden aleatorio (asegurándose de usarlas todas)
  const shuffledWallets = shuffle([...wallets]);

  for (const w of shuffledWallets) {
    const wallet = new ethers.Wallet(w.privateKey, provider);
    console.log(chalk.yellow(`\nWallet [${wallet.address}]`));
    const swapsToDo = getRandomInt(5, 10);
    console.log(chalk.magenta(`Performing ${swapsToDo} random swaps...`));
    let lastSwap = null;
    for (let i = 1; i <= swapsToDo; i++) {
      console.log(chalk.blue(`\n🦑 [Swap #${i}]`));
      let tokensWithBalance = [];
      for (const key of tokenKeys) {
        const token = availableTokens[key];
        const bal = Number(await getTokenBalance(provider, wallet.address, token));
        if (bal > 0.000000001) {
          tokensWithBalance.push(token);
        }
      }
      if (tokensWithBalance.length === 0) {
        console.log(chalk.red("No tokens with positive balance. Stopping."));
        break;
      }
      const { tokenA, tokenB } = pickRandomSwap(tokensWithBalance, lastSwap);
      console.log(chalk.gray(`Swapping from [${tokenA.name}] to [${tokenB.name}]`));
      let swapAmountFormatted;
      try {
        swapAmountFormatted = await chooseSwapAmount(tokenA, tokenB, provider, wallet.address);
      } catch (err) {
        console.log(chalk.red(`Error choosing swap amount: ${err.message}`));
        continue;
      }
      const balanceA_Before = await getTokenBalance(provider, wallet.address, tokenA);
      const balanceB_Before = await getTokenBalance(provider, wallet.address, tokenB);
      console.log(chalk.gray(`Before Swap - [${tokenA.name}]: ${balanceA_Before}`));
      console.log(chalk.gray(`Before Swap - [${tokenB.name}]: ${balanceB_Before}`));
      try {
        console.log(chalk.blue(`Swap amount: ${swapAmountFormatted} ${tokenA.name}`));
        await performSwap(wallet, tokenA, tokenB, swapAmountFormatted, provider);
      } catch (err) {
        if (err.code === "CALL_EXCEPTION") {
          console.log(chalk.red("Transaction Failed due to CALL_EXCEPTION"));
        } else {
          console.log(chalk.red(`Swap failed: ${err.message}`));
        }
        continue;
      }
      const balanceA_After = await getTokenBalance(provider, wallet.address, tokenA);
      const balanceB_After = await getTokenBalance(provider, wallet.address, tokenB);
      console.log(chalk.gray(`After Swap - [${tokenA.name}]: ${balanceA_After}`));
      console.log(chalk.gray(`After Swap - [${tokenB.name}]: ${balanceB_After}`));
      lastSwap = { tokenA: tokenA.name, tokenB: tokenB.name };
      await sleep(2000);
    }
  }
  console.log(chalk.cyan.bold("\nAll random swaps completed successfully under new rules! 🐙"));
}

main().catch(error => {
  console.error(chalk.red("Unexpected error:"), error);
});
