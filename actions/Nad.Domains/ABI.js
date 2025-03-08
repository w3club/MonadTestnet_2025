// ABI.js

// ABI para la función registerWithSignature (Registration Contract)
const RegistrationABI = [
  {
    "inputs": [
      {
        "components": [
          { "name": "name", "type": "string" },
          { "name": "nameOwner", "type": "address" },
          { "name": "setAsPrimaryName", "type": "bool" },
          { "name": "referrer", "type": "address" },
          { "name": "discountKey", "type": "bytes32" },
          { "name": "discountClaimProof", "type": "bytes" },
          { "name": "nonce", "type": "uint256" },
          { "name": "deadline", "type": "uint256" }
        ],
        "name": "params",
        "type": "tuple"
      },
      {
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "registerWithSignature",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

// ABI para las funciones del Name Manager Contract:
// - isNameAvailable: Verifica si un nombre está registrado o no
// - getNamesOfAddress: Obtiene la lista de nombres asociados a una wallet
// - setPrimaryNameForAddress: Establece un nombre como primario para una wallet
const NameManagerABI = [
  {
    "inputs": [
      { "name": "name", "type": "string" }
    ],
    "name": "isNameAvailable",
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "addr", "type": "address" }
    ],
    "name": "getNamesOfAddress",
    "outputs": [
      { "name": "", "type": "string[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "addr", "type": "address" },
      { "name": "name", "type": "string" }
    ],
    "name": "setPrimaryNameForAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// ABI para la función getRegisteringPrice (Price Oracle Contract)
const PriceOracleABI = [
  {
    "inputs": [
      { "name": "name", "type": "string" }
    ],
    "name": "getRegisteringPrice",
    "outputs": [
      {
        "components": [
          { "name": "base", "type": "uint256" },
          { "name": "premium", "type": "uint256" }
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Direcciones de contrato (en inglés)
const REGISTRATION_CONTRACT_ADDRESS = "0x758D80767a751fc1634f579D76e1CcaAb3485c9c";
const NAME_MANAGER_CONTRACT_ADDRESS = "0x3019BF1dfB84E5b46Ca9D0eEC37dE08a59A41308";
const PRICE_ORACLE_CONTRACT_ADDRESS = "0x0665C6C7f7e6E87424BAEA5d139cb719D557A850";

module.exports = {
  RegistrationABI,
  NameManagerABI,
  PriceOracleABI,
  REGISTRATION_CONTRACT_ADDRESS,
  NAME_MANAGER_CONTRACT_ADDRESS,
  PRICE_ORACLE_CONTRACT_ADDRESS
};
