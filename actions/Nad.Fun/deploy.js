const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { ethers } = require("ethers");
const chalk = require("chalk");

// Load chain and wallet configuration
const chain = require("../../utils/chain.js");
const wallets = require("../../utils/wallets.json");

// Import factory contract details (FACTORY_CONTRACT and ABI)
const { FACTORY_CONTRACT, ABI } = require("./ABI.js");

// Import API functions from the local scripts folder
const { getTokenURI, getMetadataTokenURI } = require("./scripts/apis.js");

// Default fee value (in wei) as BigNumber (ejemplo: 0.03 MON)
const DEFAULT_FEE = ethers.BigNumber.from("30000000000000000");

// Extra adicional a enviar (0.02 MON)
const EXTRA_VALUE = ethers.utils.parseUnits("0.02", "ether");

// Minimum initial purchase: 3 MON (with 18 decimals)
const MIN_INITIAL_PURCHASE = ethers.utils.parseUnits("3", 18);

async function main() {
  try {
    const { walletId } = await inquirer.prompt([
      {
        type: "input",
        name: "walletId",
        message: chalk.blue("On which wallet ID would you like to deploy the token?"),
        validate: (value) =>
          (!isNaN(value) && Number(value) > 0) || "Please enter a valid numeric wallet ID.",
      },
    ]);

    // Find the selected wallet by ID
    const walletEntry = wallets.find((w) => w.id === Number(walletId));
    if (!walletEntry) {
      console.error(chalk.blue("❌ Wallet with the specified ID not found."));
      process.exit(1);
    }
    console.log(chalk.green(`✔ You have Selected Wallet - [${walletEntry.address}]`));

    // Prompt for the token logo image URL
    const { logoURL } = await inquirer.prompt([
      {
        type: "input",
        name: "logoURL",
        message: chalk.blue("Please Insert your Toin Logo in PNG or JPEG Format (URL):"),
        validate: (value) =>
          (/^https?:\/\//i.test(value)) || "Please enter a valid URL (starting with http:// or https://).",
      },
    ]);

    console.log(chalk.blue("⏳ Downloading token logo from URL..."));
    // Download the image using axios
    const imageResponse = await axios.get(logoURL, { responseType: "arraybuffer" });
    const ext = path.extname(logoURL).toLowerCase();
    let fileType;
    if (ext === ".png") {
      fileType = "image/png";
    } else if (ext === ".jpg" || ext === ".jpeg") {
      fileType = "image/jpeg";
    } else {
      console.error(chalk.blue("❌ Unsupported file type. Only PNG and JPEG are accepted."));
      process.exit(1);
    }
    const tempFileName = `temp_${Date.now()}${ext}`;
    const tempFilePath = path.join(__dirname, tempFileName);
    fs.writeFileSync(tempFilePath, imageResponse.data);
    const stats = fs.statSync(tempFilePath);
    const fileSize = stats.size;
    const fileName = tempFileName;

    console.log(chalk.blue("⏳ Uploading token logo and retrieving image URI..."));
    const imageURI = await getTokenURI(fileName, fileSize, fileType);
    console.log(chalk.green(`✔ Image URI received: ${imageURI}`));
    fs.unlinkSync(tempFilePath);

    // Prompt for token details
    const answers = await inquirer.prompt([
      { type: "input", name: "tokenName", message: chalk.blue("Please Insert your Toin Name:") },
      { type: "input", name: "tokenSymbol", message: chalk.blue("Please Insert your Token Symbol:") },
      { type: "input", name: "tokenDescription", message: chalk.blue("Please Insert your Token Description:") },
      {
        type: "input",
        name: "initialPurchase",
        message: chalk.blue("How much will be your initial purchase? (in MON)"),
        validate: (value) => {
          const parsed = parseFloat(value);
          return (!isNaN(parsed) && parsed > 0) || "Please enter a valid number greater than 0.";
        },
      },
    ]);

    console.log(chalk.blue("⏳ Creating and uploading metadata..."));
    const metadataTokenURI = await getMetadataTokenURI(
      answers.tokenName,
      answers.tokenSymbol,
      imageURI,
      answers.tokenDescription
    );
    console.log(chalk.green(`✔ Metadata Token URI received: ${metadataTokenURI}`));

    const amountIn = ethers.utils.parseUnits(answers.initialPurchase, 18);
    if (amountIn.lt(MIN_INITIAL_PURCHASE)) {
      console.error(chalk.blue(`❌ Initial purchase must be at least 3 MON. Provided: ${answers.initialPurchase} MON`));
      process.exit(1);
    }

    console.log(chalk.blue(`🚀 Deploying Token - Name: [${answers.tokenName} with Symbol ${answers.tokenSymbol} and Initial Purchase of ${ethers.utils.formatUnits(amountIn, 18)} MON]`));

    const provider = new ethers.providers.JsonRpcProvider(chain.RPC_URL);
    const wallet = new ethers.Wallet(walletEntry.privateKey, provider);
    const randomGasLimit = Math.floor(Math.random() * (4000000 - 3000000 + 1)) + 3000000;
    const latestBlock = await provider.getBlock("latest");
    const baseFee = latestBlock.baseFeePerGas;
    const adjustedFee = baseFee.mul(105).div(100);

    const factoryContract = new ethers.Contract(FACTORY_CONTRACT, ABI, wallet);

    // Calculate total value: amountIn + fee + extra (0.02 MON)
    const totalValue = amountIn.add(DEFAULT_FEE).add(EXTRA_VALUE);

    const tx = await factoryContract.createCurve(
      wallet.address,         // creator
      answers.tokenName,      // name
      answers.tokenSymbol,    // symbol
      metadataTokenURI,       // tokenURI (metadata JSON URL)
      amountIn,               // initial purchase amount
      DEFAULT_FEE,            // fee (default)
      {
        gasLimit: randomGasLimit,
        maxFeePerGas: adjustedFee,
        maxPriorityFeePerGas: adjustedFee,
        value: totalValue      // Total = amountIn + fee + extra (0.02 MON)
      }
    );

    console.log(chalk.green(`🚀 Deploy Tx Hash Sent! - [${chain.TX_EXPLORER}${tx.hash}]`));
    const receipt = await tx.wait();
    console.log(chalk.green(`✅ Tx Confirmed in Block - [${receipt.blockNumber}]`));
    console.log(chalk.green("🎉 Token Successfully Deployed"));
  } catch (error) {
    console.error(chalk.blue("❌ Deployment failed:"), error);
    process.exit(1);
  }
}

main();
