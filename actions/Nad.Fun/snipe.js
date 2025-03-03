// snipe.js

const axios = require("axios");
const inquirer = require("inquirer");
const chalk = require("chalk");
const pLimit = require("p-limit"); // Use p-limit@2.3.0
const winston = require("winston");
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

// Configuration variables for take profit and stop loss (percentages)
const TAKE_PROFIT = 10; // 10%
const STOP_LOSS = 10;   // 10%

// Process one token at a time flag
const PROCESS_ONE_TOKEN_PER_TIME = true;

// Monitor delay in milliseconds (5 seconds)
const MONITOR_DELAY = 5000;

// File to store purchased tokens (tokens.json)
const TOKENS_FILE = path.join(__dirname, "tokens.json");

// Minimal ERC20 ABI for approve and allowance checks
const erc20Abi = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)"
];

// Global set to track tokens that have been processed for buying
const processedTokenIds = new Set();

// Functions to read and save tokens.json
function readTokens() {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const data = fs.readFileSync(TOKENS_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    logger.info(chalk.blue(`Error reading tokens file: ${err}`));
  }
  return [];
}

function saveTokens(tokens) {
  try {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
  } catch (err) {
    logger.info(chalk.blue(`Error writing tokens file: ${err}`));
  }
}

// Load configuration and data
const chain = require("../../utils/chain.js");
const wallets = require("../../utils/wallets.json");
const { ROUTER_CONTRACT, MON_CONTRACT, ABI } = require("./ABI.js");
const { getRecentLaunchedTokens } = require("./scripts/apis.js");

// Configure winston: timestamp with brackets in blue, message in blue.
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      info => `${chalk.blue(`[INFO][${info.timestamp}]`)} ${chalk.blue(info.message)}`
    )
  ),
  transports: [new winston.transports.Console()]
});

// Filter tokens launched in the last 60 seconds (1 minute)
function filterRecentTokens(orderTokens) {
  const currentTime = Math.floor(Date.now() / 1000);
  return orderTokens.filter(item => {
    const createdAt = item.token_info.created_at;
    return (currentTime - createdAt) <= 5;
  });
}

// Function to send approval (maxUint256) without logging details.
async function approveRouter(tokenAddress, signer) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);
    const currentAllowance = await tokenContract.allowance(await signer.getAddress(), ROUTER_CONTRACT);
    if (currentAllowance.eq(0)) {
      await tokenContract.approve(ROUTER_CONTRACT, ethers.constants.MaxUint256);
    }
  } catch (error) {
    // Silently ignore approval errors.
  }
}

// Function to buy tokens using protectBuy.
// Checks if the token was already purchased (or processed) and skips if so.
async function buyToken(wallet, tokenData, purchaseAmount) {
  const tokensBought = readTokens().map(r => r.contract_address.toLowerCase());
  const token = tokenData.token_info.token_id.toLowerCase();
  // Skip purchase if token is already recorded or has been processed
  if (tokensBought.includes(token) || processedTokenIds.has(token)) {
    return;
  }

  const provider = new ethers.providers.JsonRpcProvider(chain.RPC_URL);
  const signer = new ethers.Wallet(wallet.privateKey, provider);
  const routerContract = new ethers.Contract(ROUTER_CONTRACT, ABI, signer);

  const amountIn = purchaseAmount; // amount to buy (user input)
  const amountOutMin = 0;
  const fee = ethers.utils.parseUnits("0.01", "ether");
  const to = wallet.address;
  const deadline = Math.floor(Date.now() / 1000) + (6 * 3600);
  const totalValue = amountIn.add(fee);

  // Random gas limit between 250000 and 350000
  const randomGasLimit = Math.floor(Math.random() * (350000 - 250000 + 1)) + 250000;

  try {
    const tx = await routerContract.protectBuy(
      amountIn,
      amountOutMin,
      fee,
      token,
      to,
      deadline,
      { value: totalValue, gasLimit: randomGasLimit }
    );
    logger.info(`Wallet [${wallet.address}] Sent Tx Hash - [${chain.TX_EXPLORER}${tx.hash}]`);
    const receipt = await tx.wait();
    logger.info(`Tx Confirmed in Block - [${receipt.blockNumber}] for Wallet [${wallet.address}]`);

    // Immediately approve the router for the purchased token (without logging)
    await approveRouter(token, signer);

    // Record the purchase in tokens.json
    const updatedTokens = readTokens();
    let record = updatedTokens.find(r => r.contract_address.toLowerCase() === token);
    if (record) {
      if (!record.used_wallets.includes(wallet.id)) {
        record.used_wallets.push(wallet.id);
      }
    } else {
      record = {
        contract_address: token,
        used_wallets: [wallet.id],
        bought_at: Math.floor(Date.now() / 1000),
        bought_at_price: tokenData.token_info.price
      };
      updatedTokens.push(record);
    }
    saveTokens(updatedTokens);
    // Mark token as processed so it won't be bought again
    processedTokenIds.add(token);
  } catch (error) {
    if (error && error.code === "CALL_EXCEPTION") {
      logger.info(`Error buying token for wallet [${wallet.address}]: CALL_EXCEPTION`);
    } else if (error && (error.message.includes("Signer had insufficient balance") || error.message.includes("INSUFFICIENT_FUNDS"))) {
      logger.info(`Wallet [${wallet.address}] is out of funds to buy tokens`);
    } else {
      logger.info(`Error buying token for wallet [${wallet.address}]: ${error}`);
    }
    // Mark token as processed even if purchase fails
    processedTokenIds.add(token);
  }
}

