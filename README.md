## Monad Testnet

Welcome to Monad Testnet, this script will help you to be well positioned for future Testnet launch implementing multi Faucet claim,
Testnet Apps Interactions, Protocols, Contract Deployment, etc... All possible stuff related to Monad

``` bash

MonadTestnet/
├── actions/
│   ├── deploy_contract/
│   │   ├── index.js                  # Main script for compiling and deploying simple contracts on testnet
│   │   ├── contracts.sol             # Solidity contracts (up to 10 simple contracts)
│   │   ├── ABI.js                    # Exports only the ABI for a sample contract
│   │   ├── launch.js                 # Deployment script for tokens; prompts for token parameters
│   │   └── NFTs/
│   │       ├── deploy.js             # Interactive NFT deployment script (prompts for collection name, ticket, and max supply)
│   │       └── nft.sol               # NFT collection contract implementing basic functions (mint, burn, transfer, etc.)
│   ├── StakeStone/
│   │   ├── index.js                  # StakeStone module main script (to be implemented)
│   │   └── ABI.js                    # ABI definitions for StakeStone contracts (to be implemented)
│   ├── Multipli/
│   │   ├── index.js                  # Multipli module main script (handles token claims and asset staking)
│   │   └── ABI.js                    # ABI definitions for Multipli contracts (to be implemented)
│   ├── Ambient-Finance/
│   │   ├── index.js                  # Main script for Ambient-Finance module (to be implemented)
│   │   └── ABI.js                    # ABI definitions for Ambient-Finance contracts (to be implemented)
│   ├── Apriori/
│   │   ├── index.js                  # Main script for stake_apr.io module (handles staking & APR token operations)
│   │   ├── ABI.js                    # ABI definitions for Apriori contracts (implemented)
│   │   ├── faucet.js                 # Faucet script for Apriori (to be implemented)
│   │   └── scripts/                  # Additional scripts for Apriori (empty for now)
│   ├── NFTs-Mint/                    # Module for minting NFTs (empty for now)
│   ├── BeanSwap/
│   │   ├── ABI.js                    # Exports ABI definitions for Bean-Exchange & token + router contracts
│   │   ├── swap.js                   # Interactive swap script with token approvals, dynamic gas settings, and support for wrapping/unwrapping MON/WMON as well as custom tokens
│   │   ├── liquidity.js              # To be Implemented – Script for managing liquidity operations (e.g., adding/removing liquidity)
│   │   └── perps.js                  # To be Implemented – Script for handling perpetual contracts trading
│   ├── Kintzu/
│   │   ├── index.js                  # To be Implemented – Main script for the Kintzu module
│   │   └── ABI.js                    # To be Implemented – ABI definitions for Kintzu contracts
│   └── Synnax/
│       ├── index.js                  # To be Implemented – Main script for the Synnax module
│       └── ABI.js                    # To be Implemented – ABI definitions for Synnax contracts
├── faucets/
│   ├── official_faucet/
│   │   ├── claim.js                  # Script to claim tokens from the official faucet
│   │   ├── solve_captcha.py          # Python script to solve reCAPTCHA using 2Captcha
│   │   └── scripts/
│   │       └── apis.js               # To be Implemented – Script containing API calls for the official faucet
│   ├── morkie_faucet/
│   │   ├── claim.js                  # Script to claim tokens from the Morkie faucet; verifies NFT ownership and claims via API
│   │   └── scripts/
│   │       └── apis.js               # Script containing API calls for the Morkie faucet
│   ├── owlto_faucet                  # To be Implemented – Owlto faucet script
│   └── faucet.trade/
│       ├── add_data.js               # Interactive script to add credentials to credentials.json for the trade faucet module
│       ├── captcha.js                # Script to handle captcha challenges for faucet trades using bestcaptchasolver
│       ├── credentials.json          # JSON file storing credentials for the trade faucet (e.g., API keys, secrets)
│       ├── index.js                  # Main script for the trade faucet module; handles trade-related faucet operations with a menu for New Wallets, Existing Wallets, Add Credentials, and Exit
│       └── scripts/
│           └── apis.js               # To be Implemented – Script containing API calls for the trade faucet
├── index.js                          # Main entry point with interactive menu and child process execution
├── package.json                      # Dependency configuration and npm scripts for the project
├── proxies.txt                       # List of proxies (each line in the format: socks5://login:pass@ip:port)
├── .gitignore                        # Git ignore file (specifies files and directories to ignore in version control)
└── .vscode/
    └── launch.json                   # VSCode launch configuration for debugging the project


## Instructions

1. git clone https://github.com/Naeaerc20/MonadTestnet
2. cd MonadTestnet
3. npm install
4. Use some of the following prompts to interact with this CLI

- npm start - (runs index.js main code)
- npm run add - (run node utils/wallet_aggregator.js - allowing you to add your existing addresses)
- npm run generate - (run utils/wallet_generator.js - allowing you to generate new addresses to participate in Monad Testnet)

Good Luck! :)


## Requieriments

1. Set your 2CAPTCHA API on "solve_captcha.py" using "nano faucets/official_faucet/solve_captcha.py" - (currently official faucet no working at all)
2. set your ACCESS_TOKEN on "captcha.js" using "nano faucets/faucet.trade/captcha.js" from BestCaptchaSolver Website - Here: https://bestcaptchasolver.com/account - Load some funds on your account = Done Example: https://prnt.sc/QgaLKInhRC3t

## Notes

1. "faucet.js" on "actions/stake_apr.io" (is not available yet)
2. "index.js" on "MonadTestnet" still to be updated
3. I will make a tutorial how to create APIs for credentials.json to use Faucet.Trade script
