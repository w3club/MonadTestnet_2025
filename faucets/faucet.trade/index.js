const inquirer = require("inquirer");
const fs = require("fs");
const { spawn } = require("child_process");
const { ethers } = require("ethers");
const chalk = require("chalk");
const clear = require("console-clear");
const path = require("path");
const { requestFaucet } = require("./scripts/apis.js");
const { TwitterApi } = require("twitter-api-v2");

// Constants
const TX_EXPLORER = "https://testnet.monadexplorer.com/tx/";
const PROXIES_FILE = path.join(__dirname, "../../proxies.txt");
const CREDENTIALS_FILE = path.join(__dirname, "credentials.json");
const ADD_CREDENTIALS_SCRIPT = path.join(__dirname, "add_data.js");
const WALLETS_FILE = path.join(__dirname, "../../utils/wallets.json");
const TUTORIAL_FILE = path.join("faucets", "faucet.trade", "tutorial.txt");

// Pause helper: wait for ENTER then clear console
async function pause() {
  await inquirer.prompt([
    {
      type: "input",
      name: "continue",
      message: chalk.green("Press ENTER to back main menu...")
    }
  ]);
  clear();
}

// Reads credentials from credentials.json
function readCredentials() {
  return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, "utf8"));
}

// Reads proxies from proxies.txt
function readProxies() {
  const data = fs.readFileSync(PROXIES_FILE, "utf8");
  return data.split("\n").filter(line => line.trim() !== "");
}

// Extract the session ID from proxy URL
function extractProxyID(proxyUrl) {
  const match = proxyUrl.match(/-zone-custom-session-([^-]+)-sessTime-1/);
  return match ? match[1] : "Unknown";
}

// Spawns captcha.js to solve captcha
function runCaptcha() {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [path.join(__dirname, "captcha.js")], { stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", data => { output += data.toString(); });
    child.stderr.on("data", data => { output += data.toString(); });
    child.on("close", () => {
      const match = output.match(/🔑 response:\s*"([^"]+)"/);
      if (match) {
        console.log(chalk.green("✔️  Captcha Solved!"));
        resolve(match[1]);
      } else {
        reject("Captcha solution not found");
      }
    });
  });
}

// Gets Twitter user info using twitter-api-v2
async function getUserInfo(client) {
  try {
    const user = await client.v2.me();
    return { userId: user.data.id, username: user.data.username };
  } catch (err) {
    throw new Error(`Error fetching user info: ${err.message}`);
  }
}

// Posts a tweet and returns the tweet ID
async function postTweet(walletAddress, client) {
  const tweetText = `@faucet_trade send MON tokens to ${walletAddress}\n#monad_testnet_mon #testnet #monad #mon #faucet\nhttps://faucet.trade`;
  try {
    const tweet = await client.v2.tweet(tweetText);
    return tweet.data.id;
  } catch (err) {
    throw new Error(`Error posting tweet: ${err.message}`);
  }
}

// Runs add_data.js script (for adding credentials)
function runAddCredentials() {
  return new Promise((resolve) => {
    const child = spawn("node", [ADD_CREDENTIALS_SCRIPT], { stdio: "inherit" });
    child.on("close", () => {
      resolve();
    });
  });
}

// Runs "cat" on the tutorial file to display API tutorial
function showApiTutorial() {
  return new Promise((resolve) => {
    const child = spawn("cat", [TUTORIAL_FILE], { stdio: "inherit" });
    child.on("close", resolve);
  });
}

// Saves a wallet to wallets.json
function saveWallet(wallet) {
  let wallets = [];
  if (fs.existsSync(WALLETS_FILE)) {
    try {
      wallets = JSON.parse(fs.readFileSync(WALLETS_FILE, "utf8"));
    } catch (e) {
      wallets = [];
    }
  }
  const newId = wallets.length > 0 ? wallets[wallets.length - 1].id + 1 : (wallet.id || 1);
  wallet.id = newId;
  wallets.push(wallet);
  fs.writeFileSync(WALLETS_FILE, JSON.stringify(wallets, null, 2), "utf8");
  console.log(chalk.green(`💾 Wallet saved to wallets.json with id ${newId}\n`));
}

