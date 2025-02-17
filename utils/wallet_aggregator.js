const fs = require('fs');
const inquirer = require('inquirer');
const ethers = require('ethers');

const loadWallets = () => {
  if (!fs.existsSync('wallets.json')) {
    fs.writeFileSync('wallets.json', JSON.stringify([]));
  }
  const data = fs.readFileSync('wallets.json', 'utf-8');
  return JSON.parse(data);
};

const saveWallets = (wallets) => {
  fs.writeFileSync('wallets.json', JSON.stringify(wallets, null, 2));
};

const addWallet = async () => {
  const wallets = loadWallets();
  const lastWalletId = wallets.length > 0 ? wallets[wallets.length - 1].id : 0;

  const { privateKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'privateKey',
      message: 'Please enter the private key for the new wallet:',
    },
  ]);

  // Ensure the private key starts with "0x"
  let formattedPrivateKey = privateKey.trim();
  if (!formattedPrivateKey.startsWith('0x')) {
    formattedPrivateKey = '0x' + formattedPrivateKey;
  }

  try {
    // Create the wallet using ethers
    const walletObj = new ethers.Wallet(formattedPrivateKey);
    const newWallet = {
      id: lastWalletId + 1,
      address: walletObj.address,
      privateKey: walletObj.privateKey,
    };

    wallets.push(newWallet);
    saveWallets(wallets);
    console.log('Wallet added and saved to wallets.json');
  } catch (error) {
    console.error('The provided private key is not valid. Please try again.');
  }
};

addWallet();