// Function to sell tokens using protectSell; before selling, check and approve if needed.
async function sellToken(wallet, tokenAddress) {
  const provider = new ethers.providers.JsonRpcProvider(chain.RPC_URL);
  const signer = new ethers.Wallet(wallet.privateKey, provider);
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);
  const routerContract = new ethers.Contract(ROUTER_CONTRACT, ABI, signer);

  try {
    const balance = await tokenContract.balanceOf(wallet.address);
    if (balance.gt(0)) {
      const currentAllowance = await tokenContract.allowance(wallet.address, ROUTER_CONTRACT);
      if (currentAllowance.eq(0)) {
        await tokenContract.approve(ROUTER_CONTRACT, ethers.constants.MaxUint256);
      }
      const amountIn = balance;
      const amountOutMin = 0;
      const to = wallet.address;
      const deadline = Math.floor(Date.now() / 1000) + (6 * 3600);
      const tx = await routerContract.protectSell(
        amountIn,
        amountOutMin,
        tokenAddress,
        to,
        deadline,
        { gasLimit: 200000 }
      );
      logger.info(`Wallet [${wallet.address}] Sent Sell Tx Hash - [${chain.TX_EXPLORER}${tx.hash}]`);
      const receipt = await tx.wait();
      logger.info(`Sell Tx Confirmed in Block - [${receipt.blockNumber}] for Wallet [${wallet.address}]`);
    }
  } catch (error) {
    if (error && error.code === "CALL_EXCEPTION") {
      logger.info(`Error selling token for wallet [${wallet.address}]: CALL_EXCEPTION`);
    } else {
      logger.info(`Error selling token for wallet [${wallet.address}]: ${error}`);
    }
  }
}

// Function to check and sell existing tokens from tokens.json if they are found in the API data.
// Also logs if a token reaches TP or SL.
async function sellExistingTokens(selectedWallets) {
  try {
    const orderTokens = await getRecentLaunchedTokens();
    const apiTokensMap = {};
    // Build a map for quick lookup: token_id => token_info
    orderTokens.forEach(t => {
      apiTokensMap[t.token_info.token_id.toLowerCase()] = t.token_info;
    });

    const tokensBought = readTokens();
    if (tokensBought.length === 0) return;

    for (const record of tokensBought) {
      const tokenId = record.contract_address.toLowerCase();
      if (apiTokensMap[tokenId]) {
        const tokenInfo = apiTokensMap[tokenId];
        const currentPrice = parseFloat(tokenInfo.price);
        const boughtPrice = parseFloat(record.bought_at_price);
        const profitThreshold = boughtPrice * (1 + TAKE_PROFIT / 100);
        const lossThreshold = boughtPrice * (1 - STOP_LOSS / 100);

        if (currentPrice >= profitThreshold) {
          logger.info(`[${tokenInfo.symbol}] Has reached TP Limit. Initializing Sell Orders...`);
        } else if (currentPrice <= lossThreshold) {
          logger.info(`[${tokenInfo.symbol}] Has reached SL Limit. Initializing Sell Orders...`);
        } else {
          continue; // Skip selling if neither condition is met.
        }

        // For each wallet that bought this token, sell it.
        for (const walletId of record.used_wallets) {
          const wallet = selectedWallets.find(w => w.id === walletId);
          if (wallet) {
            await sellToken(wallet, record.contract_address);
          }
        }
        // Remove the record once sold.
        const updated = tokensBought.filter(r => r.contract_address.toLowerCase() !== tokenId);
        saveTokens(updated);
      }
    }
  } catch (error) {
    // Silently ignore errors during sell check.
  }
}

