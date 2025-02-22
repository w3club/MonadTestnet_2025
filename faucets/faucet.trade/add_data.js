#!/usr/bin/env node
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const credentialsFilePath = path.join(__dirname, 'credentials.json');

function loadCredentials() {
  if (!fs.existsSync(credentialsFilePath)) {
    return [];
  }
  const data = fs.readFileSync(credentialsFilePath, 'utf8');
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error(chalk.red("Error parsing credentials.json. Starting with an empty array."));
    return [];
  }
}

function saveCredentials(credentials) {
  fs.writeFileSync(credentialsFilePath, JSON.stringify(credentials, null, 2), 'utf8');
}

async function promptForAccount() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'api_key',
      message: 'Enter API Key:'
    },
    {
      type: 'input',
      name: 'api_secret_key',
      message: 'Enter API Secret Key:'
    },
    {
      type: 'input',
      name: 'access_token',
      message: 'Enter Access Token:'
    },
    {
      type: 'input',
      name: 'access_token_secret',
      message: 'Enter Access Token Secret:'
    }
  ]);
  return answers;
}

async function main() {
  let credentials = loadCredentials();
  let addMore = true;
  while (addMore) {
    const account = await promptForAccount();
    // Determine new id based on the highest id in credentials
    let newId = 1;
    if (credentials.length > 0) {
      newId = Math.max(...credentials.map(acc => acc.id)) + 1;
    }
    account.id = newId;
    credentials.push(account);
    console.log(chalk.green(`Account with ID ${newId} added successfully.`));
    const { continueAdding } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continueAdding',
        message: 'Would you like to add another account?',
        default: false
      }
    ]);
    addMore = continueAdding;
  }
  saveCredentials(credentials);
  console.log(chalk.green("All accounts have been saved to credentials.json."));
}

main().catch(err => {
  console.error(chalk.red(err));
});
