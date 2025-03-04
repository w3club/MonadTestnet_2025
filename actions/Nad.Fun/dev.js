// dev.js

const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { ethers } = require("ethers");
const chalk = require("chalk");
const pLimit = require("p-limit");

// Load chain and wallet configuration
const chain = require("../../utils/chain.js");
const wallets = require("../../utils/wallets.json");

// Import factory contract details (FACTORY_CONTRACT, ROUTER_CONTRACT and ABI)
const { FACTORY_CONTRACT, ROUTER_CONTRACT, ABI } = require("./ABI.js");

// Import API functions from the local scripts folder
const { getTokenURI, getMetadataTokenURI } = require("./scripts/apis.js");

// Deployment constants
const DEFAULT_FEE = ethers.BigNumber.from("30000000000000000"); // 0.03 MON in wei
const EXTRA_VALUE = ethers.utils.parseUnits("0.02", "ether");      // 0.02 MON extra
const MIN_INITIAL_PURCHASE = ethers.utils.parseUnits("1", "ether"); // Minimum 1 MON

// Buying transaction variables
const MIN_BUY = ethers.utils.parseUnits("1", "ether");   // 1 MON
const MAX_BUY = ethers.utils.parseUnits("1.3", "ether");   // 1.3 MON
const MAX_TX_PER_WALLET = 1;  // Maximum transactions per wallet

// Create a provider (for deployment and swaps)
const provider = new ethers.providers.JsonRpcProvider(chain.RPC_URL);

// Helper: generate random integer between min and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: download image from URL and return its details
async function downloadImage(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const ext = path.extname(url).toLowerCase();
  let fileType;
  if (ext === ".png") {
    fileType = "image/png";
  } else if (ext === ".jpg" || ext === ".jpeg") {
    fileType = "image/jpeg";
  } else {
    throw new Error("Unsupported file type. Only PNG and JPEG are accepted.");
  }
  const tempFileName = `temp_${Date.now()}${ext}`;
  const tempFilePath = path.join(__dirname, tempFileName);
  fs.writeFileSync(tempFilePath, response.data);
  const stats = fs.statSync(tempFilePath);
  return { tempFileName, tempFilePath, fileType, fileSize: stats.size };
}

