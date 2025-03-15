// index.js
// Este es el código principal de la aplicación para el módulo Nad.Domains

const inquirer = require('inquirer');
const chalk = require('chalk');
const { ethers } = require('ethers');

// Cargar configuración de la cadena (RPC, TX_EXPLORER, etc.)
const chain = require('../../utils/chain');
// Cargar wallets desde utils/wallets.json
const wallets = require('../../utils/wallets.json');

// Importar ABIs y direcciones de contrato
const {
  RegistrationABI,
  NameManagerABI,
  PriceOracleABI,
  REGISTRATION_CONTRACT_ADDRESS,
  NAME_MANAGER_CONTRACT_ADDRESS,
  PRICE_ORACLE_CONTRACT_ADDRESS
} = require('./ABI');

// Importar funciones de APIs: getSignatureToBuy y generateNames
const { getSignatureToBuy, generateNames } = require('./scripts/apis');

// Función auxiliar para obtener la configuración de gas
async function getGasConfig(provider) {
  // gasLimit aleatorio entre 350000 y 500000
  const gasLimit = Math.floor(Math.random() * (500000 - 350000 + 1)) + 350000;
  const latestBlock = await provider.getBlock("latest");
  const baseFee = latestBlock.baseFeePerGas || ethers.BigNumber.from(0);
  const maxFeePerGas = baseFee.mul(105).div(100);
  const maxPriorityFeePerGas = maxFeePerGas;
  return { gasLimit, maxFeePerGas, maxPriorityFeePerGas };
}

// Función para solicitar la selección de wallets
async function selectWallets() {
  const { walletSelection } = await inquirer.prompt([
    {
      type: 'list',
      name: 'walletSelection',
      message: 'What wallets would you like to use?',
      choices: [
        { name: '1. All of them', value: 'all' },
        { name: '2. Specific IDs', value: 'specific' }
      ]
    }
  ]);

  let selectedWallets = [];
  if (walletSelection === 'all') {
    selectedWallets = wallets;
  } else {
    const { ids } = await inquirer.prompt([
      {
        type: 'input',
        name: 'ids',
        message: 'Please enter the wallet IDs separated by spaces:',
      }
    ]);
    const idArray = ids.split(' ')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id));
    selectedWallets = wallets.filter(wallet => idArray.includes(wallet.id));
  }
  return { walletSelection, selectedWallets };
}