async function main() {
  // Ask which wallets to use for sniping tokens.
  const { walletOption } = await inquirer.prompt([
    {
      type: "list",
      name: "walletOption",
      message: chalk.cyan("On which wallets would you like to snipe tokens?"),
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
        message: chalk.cyan("Enter wallet IDs separated by spaces:")
      }
    ]);
    const idArray = ids.split(/\s+/).map(Number);
    selectedWallets = wallets.filter(w => idArray.includes(w.id));
  }

  // Ask if the user wishes to sell existing tokens.
  const { sellExisting } = await inquirer.prompt([
    {
      type: "confirm",
      name: "sellExisting",
      message: chalk.cyan("Do you wish to sell existing tokens?"),
      default: false
    }
  ]);

  if (sellExisting) {
    await sellExistingTokens(selectedWallets);
  }

  // Ask for the purchase amount (amountIn) in MON (minimum 1 MON)
  const { purchaseAmountInput } = await inquirer.prompt([
    {
      type: "input",
      name: "purchaseAmountInput",
      message: chalk.cyan("How much would you like to buy on each account? (in MON, minimum 1 MON)"),
      validate: (value) => {
        const parsed = parseFloat(value);
        return (!isNaN(parsed) && parsed >= 1) || "Please enter a valid number (min 1 MON).";
      }
    }
  ]);
  const purchaseAmount = ethers.utils.parseUnits(purchaseAmountInput, 18);

  let cycleCount = 0;
  // Main loop: check for tokens every MONITOR_DELAY (5 seconds)
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  while (true) {
    logger.info("Searching Tokens to Snipe...");
    try {
      const orderTokens = await getRecentLaunchedTokens();
      const recentTokens = filterRecentTokens(orderTokens);
      
      if (recentTokens.length > 0) {
        // Filter out tokens that have already been purchased or processed.
        const tokensBought = readTokens().map(r => r.contract_address.toLowerCase());
        let tokensToProcess = recentTokens.filter(tokenData => {
          const tokenId = tokenData.token_info.token_id.toLowerCase();
          return !tokensBought.includes(tokenId) && !processedTokenIds.has(tokenId);
        });
        if (PROCESS_ONE_TOKEN_PER_TIME && tokensToProcess.length > 0) {
          tokensToProcess = [tokensToProcess[0]];
        }
        for (const tokenData of tokensToProcess) {
          const tokenInfo = tokenData.token_info;
          logger.info(`Token Found! - Project Data is - [${tokenInfo.name}] - [${tokenInfo.symbol}]`);
          logger.info(`Current Price is - [${tokenInfo.price}] MON`);
          logger.info(`Deployed on Market - [${tokenInfo.market_type}]`);
          logger.info("Sending Buying Transactions...");
          const limit = pLimit(10);
          const buyPromises = selectedWallets.map(wallet =>
            limit(() => buyToken(wallet, tokenData, purchaseAmount))
          );
          await Promise.all(buyPromises);
          logger.info("Buying transactions processed for this token.");
          // Mark token as processed
          processedTokenIds.add(tokenInfo.token_id.toLowerCase());
          if (PROCESS_ONE_TOKEN_PER_TIME) break;
        }
      }
    } catch (error) {
      // Silently ignore API errors.
    }
    cycleCount++;
    // Every 2 cycles (approximately 10 seconds) check existing tokens for selling conditions.
    if (cycleCount % 2 === 0) {
      try {
        await sellExistingTokens(selectedWallets);
      } catch (err) {
        // Silently ignore errors during sell check.
      }
    }
    await delay(MONITOR_DELAY);
  }
}

main();
