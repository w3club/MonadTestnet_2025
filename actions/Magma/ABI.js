// Magma/ABI.js

const STAKE_CONTRACT = "0x2c9C959516e9AAEdB2C748224a41249202ca8BE7";
const GMON_ADDRESS   = "0xaEef2f6B429Cb59C9B2D7bB2141ADa993E8571c3";

const ABI = [
  {
    "name": "depositMon",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [],
    "outputs": []
  },
  {
    "name": "depositMon",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_referralId",
        "type": "uint256"
      }
    ],
    "outputs": []
  },
  {
    "name": "withdrawMon",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "outputs": []
  }
];

module.exports = {
  ABI,
  STAKE_CONTRACT,
  GMON_ADDRESS
};