// Opción 1: Registrar un dominio
async function registerDomain(selectedWallets, walletSelectionType) {
  // Crear provider para la red
  const provider = new ethers.providers.JsonRpcProvider(chain.RPC_URL);
  // Obtener configuración de gas (la misma para las transacciones de registro y setPrimary)
  const gasConfig = await getGasConfig(provider);

  // Si se usan "All wallets", preguntar SOLO una vez si se desea ingresar manualmente el nombre
  let manualChoice;
  if (walletSelectionType === 'all') {
    const { manual } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'manual',
        message: 'Would you like to set domain name manually? (y/n)',
        default: false,
      }
    ]);
    manualChoice = manual;
  }

  // Si se usan "All wallets", se mezcla el orden de las wallets
  if (walletSelectionType === 'all') {
    selectedWallets.sort(() => Math.random() - 0.5);
  }

  for (const walletData of selectedWallets) {
    // Crear signer para la wallet
    const walletSigner = new ethers.Wallet(walletData.privateKey, provider);
    // Instanciar contratos necesarios
    const registrationContract = new ethers.Contract(REGISTRATION_CONTRACT_ADDRESS, RegistrationABI, walletSigner);
    const nameManagerContract = new ethers.Contract(NAME_MANAGER_CONTRACT_ADDRESS, NameManagerABI, provider);
    const priceOracleContract = new ethers.Contract(PRICE_ORACLE_CONTRACT_ADDRESS, PriceOracleABI, provider);

    let domainName;
    if (walletSelectionType === 'all') {
      if (manualChoice) {
        const { userInput } = await inquirer.prompt([
          {
            type: 'input',
            name: 'userInput',
            message: `Please enter your wished username for wallet [${walletData.address}]:`,
          }
        ]);
        domainName = userInput.trim();
      } else {
        console.log(chalk.yellow("Generating domain name automatically..."));
        try {
          const names = await generateNames();
          if (names && names.length > 0) {
            domainName = names[Math.floor(Math.random() * names.length)];
            console.log(chalk.green(`Generated domain name: ${domainName}`));
          } else {
            console.log(chalk.red("No names were generated, aborting domain registration."));
            return;
          }
        } catch (error) {
          console.error(chalk.red("Error generating domain name automatically:"), error);
          return;
        }
      }
    } else {
      // Para wallets específicas, se pregunta individualmente
      const { manual } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'manual',
          message: 'Would you like to set domain name manually for this wallet? (y/n)',
          default: false,
        }
      ]);
      if (manual) {
        const { userInput } = await inquirer.prompt([
          {
            type: 'input',
            name: 'userInput',
            message: 'Please enter your wished username:',
          }
        ]);
        domainName = userInput.trim();
      } else {
        console.log(chalk.yellow("Generating domain name automatically..."));
        try {
          const names = await generateNames();
          if (names && names.length > 0) {
            domainName = names[Math.floor(Math.random() * names.length)];
            console.log(chalk.green(`Generated domain name: ${domainName}`));
          } else {
            console.log(chalk.red("No names were generated, aborting domain registration."));
            return;
          }
        } catch (error) {
          console.error(chalk.red("Error generating domain name automatically:"), error);
          return;
        }
      }
    }

    // Verificar disponibilidad del dominio usando isNameAvailable
    let available = false;
    while (!available) {
      try {
        available = await nameManagerContract.isNameAvailable(domainName);
        if (!available) {
          console.log(chalk.red(`The domain "${domainName}" is not available. Please try another one.`));
          const { newName } = await inquirer.prompt([
            {
              type: 'input',
              name: 'newName',
              message: 'Please enter the domain name (without .nad):'
            }
          ]);
          domainName = newName.trim();
        }
      } catch (err) {
        console.error("Error checking domain availability:", err);
        return;
      }
    }

    // Obtener el precio del dominio usando getRegisteringPrice
    let priceData;
    try {
      priceData = await priceOracleContract.getRegisteringPrice(domainName);
      const basePrice = ethers.utils.formatUnits(priceData.base, 'ether');
      console.log(chalk.green(`Currently Domain Price is [${basePrice}] MON`));
    } catch (err) {
      console.error("Error getting domain price:", err);
      return;
    }

    // Obtener datos de la firma (nonce, deadline, signature) usando getSignatureToBuy
    let signatureData;
    try {
      signatureData = await getSignatureToBuy(domainName, walletData.address);
    } catch (err) {
      console.error("Error getting signature data:", err);
      return;
    }

    // Configurar parámetros para registerWithSignature
    const params = {
      name: domainName,
      nameOwner: walletData.address,
      setAsPrimaryName: true,
      referrer: "0x0000000000000000000000000000000000000000",
      discountKey: "0x0000000000000000000000000000000000000000000000000000000000000000",
      discountClaimProof: "0x0000000000000000000000000000000000000000000000000000000000000000",
      nonce: signatureData.nonce,
      deadline: signatureData.deadline
    };
    const signature = signatureData.signature;

    // Enviar transacción para registrar el dominio usando la configuración de gas obtenida
    try {
      console.log(chalk.blue(`🔵 Registering - [${domainName}.nad] domain For Wallet - [${walletData.address}]`));
      const tx = await registrationContract.registerWithSignature(params, signature, {
        gasLimit: gasConfig.gasLimit,
        maxFeePerGas: gasConfig.maxFeePerGas,
        maxPriorityFeePerGas: gasConfig.maxPriorityFeePerGas,
        value: priceData.base
      });
      console.log(chalk.magenta(`🚀 Registration Tx Sent! - [${chain.TX_EXPLORER}${tx.hash}]`));
      const receipt = await tx.wait();
      console.log(chalk.blue(`✅ Tx Confirmed in Block - [${receipt.blockNumber}]\n`));
    } catch (err) {
      console.error("Error during registration transaction:", err);
    }
  }
}

