const figlet = require('figlet');
const inquirer = require('inquirer');
const { spawn } = require('child_process');
const colors = require('colors');
const clear = require('console-clear');

process.on('SIGINT', () => {
  console.log('\nExiting...'.green);
  process.exit(0);
});

async function pause() {
  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: 'Press ENTER to return to the main menu...',
    },
  ]);
}

function runScript(scriptPath) {
  return new Promise((resolve) => {
    const child = spawn('node', [scriptPath], { stdio: 'inherit' });
    child.on('close', () => {
      resolve();
    });
  });
}

async function specificAppMenu() {
  // First, select the app
  const { appChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'appChoice',
      message: 'Select an App:',
      choices: [
        { name: '1. Nad.Fun', value: 'nadfun' }
      ]
    }
  ]);

  if (appChoice === 'nadfun') {
    const { appOption } = await inquirer.prompt([
      {
        type: 'list',
        name: 'appOption',
        message: 'What would you like to do?',
        choices: [
          { name: '1. Launch a Token', value: 'launchToken' },
          { name: '2. Execute Swaps', value: 'executeSwaps' },
          { name: '3. Snipe Tokens', value: 'snipeTokens' },
          { name: '4. Launch a Token with Insider Txs', value: 'launchInsider' }
        ]
      }
    ]);
    switch (appOption) {
      case 'launchToken':
        console.log('Launching Token...'.green);
        await runScript('actions/Nad.Fun/deploy.js');
        break;
      case 'executeSwaps':
        console.log('Executing Swaps...'.green);
        await runScript('actions/Nad.Fun/swap.js');
        break;
      case 'snipeTokens':
        console.log('Snipe Tokens...'.green);
        await runScript('actions/Nad.Fun/snipe.js');
        break;
      case 'launchInsider':
        console.log('Launching Token with Insider Txs...'.green);
        await runScript('actions/Nad.Fun/dev.js');
        break;
      default:
        break;
    }
  }
  await pause();
}

async function mainMenu() {
  clear();
  const title = figlet.textSync('MONAD', { horizontalLayout: 'full' });
  console.log(title.green);
  console.log('Script created by Naeaex'.green);
  console.log('Follow me on X - x.com/naeaexeth - Github - github.com/Naeaerc20'.green);
  console.log();

  const { option } = await inquirer.prompt([
    {
      type: 'list',
      name: 'option',
      message: 'Select an option:',
      choices: [
        { name: '1. Claim Faucet', value: 'claimFaucet' },
        { name: '2. Execute Swaps', value: 'executeSwaps' },
        { name: '3. Manage Liquidity (coming soon...)', value: 'manageLiquidity' },
        { name: '4. Stake Assets', value: 'stakeAssets' },
        { name: '5. Deploy a Contract', value: 'deployContract' },
        { name: '6. Deploy a Token', value: 'deployToken' },
        { name: '7. Deploy NFT Collection', value: 'deployNFT' },
        { name: '8. Use Specific App', value: 'specificApp' },
        { name: '0. Exit', value: 'exit' },
      ],
    },
  ]);

  switch (option) {
    case 'claimFaucet':
      const { faucetChoice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'faucetChoice',
          message: 'Select Faucet:',
          choices: [
            { name: '1. Official Faucet', value: 'officialFaucet' },
            { name: '2. Morkie Faucet', value: 'morkieFaucet' },
            { name: '3. Owlto Faucet (coming soon)', value: 'owltoFaucet' },
            { name: '4. Faucet Trade', value: 'faucetTrade' },
          ],
        },
      ]);
      if (faucetChoice === 'officialFaucet') {
        console.log('Launching Official Faucet...'.green);
        await runScript('faucets/official_faucet/claim.js');
      } else if (faucetChoice === 'morkieFaucet') {
        console.log('Launching Morkie Faucet...'.green);
        await runScript('faucets/morkie_faucet/claim.js');
      } else if (faucetChoice === 'faucetTrade') {
        console.log('Launching Faucet Trade...'.green);
        await runScript('faucets/faucet.trade/index.js');
      } else {
        console.log('Owlto Faucet coming soon...'.green);
      }
      await pause();
      break;

    case 'executeSwaps':
      const { swapChoice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'swapChoice',
          message: 'Where would you like to swap assets?',
          choices: [
            { name: '1. BeanSwap', value: 'beanSwap' },
            { name: '2. Ambient Finance (coming soon...)', value: 'ambientFinance' },
            { name: '3. KuruSwap', value: 'kuruSwap' },
          ],
        },
      ]);
      if (swapChoice === 'beanSwap') {
        const { beanSwapMode } = await inquirer.prompt([
          {
            type: 'list',
            name: 'beanSwapMode',
            message: 'Select swap mode for BeanSwap:',
            choices: [
              { name: '1. Manual Swaps', value: 'manual' },
              { name: '2. Automatic Swaps', value: 'automatic' },
            ],
          },
        ]);
        if (beanSwapMode === 'manual') {
          console.log('Launching Manual BeanSwap...'.green);
          await runScript('actions/BeanSwap/swap.js');
        } else {
          console.log('Launching Automatic BeanSwap...'.green);
          await runScript('actions/BeanSwap/random.js');
        }
      } else if (swapChoice === 'kuruSwap') {
        const { kuruSwapMode } = await inquirer.prompt([
          {
            type: 'list',
            name: 'kuruSwapMode',
            message: 'Select swap mode for KuruSwap:',
            choices: [
              { name: '1. Manual Swaps', value: 'manual' },
              { name: '2. Automatic Swaps', value: 'automatic' },
            ],
          },
        ]);
        if (kuruSwapMode === 'manual') {
          console.log('Launching Manual KuruSwap...'.green);
          await runScript('actions/KuruSwap/swap.js');
        } else {
          console.log('Launching Automatic KuruSwap...'.green);
          await runScript('actions/KuruSwap/random.js');
        }
      } else {
        console.log('Ambient Finance coming soon...'.green);
      }
      await pause();
      break;

    case 'manageLiquidity':
      console.log('Feature coming soon...'.green);
      await pause();
      break;

    case 'stakeAssets':
      const { stakeChoice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'stakeChoice',
          message: 'Where would you like to stake assets?',
          choices: [
            { name: '1. Multipli', value: 'multipli' },
            { name: '2. Apriori', value: 'apriori' },
            { name: '3. Kintzu', value: 'kintzu' }
          ],
        },
      ]);
      switch (stakeChoice) {
        case 'multipli':
          console.log('Launching Multipli...'.green);
          await runScript('actions/Multipli/index.js');
          break;
        case 'apriori':
          console.log('Launching Apriori...'.green);
          await runScript('actions/Apriori/index.js');
          break;
        case 'kintzu':
          console.log('Launching Kintzu...'.green);
          await runScript('actions/Kintzu/index.js');
          break;
        default:
          console.log('Invalid option, coming soon...'.green);
          break;
      }
      await pause();
      break;

    case 'deployContract':
      console.log('Launching Deploy Contract...'.green);
      await runScript('actions/deploy_contract/index.js');
      await pause();
      break;

    case 'deployToken':
      console.log('Launching Deploy Token...'.green);
      await runScript('actions/deploy_contract/launch.js');
      await pause();
      break;

    case 'deployNFT':
      console.log('Launching Deploy NFT Collection...'.green);
      await runScript('actions/deploy_contract/NFTs/deploy.js');
      await pause();
      break;

    case 'specificApp':
      await specificAppMenu();
      break;

    case 'exit':
      console.log('Exiting...'.green);
      process.exit(0);

    default:
      break;
  }

  mainMenu();
}

mainMenu();
