const { ethers } = require("ethers");
const chalk = require("chalk");
const { 
  ROUTER_CONTRACT, 
  WMON_CONTRACT, 
  USDC_CONTRACT, 
  BEAN_CONTRACT, 
  JAI_CONTRACT, 
  ABI 
} = require("./ABI");
const { RPC_URL, TX_EXPLORER } = require("../../utils/chain");
const wallets = require("../../utils/wallets.json");

const availableTokens = {
  MON: { name: "MON", address: null, decimals: 18, native: true },
  WMON: { name: "WMON", address: WMON_CONTRACT, decimals: 18, native: false },
  USDC: { name: "USDC", address: USDC_CONTRACT, decimals: 6, native: false },
  BEAN: { name: "BEAN", address: BEAN_CONTRACT, decimals: 18, native: false },
  JAI: { name: "JAI", address: JAI_CONTRACT, decimals: 18, native: false },
  CHOG: { name: "CHOG", address: "0xE0590015A873bF326bd645c3E1266d4db41C4E6B", decimals: 18, native: false },
  YAKI: { name: "YAKI", address: "0xfe140e1dCe99Be9F4F15d657CD9b7BF622270C50", decimals: 18, native: false }
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getTokenBalance(provider, walletAddress, token) {
  if (token.native) {
    const balance = await provider.getBalance(walletAddress);
    return ethers.utils.formatUnits(balance, token.decimals);
  } else {
    const erc20ABI = ["function balanceOf(address) view returns (uint256)"];
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
  const allowance = await tokenContract.allowance(wallet.address, routerAddress);
  if (allowance.lt(amount)) {
    const gasLimitForApprove = getRandomInt(250000, 350000);
    await tokenContract.approve(routerAddress, ethers.constants.MaxUint256, { gasLimit: gasLimitForApprove });
    await sleep(1000);
  }
}

async function performLiquidationSwap(wallet, fromToken, targetToken, provider) {
  const randomGasLimit = getRandomInt(250000, 350000);
  const feeData = await provider.getFeeData();
  const baseFee = feeData.lastBaseFeePerGas || ethers.utils.parseUnits("1", "gwei");
  const maxFeePerGas = baseFee.mul(110).div(100);
  const priorityFee = feeData.maxPriorityFeePerGas || ethers.utils.parseUnits("2", "gwei");
  const maxPriorityFeePerGas = priorityFee.mul(110).div(100);
  const currentTime = Math.floor(Date.now() / 1000);
  const deadline = currentTime + 6 * 3600;

  // Obtener balance completo (para tokens nativos, reservar 0.005 para gas)
  let balanceStr = await getTokenBalance(provider, wallet.address, fromToken);
  let amountIn;
  if (fromToken.native) {
    const reserve = ethers.utils.parseEther("0.005");
    let rawBalance = ethers.utils.parseEther(balanceStr);
    if (rawBalance.lte(reserve)) return null;
    amountIn = rawBalance.sub(reserve);
  } else {
    amountIn = ethers.utils.parseUnits(balanceStr, fromToken.decimals);
  }

  if (!fromToken.native) {
    await approveTokenIfNeeded(wallet, fromToken, amountIn, ROUTER_CONTRACT);
  }

  // Caso especial: WMON -> MON usa withdraw
  if (!fromToken.native && targetToken.native && fromToken.name === "WMON") {
    const wmonContract = new ethers.Contract(WMON_CONTRACT, ["function withdraw(uint256)"], wallet);
    const tx = await wmonContract.withdraw(amountIn, { gasLimit: randomGasLimit });
    const receipt = await tx.wait();
    return { txHash: tx.hash, blockNumber: receipt.blockNumber };
  }

  // Definir ruta de swap para otros casos
  let path = [];
  if (fromToken.native && !targetToken.native) {
    path.push(WMON_CONTRACT);
    path.push(targetToken.address);
  } else if (!fromToken.native && targetToken.native) {
    path.push(fromToken.address);
    path.push(WMON_CONTRACT);
  } else if (!fromToken.native && !targetToken.native) {
    path.push(fromToken.address);
    path.push(targetToken.address);
  } else {
    return null;
  }

  const routerContract = new ethers.Contract(ROUTER_CONTRACT, ABI, wallet);
  const amountsOut = await routerContract.getAmountsOut(amountIn, path);
  const expectedOut = amountsOut[amountsOut.length - 1];
  const txOverrides = {
    gasLimit: randomGasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas
  };

  let tx;
  if (fromToken.native && !targetToken.native) {
    tx = await routerContract.swapExactETHForTokens(
      expectedOut,
      path,
      wallet.address,
      deadline,
      { value: amountIn, ...txOverrides }
    );
  } else if (!fromToken.native && targetToken.native) {
    tx = await routerContract.swapExactTokensForETH(
      amountIn,
      expectedOut,
      path,
      wallet.address,
      deadline,
      txOverrides
    );
  } else if (!fromToken.native && !targetToken.native) {
    tx = await routerContract.swapExactTokensForTokens(
      amountIn,
      expectedOut,
      path,
      wallet.address,
      deadline,
      txOverrides
    );
  }

  const receipt = await tx.wait();
  return { txHash: tx.hash, blockNumber: receipt.blockNumber };
}

async function liquidateWallet(wallet, provider, targetToken) {
  console.log(chalk.cyan(`Checking Balances For Wallet - [${wallet.address}]`));
  console.log(chalk.cyan(`Swapping Existing Token Assets for ${targetToken.name}\n`));

  for (let key of Object.keys(availableTokens)) {
    let token = availableTokens[key];
    if (token.name === targetToken.name) continue;
    let balanceBefore = await getTokenBalance(provider, wallet.address, token);
    // Saltar tokens con balance cero
    if (Number(balanceBefore) === 0) continue;

    let targetBalanceBefore = await getTokenBalance(provider, wallet.address, targetToken);

    console.log(chalk.magenta(`Balance ${token.name} before Swap - [${balanceBefore}]`));
    console.log(chalk.magenta(`Balance ${targetToken.name} before Swap - [${targetBalanceBefore}]`));
    console.log(chalk.yellow(`Swap - [${token.name}/${targetToken.name}]`));

    try {
      const swapResult = await performLiquidationSwap(wallet, token, targetToken, provider);
      if (swapResult) {
        console.log(chalk.cyan(`Tx Hash Sent! - [${TX_EXPLORER}${swapResult.txHash}]`));
        console.log(chalk.cyan(`Tx Confirmed In Block - [${swapResult.blockNumber}]`));
      } else {
        console.log(chalk.red(`Swap could not be executed for ${token.name} -> ${targetToken.name}.`));
      }
    } catch (err) {
      if (err.message.includes("Signer had insufficient balance")) {
        console.error(chalk.red("Swap can't be processed becuase wallet is out of Funds"));
      } else if (err.message.includes("CALL_EXCEPTION")) {
        console.error(chalk.red("Transaction Failed with CALL_EXCEPTION"));
      } else {
        console.error(chalk.red(`Liquidation swap failed for ${token.name} -> ${targetToken.name}: ${err.message}`));
      }
      await sleep(2000);
      continue;
    }

    let balanceAfter = await getTokenBalance(provider, wallet.address, token);
    let targetBalanceAfter = await getTokenBalance(provider, wallet.address, targetToken);

    console.log(chalk.magenta(`Balance ${token.name} after Swap - [${balanceAfter}]`));
    console.log(chalk.magenta(`Balance ${targetToken.name} after Swap - [${targetBalanceAfter}]\n`));

    // Demora de 2 segundos entre cada swap
    await sleep(2000);
  }
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  // Token objetivo fijado a MON
  const targetToken = availableTokens.MON;
  for (let w of wallets) {
    const wallet = new ethers.Wallet(w.privateKey, provider);
    await liquidateWallet(wallet, provider, targetToken);
  }
  console.log(chalk.green("\nLiquidation process completed."));
}

main().catch(console.error);