// Opción 2: Check Owned Domains usando getNamesOfAddress
async function checkOwnedDomains(selectedWallets) {
  const provider = new ethers.providers.JsonRpcProvider(chain.RPC_URL);
  const nameManagerContract = new ethers.Contract(NAME_MANAGER_CONTRACT_ADDRESS, NameManagerABI, provider);

  for (const walletData of selectedWallets) {
    try {
      const names = await nameManagerContract.getNamesOfAddress(walletData.address);
      console.log(chalk.blue(`📂 Wallet - [${walletData.address}] Currently owns the following domains:`));
      names.forEach(name => {
        console.log(chalk.green(`🔹 ${name}.nad`));
      });
    } catch (err) {
      console.error(`Error retrieving domains for wallet [${walletData.address}]:`, err);
    }
  }
}

// Opción 3: Set Primary Domain usando setPrimaryNameForAddress
async function setPrimaryDomain(selectedWallets) {
  const provider = new ethers.providers.JsonRpcProvider(chain.RPC_URL);
  // Obtener configuración de gas para la transacción de setPrimary
  const gasConfig = await getGasConfig(provider);

  for (const walletData of selectedWallets) {
    // Crear signer para la wallet (para ejecutar transacciones)
    const walletSigner = new ethers.Wallet(walletData.privateKey, provider);
    const nameManagerContract = new ethers.Contract(NAME_MANAGER_CONTRACT_ADDRESS, NameManagerABI, walletSigner);

    try {
      const names = await nameManagerContract.getNamesOfAddress(walletData.address);
      if (names.length === 0) {
        console.log(chalk.red(`No domains found for wallet [${walletData.address}].`));
        continue;
      }
      // Menú para seleccionar el dominio
      const { selectedDomain } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedDomain',
          message: `📌 Wallet - [${walletData.address}] Select one of the following domains to set as primary:`,
          choices: names.map(name => `${name}.nad`)
        }
      ]);
      // Remover la extensión .nad para la llamada al contrato
      const domainToSet = selectedDomain.replace('.nad', '');
      // Llamar a setPrimaryNameForAddress usando la configuración de gas obtenida
      const tx = await nameManagerContract.setPrimaryNameForAddress(walletData.address, domainToSet, {
        gasLimit: gasConfig.gasLimit,
        maxFeePerGas: gasConfig.maxFeePerGas,
        maxPriorityFeePerGas: gasConfig.maxPriorityFeePerGas
      });
      const receipt = await tx.wait();
      console.log(chalk.magenta(`📍 Wallet - [${walletData.address}] Selected primary domain set: [${selectedDomain}] in Block [${receipt.blockNumber}]`));
    } catch (err) {
      console.error(`Error setting primary domain for wallet [${walletData.address}]:`, err);
    }
  }
}

// Función principal que muestra el menú y maneja la selección
async function main() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '1. Register a Domain', value: 'register' },
        { name: '2. Check Owned Domains', value: 'check' },
        { name: '3. Set Primary Domain', value: 'setPrimary' }
      ]
    }
  ]);

  const { walletSelection, selectedWallets } = await selectWallets();

  if (action === 'register') {
    await registerDomain(selectedWallets, walletSelection);
  } else if (action === 'check') {
    await checkOwnedDomains(selectedWallets);
  } else if (action === 'setPrimary') {
    await setPrimaryDomain(selectedWallets);
  }
}

// Ejecutar la función principal
main().catch(err => {
  console.error("Unexpected error:", err);
});
