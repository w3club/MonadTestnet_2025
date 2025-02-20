#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { requestFaucet, getRandomProxy } = require('./scripts/apis.js');
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

// Get full path to solve_captcha.py (located in faucets/official_faucet)
const solveCaptchaPath = path.resolve(__dirname, 'solve_captcha.py');
if (!fs.existsSync(solveCaptchaPath)) {
  console.error(`❌ solve_captcha.py not found at path: ${solveCaptchaPath}`.red);
  process.exit(1);
}

async function main() {
  for (const wallet of wallets) {
    console.log(`\n🔹 Processing Wallet - [${wallet.address}]`.green);
    console.log("⏳ Solving Captcha...".green);
    
    // Execute solve_captcha.py using its full path with spawnSync
    const spawnResult = spawnSync('python3', [solveCaptchaPath], { encoding: 'utf8' });
    if (spawnResult.error) {
      console.error(`❌ Error executing solve_captcha.py for wallet [${wallet.address}]: ${spawnResult.error}`.red);
      continue;
    }
    if (spawnResult.status !== 0) {
      console.error(`❌ solve_captcha.py exited with code ${spawnResult.status} for wallet [${wallet.address}]: ${spawnResult.stderr}`.red);
      continue;
    }
    
    let captchaResult;
    try {
      captchaResult = JSON.parse(spawnResult.stdout.trim());
    } catch (e) {
      console.error(`❌ Error parsing captcha output for wallet [${wallet.address}]: ${e.message}`.red);
      continue;
    }
    if (captchaResult.error) {
      console.error(`❌ Captcha solving error for wallet [${wallet.address}]: ${captchaResult.error}`.red);
      continue;
    }
    console.log("✅ Captcha Solved!".green);
    const recaptchaToken = captchaResult.code;
    
    // Get a random proxy and extract its ID
    const proxyUrl = getRandomProxy();
    const match = proxyUrl.match(/-zone-custom-session-([^-\s]+)-sessTime-/);
    const proxyID = match ? match[1] : proxyUrl;
    console.log(`🛡️  Using Proxy ID - [${proxyID}]`.green);
    
    // Request faucet claim via API
    try {
      const response = await requestFaucet(wallet.address, recaptchaToken);
      if (response.status === 200) {
        console.log(`🚀 Faucet Successfully Claimed for Wallet - [${wallet.address}]`.magenta);
      } else {
        console.error(`❌ Faucet claim failed for wallet [${wallet.address}]. Status: ${response.status}`.red);
      }
    } catch (apiError) {
      console.error(`❌ API error for wallet [${wallet.address}]: ${apiError.message}`.red);
    }
  }
}

main();
