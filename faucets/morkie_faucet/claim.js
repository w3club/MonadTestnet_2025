#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const { claimFaucet, getRandomProxy } = require('./scripts/apis.js');
const { ethers } = require('ethers');
const colors = require('colors');

// Load wallets from utils/wallets.json
const walletsPath = path.resolve(__dirname, '../../utils/wallets.json');
let wallets = [];
try {
  wallets = JSON.parse(fs.readFileSync(walletsPath, 'utf8'));
} catch (err) {
  console.error("❌ Error reading wallets.json".red, err);
  process.exit(1);
}

// Morkie NFT verification configuration
const MORKIE_RPC_URL = "https://base.llamarpc.com";
const MORKIE_CHAIN_ID = 8453;
const MORKIE_PASSPORT_CONTRACT = "0x0078Ff55e9185A52a9e99148609D4c60912edD87";
// Minimal ERC721 ABI for balanceOf
const ERC721_ABI = ["function balanceOf(address owner) view returns (uint256)"];

async function main() {
  // Prompt for wallet IDs (separated by spaces)
  const { walletIDs } = await inquirer.prompt([
    {
      type: 'input',
      name: 'walletIDs',
      message: 'Enter wallet IDs separated by spaces (e.g., 1 3 5):'
    }
  ]);
  const ids = walletIDs.trim().split(/\s+/).map(id => parseInt(id)).filter(id => !isNaN(id));
  const selectedWallets = wallets.filter(w => ids.includes(w.id));
  if (selectedWallets.length === 0) {
    console.log("⚠️  No wallets selected.".yellow);
    process.exit(0);
  }
  
  // Create provider for verifying the Morkie NFT ownership
  const morkieProvider = new ethers.providers.JsonRpcProvider(MORKIE_RPC_URL, MORKIE_CHAIN_ID);
  
  for (const walletInfo of selectedWallets) {
    console.log(`\n🔹 Processing Wallet - [${walletInfo.address}]`.green);
    
    // Verify if wallet owns the Morkie NFT
    console.log("🔍 Verifying if Wallet owns Morkie NFT...".green);
    const nftContract = new ethers.Contract(MORKIE_PASSPORT_CONTRACT, ERC721_ABI, morkieProvider);
    let nftBalance;
    try {
      nftBalance = await nftContract.balanceOf(walletInfo.address);
    } catch (err) {
      console.error(`❌ Error verifying Morkie NFT for wallet [${walletInfo.address}]: ${err.message}`.red);
      continue;
    }
    if (nftBalance.gt(0)) {
      console.log("✅ Morkie NFT detected!".green);
    } else {
      console.log("⚠️  Wallet does not own Morkie NFT. Skipping.".yellow);
      continue;
    }
    
    // Get a random proxy and extract its ID
    const proxyUrl = getRandomProxy();
    const match = proxyUrl.match(/-zone-custom-session-([^-\s]+)-sessTime-/);
    const proxyID = match ? match[1] : proxyUrl;
    console.log(`🛡️  Using Proxy ID - [${proxyID}]`.green);
    
    // Claim faucet via API
    try {
      const response = await claimFaucet(walletInfo.address);
      if (response.status === 200) {
        console.log(`🚀 Faucet Successfully Claimed for Wallet - [${walletInfo.address}]`.magenta);
      } else if (response.status === 400) {
        console.error(`❌ You need Morkie ID to claim faucet for wallet [${walletInfo.address}]`.red);
      } else {
        console.error(`❌ Faucet claim failed for wallet [${walletInfo.address}]. Status: ${response.status}`.red);
      }
    } catch (apiError) {
      console.error(`❌ API error for wallet [${walletInfo.address}]: ${apiError.message}`.red);
    }
    
    // 2-second delay between wallets
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

main();
