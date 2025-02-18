const inquirer = require('inquirer');
const ethers = require('ethers');
const colors = require('colors');
const fs = require('fs');
const path = require('path');
const abiData = require('./ABI.js');

const chain = require('../../utils/chain');

// Utility: sleep for ms milliseconds
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility: random integer between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Create ethers provider using chain RPC URL
const provider = new ethers.providers.JsonRpcProvider(chain.RPC_URL);

async function main() {
  const { option } = await inquirer.prompt([
    {
      type: 'list',
      name: 'option',
      message: 'Select an option:',
      choices: [
        { name: '1. Claim Testnet Tokens', value: 'claim' },
        { name: '2. Stake Assets', value: 'stake' },
        { name: '0. Exit', value: 'exit' }
      ]
    }
  ]);

  if (option === 'exit') {
    console.log("🚪 Exiting Multipli...".green);
    process.exit(0);
  }

  // Prompt for wallet selection
  const { walletChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'walletChoice',
      message: 'On which wallets would you like to perform this action?',
      choices: [
        { name: 'All wallets', value: 'all' },
        { name: 'Specific IDs', value: 'specific' }
      ]
    }
  ]);

  // Load wallets from utils/wallets.json
  const walletsPath = path.resolve(__dirname, '../../utils/wallets.json');
  let wallets = [];
  try {
    wallets = JSON.parse(fs.readFileSync(walletsPath, 'utf8'));
  } catch (err) {
    console.error("❌ Error reading wallets.json".red, err);
    process.exit(1);
  }
  let selectedWallets = [];
  if (walletChoice === 'all') {
    selectedWallets = wallets;
  } else {
    const { walletIDs } = await inquirer.prompt([
      {
        type: 'input',
        name: 'walletIDs',
        message: 'Enter wallet IDs separated by spaces (e.g., 1 3 5):'
      }
    ]);
    const ids = walletIDs
      .trim()
      .split(/\s+/)
      .map(id => parseInt(id))
      .filter(id => !isNaN(id));
    selectedWallets = wallets.filter(w => ids.includes(w.id));
  }
  if (selectedWallets.length === 0) {
    console.log("⚠️  No wallets selected.".yellow);
    process.exit(0);
  }

  if (option === 'claim') {
    // Option 1: Claim Testnet Tokens – claim both tokens in random order per wallet
    const tokens = [abiData.USDC_CONTRACT, abiData.USDT_CONTRACT];
    for (const walletInfo of selectedWallets) {
      console.log(`\n🔔 Processing wallet: [${walletInfo.address}]`.green);
      const wallet = new ethers.Wallet(walletInfo.privateKey, provider);
      const faucetContract = new ethers.Contract(
        abiData.FAUCET_CONTRACT,
        abiData.FAUCET_ABI,
        wallet
      );
      // Randomize order of tokens for this wallet
      const shuffledTokens = [...tokens].sort(() => Math.random() - 0.5);
      for (const tokenChoice of shuffledTokens) {
        // Determine token ticket based on contract address
        let tokenTicket;
        if (tokenChoice.toLowerCase() === abiData.USDC_CONTRACT.toLowerCase()) {
          tokenTicket = "USDC";
        } else if (tokenChoice.toLowerCase() === abiData.USDT_CONTRACT.toLowerCase()) {
          tokenTicket = "USDT";
        } else {
          tokenTicket = tokenChoice;
        }
        console.log(`💰 Wallet [${walletInfo.address}] is claiming token: ${tokenTicket}`.green);

        // Prepare gas settings
        const block = await provider.getBlock('latest');
        const baseFee = block.baseFeePerGas || ethers.BigNumber.from(0);
        const maxFeePerGas = baseFee.mul(115).div(100);
        const maxPriorityFeePerGas = baseFee.mul(115).div(100);
        const gasLimit = randomInt(100000, 250000);
        try {
          const tx = await faucetContract.claimToken(tokenChoice, {
            gasLimit,
            maxFeePerGas,
            maxPriorityFeePerGas
          });
          console.log(`🚀 Claim Tx Sent for token ${tokenTicket}: ${tx.hash}`.magenta);
          const receipt = await tx.wait();
          console.log(`✅ Claim Tx Confirmed for token ${tokenTicket}: ${receipt.transactionHash}`.magenta);
        } catch (error) {
          if (error.message && error.message.includes("insufficient balance")) {
            const balance = await wallet.getBalance();
            console.error(`❌ Wallet [${walletInfo.address}] is out of funds. Balance: ${ethers.utils.formatEther(balance)} ${chain.SYMBOL}`.red);
          } else {
            console.error(`❌ Error for wallet [${walletInfo.address}] on token ${tokenTicket}: ${error.message}`.red);
          }
        }
        await sleep(2000); // 2-second delay between each token claim
      }
      await sleep(2000); // 2-second delay between wallets
    }
  } else if (option === 'stake') {
    // Option 2: Stake Assets – stake 100% of the balance for each asset in each wallet
    const assets = [abiData.USDC_CONTRACT, abiData.USDT_CONTRACT];
    for (const walletInfo of selectedWallets) {
      console.log(`\n💎 Staking assets for wallet: [${walletInfo.address}]`.green);
      const wallet = new ethers.Wallet(walletInfo.privateKey, provider);
      // Randomize asset order for staking
      const shuffledAssets = [...assets].sort(() => Math.random() - 0.5);
      for (const tokenAddress of shuffledAssets) {
        // Determine token ticket based on contract address
        let tokenTicket;
        if (tokenAddress.toLowerCase() === abiData.USDC_CONTRACT.toLowerCase()) {
          tokenTicket = "USDC";
        } else if (tokenAddress.toLowerCase() === abiData.USDT_CONTRACT.toLowerCase()) {
          tokenTicket = "USDT";
        } else {
          tokenTicket = tokenAddress;
        }
        // Get token balance
        const tokenContract = new ethers.Contract(tokenAddress, abiData.ERC20_ABI, wallet);
        let balance;
        try {
          balance = await tokenContract.balanceOf(wallet.address);
        } catch (err) {
          console.error(`❌ Error fetching balance for token ${tokenTicket}: ${err.message}`.red);
          continue;
        }
        if (balance.isZero()) {
          console.log(`⚠️  No balance for token ${tokenTicket} in wallet [${walletInfo.address}].`.yellow);
          continue;
        }
        console.log(`🪙 Staking 100% of balance for token ${tokenTicket}: ${balance.toString()}`.green);
        if (!abiData.STAKE_CONTRACT || abiData.STAKE_CONTRACT === "") {
          console.log("⚠️  Stake contract not configured. Skipping staking for this asset.".yellow);
          continue;
        }
        const stakeContract = new ethers.Contract(abiData.STAKE_CONTRACT, abiData.STAKE_ABI, wallet);
        // Prepare gas settings
        const block = await provider.getBlock('latest');
        const baseFee = block.baseFeePerGas || ethers.BigNumber.from(0);
        const maxFeePerGas = baseFee.mul(115).div(100);
        const maxPriorityFeePerGas = baseFee.mul(115).div(100);
        const gasLimit = randomInt(100000, 250000);
        try {
          const tx = await stakeContract.stake(tokenAddress, balance, {
            gasLimit,
            maxFeePerGas,
            maxPriorityFeePerGas
          });
          console.log(`🚀 Stake Tx Sent for token ${tokenTicket}: ${tx.hash}`.magenta);
          const receipt = await tx.wait();
          console.log(`✅ Stake Tx Confirmed: ${receipt.transactionHash}`.magenta);
        } catch (error) {
          if (error.message && error.message.includes("insufficient balance")) {
            const walletBalance = await wallet.getBalance();
            console.error(`❌ Wallet [${walletInfo.address}] is out of funds for staking. Balance: ${ethers.utils.formatEther(walletBalance)} ${chain.SYMBOL}`.red);
          } else {
            console.error(`❌ Error staking token ${tokenTicket} for wallet [${walletInfo.address}]: ${error.message}`.red);
          }
        }
        await sleep(2000); // 2-second delay between each asset stake
      }
      await sleep(2000); // 2-second delay between wallets
    }
  }

  // After finishing, prompt to return to Multipli main menu
  await inquirer.prompt([
    {
      type: 'input',
      name: 'back',
      message: 'Press ENTER to return to the Multipli main menu...'
    }
  ]);
  main(); // Restart main menu
}

main();
