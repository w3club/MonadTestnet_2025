// ABI.js

// Dirección del contrato FACTORY (para despliegue de NFTs)
const FACTORY_CONTRACT = "0x000000009e44eba131196847c685f20cd4b68ac4";

// ABI para la función setup (para contratos SETUP dinámicos)
const SETUP_ABI = [
  {
    "type": "function",
    "name": "setup",
    "inputs": [
      {
        "name": "config",
        "type": "tuple",
        "internalType": "struct SetupConfig",
        "components": [
          { "name": "maxSupply", "type": "uint256", "internalType": "uint256" },
          { "name": "walletLimit", "type": "uint256", "internalType": "uint256" },
          { "name": "baseURI", "type": "string", "internalType": "string" },
          { "name": "contractURI", "type": "string", "internalType": "string" },
          {
            "name": "publicStage",
            "type": "tuple",
            "internalType": "struct PublicStage",
            "components": [
              { "name": "startTime", "type": "uint256", "internalType": "uint256" },
              { "name": "endTime", "type": "uint256", "internalType": "uint256" },
              { "name": "price", "type": "uint256", "internalType": "uint256" }
            ]
          },
          {
            "name": "allowlistStage",
            "type": "tuple",
            "internalType": "struct AllowlistStage",
            "components": [
              { "name": "startTime", "type": "uint256", "internalType": "uint256" },
              { "name": "endTime", "type": "uint256", "internalType": "uint256" },
              { "name": "price", "type": "uint256", "internalType": "uint256" },
              { "name": "merkleRoot", "type": "bytes32", "internalType": "bytes32" }
            ]
          },
          { "name": "payoutRecipient", "type": "address", "internalType": "address" },
          { "name": "royaltyRecipient", "type": "address", "internalType": "address" },
          { "name": "royaltyBps", "type": "uint96", "internalType": "uint96" }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

// ABI original: funciones ya definidas anteriormente
const ABI = [
  {
    "type": "function",
    "name": "mintPublic",
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "qty", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "payable",
    "selector": "0x9f93f779"
  },
  {
    "type": "function",
    "name": "mintPublic",
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "param2", "type": "uint256" },
      { "internalType": "uint256", "name": "param3", "type": "uint256" },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "payable",
    "selector": "0x9b4f3af5"
  },
  {
    "type": "function",
    "name": "mintAllowlist",
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "qty", "type": "uint256" },
      { "internalType": "bytes32[]", "name": "proof", "type": "bytes32[]" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "getConfig",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct SetupConfig",
        "components": [
          { "name": "maxSupply", "type": "uint256", "internalType": "uint256" },
          { "name": "walletLimit", "type": "uint256", "internalType": "uint256" },
          { "name": "baseURI", "type": "string", "internalType": "string" },
          { "name": "contractURI", "type": "string", "internalType": "string" },
          {
            "name": "publicStage",
            "type": "tuple",
            "internalType": "struct PublicStage",
            "components": [
              { "name": "startTime", "type": "uint256", "internalType": "uint256" },
              { "name": "endTime", "type": "uint256", "internalType": "uint256" },
              { "name": "price", "type": "uint256", "internalType": "uint256" }
            ]
          },
          {
            "name": "allowlistStage",
            "type": "tuple",
            "internalType": "struct AllowlistStage",
            "components": [
              { "name": "startTime", "type": "uint256", "internalType": "uint256" },
              { "name": "endTime", "type": "uint256", "internalType": "uint256" },
              { "name": "price", "type": "uint256", "internalType": "uint256" },
              { "name": "merkleRoot", "type": "bytes32", "internalType": "bytes32" }
            ]
          },
          { "name": "payoutRecipient", "type": "address", "internalType": "address" },
          { "name": "royaltyRecipient", "type": "address", "internalType": "address" },
          { "name": "royaltyBps", "type": "uint96", "internalType": "uint96" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getConfig",
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct SetupConfig",
        "components": [
          { "name": "tokenId", "type": "uint256", "internalType": "uint256" },
          { "name": "maxSupply", "type": "uint256", "internalType": "uint256" },
          { "name": "walletLimit", "type": "uint256", "internalType": "uint256" },
          { "name": "baseURI", "type": "string", "internalType": "string" },
          { "name": "contractURI", "type": "string", "internalType": "string" },
          {
            "name": "publicStage",
            "type": "tuple",
            "internalType": "struct PublicStage",
            "components": [
              { "name": "startTime", "type": "uint256", "internalType": "uint256" },
              { "name": "endTime", "type": "uint256", "internalType": "uint256" },
              { "name": "price", "type": "uint256", "internalType": "uint256" }
            ]
          },
          {
            "name": "allowlistStage",
            "type": "tuple",
            "internalType": "struct AllowlistStage",
            "components": [
              { "name": "startTime", "type": "uint256", "internalType": "uint256" },
              { "name": "endTime", "type": "uint256", "internalType": "uint256" },
              { "name": "price", "type": "uint256", "internalType": "uint256" },
              { "name": "merkleRoot", "type": "bytes32", "internalType": "bytes32" }
            ]
          },
          { "name": "payoutRecipient", "type": "address", "internalType": "address" },
          { "name": "royaltyRecipient", "type": "address", "internalType": "address" },
          { "name": "royaltyBps", "type": "uint96", "internalType": "uint96" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "createToken",
    "inputs": [
      { "name": "name", "type": "string", "internalType": "string" },
      { "name": "symbol", "type": "string", "internalType": "string" },
      { "name": "contractURI", "type": "string", "internalType": "string" },
      { "name": "isUS", "type": "bool", "internalType": "bool" }
    ],
    "outputs": [
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "payable"
  },
  // ABI faltante: createContractDeterministic
  {
    "type": "function",
    "name": "createContractDeterministic",
    "inputs": [
      { "name": "name", "type": "string", "internalType": "string" },
      { "name": "symbol", "type": "string", "internalType": "string" },
      { "name": "standard", "type": "uint8", "internalType": "enum TokenStandard" },
      { "name": "initialOwner", "type": "address", "internalType": "address payable" },
      { "name": "implId", "type": "uint32", "internalType": "uint32" },
      { "name": "salt", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "payable"
  },
  // ABI faltante: predictDeploymentAddress
  {
    "type": "function",
    "name": "predictDeploymentAddress",
    "inputs": [
      { "name": "standard", "type": "uint8", "internalType": "enum TokenStandard" },
      { "name": "implId", "type": "uint32", "internalType": "uint32" },
      { "name": "salt", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "view"
  }
];

module.exports = { ABI, FACTORY_CONTRACT, SETUP_ABI };
