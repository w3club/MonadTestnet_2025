// swap.js

const inquirer = require("inquirer");
const { ethers } = require("ethers");

// Load configuration and data
const chain = require("../../utils/chain.js");
const wallets = require("../../utils/wallets.json");
const { ROUTER_CONTRACT, MON_CONTRACT, ABI } = require("./ABI.js");

// Create a provider (common for all)
const provider = new ethers.providers.JsonRpcProvider(chain.RPC_URL);

// Helper: generate random integer between min and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: generate a random buy amount in MON between 0.5 and 1.0
function getRandomBuyAmount() {
  const randomFactor = 0.5 + Math.random() * 0.5; // from 0.5 to 1.0
  return ethers.utils.parseUnits(randomFactor.toFixed(4), "ether");
}

// Helper: get token symbol using ERC20's symbol() method
async function getTokenSymbol(tokenAddress) {
  const erc20Abi = ["function symbol() view returns (string)"];
  try {
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    return await tokenContract.symbol();
  } catch (error) {
    return "UNKNOWN";
  }
}

// Delay helper (ms)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to perform a buy swap using protectBuy
async function protectBuySwap(wallet, tokenAddress) {
  const signer = new ethers.Wallet(wallet.privateKey, provider);
  const routerContract = new ethers.Contract(ROUTER_CONTRACT, ABI, signer);

  const amountIn = getRandomBuyAmount(); // random between 0.5 and 1.0 MON
  const amountOutMin = 0;
  // Fee is now 1% of amountIn
  const fee = amountIn.mul(1).div(100);
  const to = wallet.address;
  const deadline = Math.floor(Date.now() / 1000) + 6 * 3600;
  const totalValue = amountIn.add(fee);
  
  // Random gas limit between 280000 and 380000
  const randomGasLimit = getRandomInt(280000, 380000);
  // Use provider fee data instead of manual calculation
  const feeData = await provider.getFeeData();
  const maxFee = feeData.maxFeePerGas;
  const priorityFee = feeData.maxPriorityFeePerGas;

  try {
    const tx = await routerContract.protectBuy(
      amountIn,
      amountOutMin,
      fee,
      tokenAddress,
      to,
      deadline,
      {
        value: totalValue,
        gasLimit: randomGasLimit,
        maxFeePerGas: maxFee,
        maxPriorityFeePerGas: priorityFee
      }
    );
    console.log(`👉 Wallet [${wallet.address}] is Buying [${await getTokenSymbol(tokenAddress)}]`);
    console.log(`🔄 Buying Tx Hash Sent! - [${chain.TX_EXPLORER}${tx.hash}]`);
    const receipt = await tx.wait();
    console.log(`🔗 Tx Confirmed in Block - [${receipt.blockNumber}] for Wallet [${wallet.address}]\n`);

    // Immediately approve router for the token (without printing)
    const erc20AbiForApprove = [
      "function approve(address,uint256) returns (bool)",
      "function allowance(address,address) view returns (uint256)"
    ];
    const tokenContract = new ethers.Contract(tokenAddress, erc20AbiForApprove, signer);
    const currentAllowance = await tokenContract.allowance(wallet.address, ROUTER_CONTRACT);
    if (currentAllowance.eq(0)) {
      // Use fee data for the approval transaction as well
      const feeDataApprove = await provider.getFeeData();
      await tokenContract.approve(ROUTER_CONTRACT, ethers.constants.MaxUint256, {
        gasLimit: getRandomInt(280000, 380000),
        maxFeePerGas: feeDataApprove.maxFeePerGas,
        maxPriorityFeePerGas: feeDataApprove.maxPriorityFeePerGas
      });
    }
  } catch (error) {
    console.log(`❌ Error during buying for wallet [${wallet.address}]: ${error}`);
  }
}

