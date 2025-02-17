## Monad Testnet

Welcome to Monad Testnet, this script will help you to be well positioned for future Testnet launch implementing multi Faucet claim,
Testnet Apps Interactions, Protocols, Contract Deployment, etc... All possible stuff related to Monad

MonadTestnet/
├── actions/            # Action scripts (to be implemented)
├── faucets/            # Faucet-related scripts (to be implemented)
├── index.js            # Main entry point of the project
├── package.json        # Dependency configuration and npm scripts
├── proxies.txt         # List of proxies in format: socks5://login:pass@ip:port
└── utils/              # Utilities and additional scripts
    ├── chain.js              # Network configuration (RPC_URL, CHAIN_ID, SYMBOL, etc.)
    ├── wallet_aggregator.js  # Interactive script to add wallets
    ├── wallet_generator.js   # Script to generate wallets
    └── wallets.json          # JSON file that stores added wallets

## Instructions

1. git clone https://github.com/Naeaerc20/MonadTestnet
2. cd MonadTestnet
3. npm install
4. Use some of the following prompts to interact with this CLI

- npm start - (runs index.js main code)
- npm run add - (run node utils/wallet_aggregator.js - allowing you to add your existing addresses)
- npm run generate - (run utils/wallet_generator.js - allowing you to generate new addresses to participate in Monad Testnet)

Good Luck! :)