// Process faucet claim for a single wallet
async function claimFaucetFlow(wallet, cred) {
  const walletAddress = wallet.address;
  const proxies = readProxies();
  let proxy;
  if (wallet.id && proxies[wallet.id - 1]) {
    proxy = proxies[wallet.id - 1];
  } else {
    proxy = proxies[0];
  }
  const proxyId = extractProxyID(proxy);
  console.log(chalk.green(`🔄 Claiming faucet for wallet [${walletAddress}].`));
  console.log(chalk.green(`⚙️  Using Proxy - [${proxyId}]`));

  const client = new TwitterApi({
    appKey: cred.api_key,
    appSecret: cred.api_secret_key,
    accessToken: cred.access_token,
    accessSecret: cred.access_token_secret
  });

  try {
    console.log(chalk.green("🔎 Solving Captcha..."));
    const captchaSolution = await runCaptcha();
    console.log(chalk.green("🐦 Posting Tweet"));
    const tweetId = await postTweet(walletAddress, client);
    const { userId, username } = await getUserInfo(client);
    const tweetUrl = `https://x.com/${username}/status/${tweetId}`;
    console.log(chalk.green(`✅ Tweet sent! with account [${username}] - Tweet Link is [${tweetUrl}]`));

    const faucetResponse = await requestFaucet(
      captchaSolution,
      tweetUrl,
      userId,
      username,
      walletAddress,
      proxy
    );

    let txHash = "unknown";
    if (
      faucetResponse &&
      faucetResponse.data &&
      faucetResponse.data.length > 0 &&
      (!faucetResponse.errors || faucetResponse.errors.length === 0)
    ) {
      const regex = /tx\/(0x[0-9a-fA-F]+)/;
      const match = faucetResponse.data[0].match(regex);
      if (match) txHash = match[1];

      console.log(chalk.green(`🎉 Faucet Successfully Claimed for Wallet - [${walletAddress}]`));
      console.log(chalk.green(`🔗 Tx Hash! - [${TX_EXPLORER}${txHash}]`));

      if (wallet.privateKey) {
        saveWallet({ id: wallet.id, address: wallet.address, privateKey: wallet.privateKey });
      }
    } else {
      throw new Error("Faucet request failed with non-200 code or errors.");
    }
  } catch (err) {
    console.log(chalk.green(`❌ Error claiming faucet for Wallet [${walletAddress}]: ${err.message || err}\n`));
  }
  await new Promise(resolve => setTimeout(resolve, 500));
}

// Main menu for faucet.trade
async function mainMenu() {
  clear();
  const credentials = readCredentials();
  const { option } = await inquirer.prompt([
    {
      type: "list",
      name: "option",
      message: chalk.green("Select an option:"),
      choices: [
        { name: "1. New Wallets", value: "new" },
        { name: "2. Existing Wallets", value: "existing" },
        { name: "3. Add Credentials", value: "addCreds" },
        { name: "4. How to add APIs", value: "howToAPIs" },
        { name: "0. Exit", value: "exit" }
      ]
    }
  ]);

  switch (option) {
    case "new": {
      clear();
      let savedWallets = [];
      if (fs.existsSync(WALLETS_FILE)) {
        try {
          savedWallets = JSON.parse(fs.readFileSync(WALLETS_FILE, "utf8"));
        } catch (e) {
          savedWallets = [];
        }
      }
      for (let i = 0; i < credentials.length; i++) {
        const nextId = savedWallets.length + 1;
        const wallet = ethers.Wallet.createRandom();
        wallet.id = nextId;
        console.log(chalk.green(`💳 [${wallet.address}] - Has been generated`));
        await claimFaucetFlow(wallet, credentials[i]);
        if (fs.existsSync(WALLETS_FILE)) {
          savedWallets = JSON.parse(fs.readFileSync(WALLETS_FILE, "utf8"));
        }
      }
      break;
    }
    case "existing": {
      clear();
      let existingWallets = [];
      if (fs.existsSync(WALLETS_FILE)) {
        try {
          existingWallets = JSON.parse(fs.readFileSync(WALLETS_FILE, "utf8"));
        } catch (e) {
          existingWallets = [];
        }
      }
      if (existingWallets.length === 0) {
        console.log(chalk.red("No wallets found in wallets.json."));
        break;
      }
      const { walletIds } = await inquirer.prompt([
        {
          type: "input",
          name: "walletIds",
          message: chalk.green(`Please insert the IDs of up to ${credentials.length} Wallets to claim Faucet (separated by spaces):`)
        }
      ]);
      const ids = walletIds
        .split(" ")
        .map(id => Number(id))
        .filter(id => id > 0 && id <= credentials.length);
      if(ids.length === 0) {
        console.log(chalk.red("No valid wallet IDs provided."));
        break;
      }
      const filteredWallets = existingWallets.filter(wallet => ids.includes(wallet.id));
      for (let i = 0; i < filteredWallets.length; i++) {
        console.log(chalk.green(`💳 Using Wallet - [${filteredWallets[i].address}]`));
        // Get the corresponding credential from credentials.json by matching the id
        const cred = credentials.find(acc => acc.id === filteredWallets[i].id);
        if (!cred) {
          console.log(chalk.red(`No credential found for wallet id ${filteredWallets[i].id}, skipping...`));
          continue;
        }
        await claimFaucetFlow(filteredWallets[i], cred);
      }
      break;
    }
    case "addCreds": {
      console.log(chalk.green("🔑 Launching Add Credentials..."));
      await runAddCredentials();
      break;
    }
    case "howToAPIs": {
      console.log(chalk.green("📖 Showing tutorial on how to add APIs..."));
      await showApiTutorial();
      break;
    }
    case "exit":
      console.log(chalk.green("Exiting..."));
      process.exit(0);
    default:
      break;
  }

  await pause();
  mainMenu();
}

mainMenu().catch(err => {
  console.error(chalk.green(err));
});
