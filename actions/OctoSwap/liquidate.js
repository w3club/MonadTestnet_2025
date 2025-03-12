const { ethers } = require("ethers");
const chalk = require("chalk");
const { 
  ROUTER_CONTRACT, 
  WMON_CONTRACT, 
  USDC_CONTRACT, 
  USDT_CONTRACT, 
  TEST1_CONTRACT, 
  TEST2_CONTRACT,
  ABI
} = require("./ABI");
const { RPC_URL, TX_EXPLORER } = require("../../utils/chain");
const wallets = require("../../utils/wallets.json");

const availableTokens = {
  MON:   { name: "MON",   address: null,              decimals: 18, native: true  },
  WMON:  { name: "WMON",  address: WMON_CONTRACT,     decimals: 18, native: false },
  USDC:  { name: "USDC",  address: USDC_CONTRACT,     decimals: 6,  native: false },
  USDT:  { name: "USDT",  address: USDT_CONTRACT,     decimals: 6,  native: false },
  TEST1: { name: "TEST1", address: TEST1_CONTRACT,    decimals: 18, native: false },
  TEST2: { name: "TEST2", address: TEST2_CONTRACT,    decimals: 18, native: false }
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
    console.log(chalk.magenta(`🔑 [APPROVAL] Approving ${token.name}...`));
    await tokenContract.approve(routerAddress, ethers.constants.MaxUint256, { gasLimit: gasLimitForApprove });
    await sleep(1000);
    console.log(chalk.magenta(`✅ [APPROVAL] ${token.name} approved.`));
  }
}

async function performLiquidationSwap(wallet, fromToken, targetToken, provider) {
  const randomGasLimit = getRandomInt(250000, 350000);
  const currentTime = Math.floor(Date.now() / 1000);
  const deadline = currentTime + 6 * 3600;

  let balanceStr = await getTokenBalance(provider, wallet.address, fromToken);
  if (Number(balanceStr) === 0) return null;
  const amountIn = ethers.utils.parseUnits(balanceStr, fromToken.decimals);

  // Caso especial: si el token es WMON y el objetivo es MON (token nativo)
  if (!fromToken.native && targetToken.native && fromToken.name === "WMON") {
    const wmonContract = new ethers.Contract(WMON_CONTRACT, ["function withdraw(uint256)"], wallet);
    console.log(chalk.magenta(`💸 [WITHDRAW] Converting WMON to MON via withdraw...`));
    const tx = await wmonContract.withdraw(amountIn, { gasLimit: randomGasLimit });
    const receipt = await tx.wait();
    console.log(chalk.blue(`🚀 [TX SENT] ${TX_EXPLORER}${tx.hash}`));
    console.log(chalk.blue(`✔️  [CONFIRMED] Block: ${receipt.blockNumber}`));
    return { txHash: tx.hash, blockNumber: receipt.blockNumber };
  }

  // Para el resto de tokens, realizar swap mediante el router de OctoSwap
  await approveTokenIfNeeded(wallet, fromToken, amountIn, ROUTER_CONTRACT);

  // Definir la ruta de swap: en este caso, para pasar de tokenA a MON (nativo) se utiliza WMON como puente
  const path = [
    fromToken.address,
    targetToken.native ? WMON_CONTRACT : targetToken.address
  ];

  // Instanciar el contrato del router utilizando el ABI.router de OctoSwap
  const routerContract = new ethers.Contract(ROUTER_CONTRACT, ABI.router, wallet);
  const amountsOut = await routerContract.getAmountsOut(amountIn, path);
  const expectedOut = amountsOut[amountsOut.length - 1];

  const txOverrides = { gasLimit: randomGasLimit };

  console.log(chalk.magenta(`🔄 [SWAP] Swapping all ${fromToken.name} for ${targetToken.name}...`));
  // Como el token objetivo es MON (nativo), se utiliza swapExactTokensForETH
  const tx = await routerContract.swapExactTokensForETH(
    amountIn,
    expectedOut,
    path,
    wallet.address,
    deadline,
    txOverrides
  );
  console.log(chalk.blue(`🚀 [TX SENT] ${TX_EXPLORER}${tx.hash}`));
  const receipt = await tx.wait();
  console.log(chalk.blue(`✔️  [CONFIRMED] Block: ${receipt.blockNumber}`));

  return { txHash: tx.hash, blockNumber: receipt.blockNumber };
}

async function liquidateWallet(wallet, provider, targetToken) {
  console.log(chalk.cyan(`\nChecking Balances For Wallet - [${wallet.address}]`));
  console.log(chalk.cyan(`Swapping all tokens for ${targetToken.name}\n`));

  for (let key of Object.keys(availableTokens)) {
    let token = availableTokens[key];
    if (token.name === targetToken.name) continue; // Se salta el token objetivo (MON)
    let balanceBefore = await getTokenBalance(provider, wallet.address, token);
    if (Number(balanceBefore) === 0) continue;

    let targetBalanceBefore = await getTokenBalance(provider, wallet.address, targetToken);
    console.log(chalk.magenta(`Balance ${token.name} before Swap: ${balanceBefore}`));
    console.log(chalk.magenta(`Balance ${targetToken.name} before Swap: ${targetBalanceBefore}`));

    try {
      const swapResult = await performLiquidationSwap(wallet, token, targetToken, provider);
      if (swapResult) {
        console.log(chalk.cyan(`Tx Hash: ${TX_EXPLORER}${swapResult.txHash}`));
        console.log(chalk.cyan(`Confirmed in Block: ${swapResult.blockNumber}`));
      } else {
        console.log(chalk.red(`Swap could not be executed for ${token.name} -> ${targetToken.name}.`));
      }
    } catch (err) {
      console.error(chalk.red(`Error swapping ${token.name} -> ${targetToken.name}: ${err.message}`));
    }

    let balanceAfter = await getTokenBalance(provider, wallet.address, token);
    let targetBalanceAfter = await getTokenBalance(provider, wallet.address, targetToken);
    console.log(chalk.magenta(`Balance ${token.name} after Swap: ${balanceAfter}`));
    console.log(chalk.magenta(`Balance ${targetToken.name} after Swap: ${targetBalanceAfter}\n`));

    // Demora de 2 segundos entre cada swap
    await sleep(2000);
  }
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const targetToken = availableTokens.MON; // Token objetivo: MON
  for (let w of wallets) {
    const wallet = new ethers.Wallet(w.privateKey, provider);
    await liquidateWallet(wallet, provider, targetToken);
  }
  console.log(chalk.green("\nLiquidation process completed."));
}

main().catch(console.error);
