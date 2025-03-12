const inquirer = require("inquirer");
const chalk = require("chalk");
const { ethers } = require("ethers");

const { RPC_URL, CHAIN_ID, SYMBOL, TX_EXPLORER, ADDRESS_EXPLORER, WMON_ADDRESS } = require("../../utils/chain");
const wallets = require("../../utils/wallets.json");
const { ABI, STAKE_CONTRACT, GMON_ADDRESS } = require("./ABI.js");

const gMonAbi = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

async function getGasOverrides() {
  const latestBlock = await provider.getBlock("latest");
  const baseFee = latestBlock.baseFeePerGas;
  const maxFeePerGas = baseFee.mul(105).div(100);
  const maxPriorityFeePerGas = baseFee.mul(105).div(100);
  const gasLimit = Math.floor(Math.random() * (300000 - 200000 + 1)) + 200000;
  return { gasLimit, maxFeePerGas, maxPriorityFeePerGas };
}

async function mainMenu() {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        { name: "1. Stake MON", value: "stake" },
        { name: "2. Unstake MON", value: "unstake" }
      ]
    }
  ]);
  return answers.action;
}

async function selectWallets() {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "walletChoice",
      message: "What wallets would you like to use?",
      choices: [
        { name: "1. All of them", value: "all" },
        { name: "2. Specific IDs", value: "specific" }
      ]
    }
  ]);

  let chosenWallets = [];
  if (answers.walletChoice === "all") {
    chosenWallets = wallets;
  } else {
    const idAnswers = await inquirer.prompt([
      {
        type: "input",
        name: "ids",
        message: "Enter the wallet IDs (space-separated):"
      }
    ]);
    const idsArray = idAnswers.ids
      .split(" ")
      .map((id) => parseInt(id.trim()))
      .filter((n) => !isNaN(n));
    chosenWallets = wallets.filter((w) => idsArray.includes(w.id));
  }
  return chosenWallets;
}

async function stakeMon(selectedWallets) {
  const stakeContract = new ethers.Contract(STAKE_CONTRACT, ABI, provider);
  for (const w of selectedWallets) {
    const signer = new ethers.Wallet(w.privateKey, provider);
    const contractWithSigner = stakeContract.connect(signer);
    const randomAmount = (Math.random() * (0.12 - 0.05) + 0.05).toFixed(3);
    console.log(chalk.magenta(`🔹 Wallet - [${w.address}] is Staking - [${randomAmount}] ${SYMBOL}`));
    try {
      const overrides = await getGasOverrides();
      const tx = await contractWithSigner["depositMon()"]({
        value: ethers.utils.parseEther(randomAmount),
        ...overrides
      });
      console.log(chalk.magenta(`🔹 Stake Tx Sent! - [${TX_EXPLORER}${tx.hash}]`));
      const receipt = await tx.wait(1);
      console.log(chalk.magenta(`✔️  Tx Confirmed in Block - [${receipt.blockNumber}]\n`));
    } catch (err) {
      console.log(chalk.magenta(`❌ Error staking: ${err.message}`));
    }
  }
}

async function unstakeMon(selectedWallets) {
  const stakeContract = new ethers.Contract(STAKE_CONTRACT, ABI, provider);
  const gMonContract = new ethers.Contract(GMON_ADDRESS, gMonAbi, provider);
  for (const w of selectedWallets) {
    const signer = new ethers.Wallet(w.privateKey, provider);
    const contractWithSigner = stakeContract.connect(signer);
    const gMonWithSigner = gMonContract.connect(signer);
    try {
      const balanceBN = await gMonWithSigner.balanceOf(w.address);
      if (balanceBN.isZero()) {
        console.log(chalk.magenta(`⚠️  Wallet - [${w.address}] has 0 GMON (nothing to unstake).`));
        continue;
      }
      const decimals = await gMonWithSigner.decimals();
      const balanceHuman = parseFloat(ethers.utils.formatUnits(balanceBN, decimals));
      const fraction = 0.5 + Math.random() * 0.5;
      const unstakeAmount = balanceHuman * fraction;
      const unstakeBN = ethers.utils.parseUnits(unstakeAmount.toFixed(3), decimals);
      console.log(chalk.magenta(`🔻 Wallet - [${w.address}] is Unstaking - [${unstakeAmount.toFixed(3)}] ${SYMBOL}`));
      const overrides = await getGasOverrides();
      const tx = await contractWithSigner.withdrawMon(unstakeBN, overrides);
      console.log(chalk.magenta(`🔻 Unstake Tx Sent! - [${TX_EXPLORER}${tx.hash}]`));
      const receipt = await tx.wait(1);
      console.log(chalk.magenta(`✔️  Tx Confirmed in Block - [${receipt.blockNumber}]\n`));
    } catch (err) {
      console.log(chalk.magenta(`❌ Error unstaking: ${err.message}`));
    }
  }
}

async function main() {
  const action = await mainMenu();
  const selectedWallets = await selectWallets();
  if (action === "stake") {
    await stakeMon(selectedWallets);
  } else {
    await unstakeMon(selectedWallets);
  }
}

main().catch((err) => {
  console.error("Error in main:", err);
});
