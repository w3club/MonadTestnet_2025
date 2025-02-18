## Monad Testnet

Welcome to Monad Testnet, this script will help you to be well positioned for future Testnet launch implementing multi Faucet claim,
Testnet Apps Interactions, Protocols, Contract Deployment, etc... All possible stuff related to Monad

``` bash

MonadTestnet/
├── actions/
│   ├── deploy_contract/
│   │   ├── index.js                  # Contract compilation and deployment script
│   │   ├── contracts.sol             # Solidity contracts (up to 10 simple contracts)
│   │   ├── ABI.js                    # Exports only the ABI for a sample contract
│   │   ├── launch.js                 # Deployment script for tokens
│   │   └── NFTs/
│   │       ├── deploy.js             # NFT deployment script
│   │       └── nft.sol               # NFT collection contract
│   ├── StakeStone/
│   │   ├── index.js                  # StakeStone module main script (to be implemented)
│   │   └── ABI.js                    # ABI definitions for StakeStone contracts (to be implemented)
│   └── Multipli/
│       ├── index.js                  # Multipli module main script (to be implemented)
│       └── ABI.js                    # ABI definitions for Multipli contracts (to be implemented)
├── faucets/
│   ├── official_faucet/
│   │   ├── claim.js                  # Script to claim tokens from the official faucet
│   │   └── scripts/
│   │       └── apis.js               # Script containing API calls for the official faucet (to be implemented)
│   └── owlto_faucet                  # Owlto faucet script (to be implemented)
├── index.js                          # Main entry point with interactive menu and child process execution
├── package.json                      # Dependency configuration and npm scripts
├── proxies.txt                       # List of proxies (format: socks5://login:pass@ip:port)
└── utils/
    ├── chain.js                    # Network configuration (RPC_URL, CHAIN_ID, SYMBOL, etc.)
    ├── wallet_aggregator.js        # Interactive wallet aggregation script
    ├── wallet_generator.js         # Wallet generation script (to be implemented)
    └── wallets.json                # JSON file storing wallet information


## Instructions

1. git clone https://github.com/Naeaerc20/MonadTestnet
2. cd MonadTestnet
3. npm install
4. Use some of the following prompts to interact with this CLI

- npm start - (runs index.js main code)
- npm run add - (run node utils/wallet_aggregator.js - allowing you to add your existing addresses)
- npm run generate - (run utils/wallet_generator.js - allowing you to generate new addresses to participate in Monad Testnet)

Good Luck! :)