async function main() {
  // 1. Ask for the deployer wallet ID.
  const { deployWalletId } = await inquirer.prompt([
    {
      type: "input",
      name: "deployWalletId",
      message: chalk.blue("On which wallet ID would you like to deploy the token?"),
      validate: value => (!isNaN(value) && Number(value) > 0) || "Please enter a valid numeric wallet ID."
    }
  ]);
  const deployWalletEntry = wallets.find(w => w.id === Number(deployWalletId));
  if (!deployWalletEntry) {
    console.error(chalk.green("❌ Wallet with the specified ID not found."));
    process.exit(1);
  }
  console.log(chalk.green(`✔ You have selected wallet [${deployWalletEntry.address}] for deployment.`));

  // 2. Ask for token logo URL.
  const { logoURL } = await inquirer.prompt([
    {
      type: "input",
      name: "logoURL",
      message: chalk.blue("Please insert your Toin Logo in PNG or JPEG Format (URL):"),
      validate: value => /^https?:\/\//i.test(value) || "Please enter a valid URL."
    }
  ]);
  console.log(chalk.blue("⏳ Downloading token logo from URL..."));
  const { tempFileName, tempFilePath, fileType, fileSize } = await downloadImage(logoURL);
  console.log(chalk.blue("⏳ Uploading token logo and retrieving image URI..."));
  const imageURI = await getTokenURI(tempFileName, fileSize, fileType);
  console.log(chalk.green(`✔ Image URI received: ${imageURI}`));
  fs.unlinkSync(tempFilePath);

  // 3. Ask for token details.
  const answers = await inquirer.prompt([
    { type: "input", name: "tokenName", message: chalk.blue("Please insert your Toin Name:") },
    { type: "input", name: "tokenSymbol", message: chalk.blue("Please insert your Token Symbol:") },
    { type: "input", name: "tokenDescription", message: chalk.blue("Please insert your Token Description:") },
    {
      type: "input",
      name: "initialPurchase",
      message: chalk.blue("How much will be your initial purchase? (in MON)"),
      validate: value => (!isNaN(parseFloat(value)) && parseFloat(value) > 0) || "Enter a valid number greater than 0."
    }
  ]);

  // 3.1 Ask for buyer wallet IDs.
  const { buyerWalletIDs } = await inquirer.prompt([
    {
      type: "input",
      name: "buyerWalletIDs",
      message: chalk.blue("Enter wallet IDs for buying the deployed token (separated by spaces):"),
      validate: value => {
        const ids = value.split(/\s+/).map(Number);
        if (ids.some(isNaN)) return "Please enter valid wallet IDs.";
        return true;
      }
    }
  ]);
  const buyerIDs = buyerWalletIDs.split(/\s+/).map(Number);
  const buyerWallets = wallets.filter(w => buyerIDs.includes(w.id));
  if (buyerWallets.length === 0) {
    console.error(chalk.green("❌ No valid buyer wallets found."));
    process.exit(1);
  }

  console.log(chalk.blue("⏳ Creating and uploading metadata..."));
  const metadataTokenURI = await getMetadataTokenURI(
    answers.tokenName,
    answers.tokenSymbol,
    imageURI,
    answers.tokenDescription
  );
  console.log(chalk.green(`✔ Metadata Token URI received: ${metadataTokenURI}`));

  const amountIn = ethers.utils.parseUnits(answers.initialPurchase, "ether");
  if (amountIn.lt(MIN_INITIAL_PURCHASE)) {
    console.error(chalk.green(`❌ Initial purchase must be at least 1 MON. Provided: ${answers.initialPurchase} MON`));
    process.exit(1);
  }

  console.log(chalk.blue(`🚀 Deploying Token - Name: [${answers.tokenName}] Symbol: [${answers.tokenSymbol}] with Initial Purchase of [${ethers.utils.formatUnits(amountIn, "ether")} MON]`));
  const deployProvider = new ethers.providers.JsonRpcProvider(chain.RPC_URL);
  const deployWallet = new ethers.Wallet(deployWalletEntry.privateKey, deployProvider);
  const randomGasLimit = Math.floor(Math.random() * (4000000 - 3000000 + 1)) + 3000000;
  const latestBlock = await deployProvider.getBlock("latest");
  const baseFee = latestBlock.baseFeePerGas;
  const adjustedFee = baseFee.mul(105).div(100);
  const factoryContract = new ethers.Contract(FACTORY_CONTRACT, ABI, deployWallet);

  // Calculate total value: amountIn + DEFAULT_FEE + EXTRA_VALUE
  const totalValue = amountIn.add(DEFAULT_FEE).add(EXTRA_VALUE);

  // Call createCurve (payable) to deploy the token.
  const tx = await factoryContract.createCurve(
    deployWallet.address,
    answers.tokenName,
    answers.tokenSymbol,
    metadataTokenURI,
    amountIn,
    DEFAULT_FEE,
    {
      gasLimit: randomGasLimit,
      maxFeePerGas: adjustedFee,
      maxPriorityFeePerGas: adjustedFee,
      value: totalValue
    }
  );
  console.log(chalk.green(`🚀 Deploy Tx Hash Sent! - [${chain.TX_EXPLORER}${tx.hash}]`));
  const receipt = await tx.wait();
  console.log(chalk.green(`✅ Tx Confirmed in Block - [${receipt.blockNumber}]`));

  // Retrieve deployed token address from the first Transfer event (mint)
  // Se asume que se emite un evento Transfer con "from" igual a 0x000...0
  const transferSignature = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  const mintEvent = receipt.events.find(e =>
    e.topics &&
    e.topics[0] === transferSignature &&
    e.topics[1] === "0x0000000000000000000000000000000000000000000000000000000000000000"
  );
  const deployedToken = mintEvent ? mintEvent.address : null;
  if (!deployedToken) {
    console.error(chalk.green("❌ Could not retrieve the deployed token address from the transaction receipt."));
    process.exit(1);
  }
  console.log(chalk.green(`🎉 Token Successfully Deployed: ${deployedToken}`));

  // Process buying transactions concurrently (up to 10 wallets at a time)
  const pLimitInstance = pLimit(10);
  const buyPromises = buyerWallets.map(wallet =>
    pLimitInstance(async () => {
      for (let i = 0; i < MAX_TX_PER_WALLET; i++) {
        // Generate a random buy amount between MIN_BUY and MAX_BUY
        const randomBuyAmount = ethers.utils.parseUnits(
          (Math.random() * (1.3 - 1) + 1).toFixed(4),
          "ether"
        );
        const fee = randomBuyAmount.mul(1).div(100); // 1% fee
        const amountOutMin = 0;
        const to = wallet.address;
        const deadline = Math.floor(Date.now() / 1000) + 6 * 3600;
        const totalValue = randomBuyAmount.add(fee);
        const randomGasLimit = getRandomInt(280000, 380000);
        const latestBlock = await provider.getBlock("latest");
        const adjustedFee = latestBlock.baseFeePerGas.mul(105).div(100);

        const signer = new ethers.Wallet(wallet.privateKey, provider);
        // Usamos la constante ROUTER_CONTRACT importada desde ABI.js
        const routerContract = new ethers.Contract(ROUTER_CONTRACT, ABI, signer);
        try {
          console.log(chalk.blue(`Insider ID - [${wallet.id}] is buying the deployed token...`));
          const tx = await routerContract.protectBuy(
            randomBuyAmount,
            amountOutMin,
            fee,
            deployedToken,
            to,
            deadline,
            {
              value: totalValue,
              gasLimit: randomGasLimit,
              maxFeePerGas: adjustedFee,
              maxPriorityFeePerGas: adjustedFee
            }
          );
          console.log(chalk.green(`Tx Sent: [${chain.TX_EXPLORER}${tx.hash}]`));
          const txReceipt = await tx.wait();
          console.log(chalk.green(`Tx Confirmed in Block [${txReceipt.blockNumber}] for Wallet [${wallet.address}]`));
        } catch (error) {
          console.log(chalk.green(`❌ Error in buying for wallet [${wallet.address}]: ${error}`));
        }
      }
    })
  );
  await Promise.all(buyPromises);

  // Finalizamos el script una vez confirmadas las transacciones de compra.
  process.exit(0);
}

main().catch(console.error);