// Function to perform a sell swap using protectSell (sells 100% of token balance)
async function protectSellSwap(wallet, tokenAddress) {
  const signer = new ethers.Wallet(wallet.privateKey, provider);
  const routerContract = new ethers.Contract(ROUTER_CONTRACT, ABI, signer);

  const erc20AbiForToken = [
    "function balanceOf(address) view returns (uint256)",
    "function approve(address,uint256) returns (bool)",
    "function allowance(address,address) view returns (uint256)"
  ];
  const tokenContract = new ethers.Contract(tokenAddress, erc20AbiForToken, signer);

  try {
    const balance = await tokenContract.balanceOf(wallet.address);
    if (balance.isZero()) return;
    const currentAllowance = await tokenContract.allowance(wallet.address, ROUTER_CONTRACT);
    if (currentAllowance.eq(0)) {
      // Approve router if not already approved, using fee data from provider
      const feeDataApprove = await provider.getFeeData();
      await tokenContract.approve(ROUTER_CONTRACT, ethers.constants.MaxUint256, {
        gasLimit: getRandomInt(280000, 380000),
        maxFeePerGas: feeDataApprove.maxFeePerGas,
        maxPriorityFeePerGas: feeDataApprove.maxPriorityFeePerGas
      });
    }
    const amountIn = balance;
    const amountOutMin = 0;
    const to = wallet.address;
    const deadline = Math.floor(Date.now() / 1000) + 6 * 3600;
    
    const randomGasLimit = getRandomInt(280000, 380000);
    const feeData = await provider.getFeeData();
    const maxFee = feeData.maxFeePerGas;
    const priorityFee = feeData.maxPriorityFeePerGas;
    
    const tx = await routerContract.protectSell(
      amountIn,
      amountOutMin,
      tokenAddress,
      to,
      deadline,
      {
        gasLimit: randomGasLimit,
        maxFeePerGas: maxFee,
        maxPriorityFeePerGas: priorityFee
      }
    );
    console.log(`👉  Wallet [${wallet.address}] is Selling [${await getTokenSymbol(tokenAddress)}]`);
    console.log(`🔄  Selling Tx Hash Sent! - [${chain.TX_EXPLORER}${tx.hash}]`);
    const receipt = await tx.wait();
    console.log(`🔗 Tx Confirmed in Block - [${receipt.blockNumber}] for Wallet [${wallet.address}]\n`);
  } catch (error) {
    console.log(`❌ Error during selling for wallet [${wallet.address}]: ${error}`);
  }
}

async function main() {
  // Ask which wallets to use for trading.
  const { walletOption } = await inquirer.prompt([
    {
      type: "list",
      name: "walletOption",
      message: "On which wallets would you like to trade?",
      choices: [
        { name: "1. All of them", value: "all" },
        { name: "2. Specific IDs", value: "specific" }
      ]
    }
  ]);

  let selectedWallets = [];
  if (walletOption === "all") {
    selectedWallets = wallets;
  } else {
    const { ids } = await inquirer.prompt([
      {
        type: "input",
        name: "ids",
        message: "Enter wallet IDs separated by spaces:"
      }
    ]);
    const idArray = ids.split(/\s+/).map(Number);
    selectedWallets = wallets.filter(w => idArray.includes(w.id));
  }

  // Ask for token contract addresses to trade.
  const { tokenContractsInput } = await inquirer.prompt([
    {
      type: "input",
      name: "tokenContractsInput",
      message: "Enter token contract addresses separated by spaces:"
    }
  ]);
  const tokenContracts = tokenContractsInput.split(/\s+/).filter(addr => addr);

  // For each selected wallet, randomly choose one token and perform 2-5 swap transactions.
  for (const wallet of selectedWallets) {
    const chosenToken = tokenContracts[Math.floor(Math.random() * tokenContracts.length)];
    const symbol = await getTokenSymbol(chosenToken);
    const numSwaps = getRandomInt(4, 7);
    console.log(`⚡️ Wallet [${wallet.address}] will perform ${numSwaps} swap transactions on token [${symbol}]`);
    
    for (let i = 1; i <= numSwaps; i++) {
      if (i === numSwaps) {
        // Last swap: always sell.
        await protectSellSwap(wallet, chosenToken);
      } else {
        if (i % 2 === 1) {
          await protectBuySwap(wallet, chosenToken);
        } else {
          await protectSellSwap(wallet, chosenToken);
        }
      }
      // 5-second delay between each swap
      await delay(5000);
    }
  }
}

main();
