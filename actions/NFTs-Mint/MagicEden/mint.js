const { ethers } = require("ethers");
const inquirer = require("inquirer");
const chalk = require("chalk");
const pLimit = require("p-limit");
const chainConfig = require("../../../utils/chain.js");
const walletsData = require("../../../utils/wallets.json");
const { ABI } = require("./ABI");

// Global variable that may change if a CALL_EXCEPTION occurs and we retry with the alternate variant.
// Por defecto, usaremos "fourParams" sin importar el valor de MINT_PRICE.
let globalMintVariant = "fourParams";

function getRandomGasLimit(min = 180000, max = 280000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatUnixTimestamp(timestamp) {
  const date = new Date(Number(timestamp) * 1000);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");
  return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds} UTC`;
}

/**
 * Function to retrieve configuration with fallback tokenIds (0,1,2,3)
 */
async function getConfigWithFallback(contract) {
  let config;
  try {
    config = await contract.getConfig();
    if (!config.publicStage.price.eq(0)) {
      console.log(chalk.green("getConfig() without parameters succeeded and returned a nonzero price."));
      // Se ignora la variante devuelta por el contrato, forzamos el uso de "fourParams"
      return { config, variant: "fourParams" };
    } else {
      console.error(chalk.red("getConfig() without parameters returned a price of 0, trying fallback tokenIds."));
    }
  } catch (err) {
    console.error(chalk.red("getConfig() without parameters failed, trying fallback tokenIds."));
  }
  
  let fallbackConfig;
  const fallbackIds = [0, 1, 2, 3];
  for (let id of fallbackIds) {
    try {
      fallbackConfig = await contract["getConfig(uint256)"](id);
      console.log(chalk.green(`getConfig(uint256) with tokenId ${id} succeeded.`));
      if (!fallbackConfig.publicStage.price.eq(0)) {
        return { config: fallbackConfig, variant: "fourParams" };
      } else {
        console.error(chalk.red(`getConfig(uint256) with tokenId ${id} returned a price of 0.`));
      }
    } catch (err) {
      console.error(chalk.red(`getConfig(uint256) with tokenId ${id} failed: ${err.message}`));
    }
  }
  if (fallbackConfig) {
    console.log(chalk.yellow("All fallback getConfig calls returned a price of 0. Using the last returned config."));
    return { config: fallbackConfig, variant: "fourParams" };
  } else {
    throw new Error("Unable to retrieve configuration using getConfig fallback.");
  }
}

/**
 * Sends the mint transaction. If a CALL_EXCEPTION occurs at any stage, it retries with the alternate variant.
 */
async function sendMint(
  contractAddress,
  wallet,
  gasLimit,
  fee,
  explorerUrl,
  walletId,
  mintVariant,
  mintPrice
) {
  const contractWithWallet = new ethers.Contract(contractAddress, ABI, wallet);
  console.log(chalk.blue(`[#️⃣ ] Wallet ID - [${walletId}] is minting 1 NFT(s)`));

  let tx;
  let attemptedVariant = mintVariant;
  
  try {
    if (attemptedVariant === "fourParams") {
      tx = await contractWithWallet["mintPublic(address,uint256,uint256,bytes)"](
        wallet.address, 0, 1, "0x",
        { gasLimit, maxFeePerGas: fee, maxPriorityFeePerGas: fee, value: mintPrice }
      );
    } else {
      tx = await contractWithWallet["mintPublic(address,uint256)"](
        wallet.address, 1,
        { gasLimit, maxFeePerGas: fee, maxPriorityFeePerGas: fee, value: mintPrice }
      );
    }
    // Imprime inmediatamente el hash de la transacción
    console.log(chalk.green(`[🟢] Mint transaction sent! Wallet ID - [${walletId}] - [${explorerUrl}${tx.hash}]`));
    // Espera la confirmación en bloque
    const receipt = await tx.wait();
    console.log(chalk.magenta(`[✔] Transaction confirmed in Block - [${receipt.blockNumber}] for Wallet - [${walletId}]`));
  } catch (err) {
    if (err.code === ethers.errors.CALL_EXCEPTION || err.message.includes("CALL_EXCEPTION")) {
      console.error(chalk.red(`CALL_EXCEPTION for Wallet [${walletId}] using ${attemptedVariant}. Retrying with alternate variant...`));
      const alternateVariant = attemptedVariant === "twoParams" ? "fourParams" : "twoParams";
      try {
        if (alternateVariant === "fourParams") {
          tx = await contractWithWallet["mintPublic(address,uint256,uint256,bytes)"](
            wallet.address, 0, 1, "0x",
            { gasLimit, maxFeePerGas: fee, maxPriorityFeePerGas: fee, value: mintPrice }
          );
        } else {
          tx = await contractWithWallet["mintPublic(address,uint256)"](
            wallet.address, 1,
            { gasLimit, maxFeePerGas: fee, maxPriorityFeePerGas: fee, value: mintPrice }
          );
        }
        globalMintVariant = alternateVariant;
        // Imprime inmediatamente el hash de la transacción del reintento
        console.log(chalk.green(`[🟢] Mint transaction sent! Wallet ID - [${walletId}] - [${explorerUrl}${tx.hash}]`));
        const receipt = await tx.wait();
        console.log(chalk.magenta(`[✔] Transaction confirmed in Block - [${receipt.blockNumber}] for Wallet - [${walletId}]`));
      } catch (retryErr) {
        console.error(chalk.red(`[❌] CALL_EXCEPTION for Wallet [${walletId}] on retry with ${alternateVariant}`));
      }
    } else if (err.message.includes("INSUFFICIENT_FUNDS")) {
      console.error(chalk.yellow(`[⚠️ ] Wallet [${walletId}] is out of funds. Skipping...`));
    } else {
      console.error(chalk.red(`Error minting with Wallet [${walletId}]:`), err);
    }
  }
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(chainConfig.RPC_URL, chainConfig.CHAIN_ID);

  // Recopilamos los datos básicos de entrada.
  const inputResponses = await inquirer.prompt([
    {
      type: "list",
      name: "mintOption",
      message: "Choose your Minting Mode:",
      choices: ["Instant Mint", "Scheduled Mint"]
    },
    {
      type: "input",
      name: "contractAddress",
      message: "Please enter the NFT contract address you'd like to mint:"
    },
    {
      type: "confirm",
      name: "useContractPrice",
      message: "Do you want to retrieve MINT_PRICE from the contract?",
      default: true
    },
    {
      type: "list",
      name: "walletChoice",
      message: "Which wallets would you like to use for minting?",
      choices: ["All wallets", "Specific IDs"]
    },
    {
      type: "input",
      name: "walletIDs",
      message: "Enter wallet IDs separated by spaces:",
      when: answers => answers.walletChoice === "Specific IDs"
    }
  ]);

  // Se intenta obtener el MINT_PRICE desde el contrato.
  let finalConfig = null;
  if (inputResponses.useContractPrice) {
    try {
      const contractForConfig = new ethers.Contract(inputResponses.contractAddress, ABI, provider);
      const cfgResult = await getConfigWithFallback(contractForConfig);
      if (cfgResult) {
        finalConfig = cfgResult.config;
        console.log(chalk.green(`MINT_PRICE obtained from contract - [${ethers.utils.formatEther(finalConfig.publicStage.price)}] MON`));
      }
    } catch (err) {
      console.error(chalk.red("Error retrieving config from contract. We'll ask for manual MINT_PRICE."));
    }
  } else {
    console.log(chalk.yellow("Not retrieving MINT_PRICE from contract; manual input will be requested."));
  }

  // Si el contrato no devuelve un precio (o si devuelve 0), se solicita el ingreso manual.
  let mintPrice;
  if (finalConfig && !finalConfig.publicStage.price.eq(0)) {
    mintPrice = finalConfig.publicStage.price;
  } else {
    console.log(chalk.red("MINT_PRICE was not obtained from the contract or is 0. Please enter the MINT_PRICE manually (e.g. 0.01):"));
    const { manualPrice } = await inquirer.prompt([
      {
        type: "input",
        name: "manualPrice",
        message: "MINT_PRICE:",
        validate: input => !isNaN(input) && Number(input) >= 0
      }
    ]);
    mintPrice = ethers.utils.parseEther(manualPrice.toString());
  }
  
  // Se forzará el uso de "fourParams" por defecto, independientemente del valor de MINT_PRICE.
  globalMintVariant = "fourParams";
  console.log(chalk.blue(`MINT_PRICE is set to - [${ethers.utils.formatEther(mintPrice)}] MON`));

  // Para Scheduled Mint, se programa el inicio si el contrato dispone de startTime.
  if (inputResponses.mintOption === "Scheduled Mint" && finalConfig) {
    try {
      const startTime = finalConfig.publicStage.startTime.toNumber();
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime < startTime) {
        console.log(chalk.yellow("⏳ Scheduling Mint..."));
        console.log(chalk.yellow(`📆 Mint scheduled for - [${formatUnixTimestamp(startTime)}]`));
        const delay = (startTime - currentTime) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (err) {
      console.error(chalk.red("Error scheduling startTime."), err);
    }
  }

  // Se calcula la fee (igual para Instant Mint y Scheduled Mint)
  const latestBlock = await provider.getBlock("latest");
  const baseFee = latestBlock.baseFeePerGas;
  const fee = baseFee.mul(125).div(100);

  const gasLimit = getRandomGasLimit();
  console.log(chalk.yellow(`Using gasLimit: [${gasLimit}] globalMintVariant: [${globalMintVariant}]`));

  // Selección de wallets
  let selectedWallets;
  if (inputResponses.walletChoice === "All wallets") {
    selectedWallets = walletsData;
  } else {
    const ids = inputResponses.walletIDs.split(" ").map(id => Number(id));
    selectedWallets = walletsData.filter(w => ids.includes(w.id));
  }

  // Aumentamos p-limit a 20 para mayor concurrencia.
  const limit = pLimit(20);
  const explorerUrl = chainConfig.TX_EXPLORER;

  const tasks = selectedWallets.map(walletData =>
    limit(async () => {
      const wallet = new ethers.Wallet(walletData.privateKey, provider);
      await sendMint(
        inputResponses.contractAddress,
        wallet,
        gasLimit,
        fee,
        explorerUrl,
        walletData.id,
        globalMintVariant,
        mintPrice
      );
    })
  );
  await Promise.all(tasks);
}

main().catch(err => {
  console.error(chalk.red("Execution error:"), err);
});
