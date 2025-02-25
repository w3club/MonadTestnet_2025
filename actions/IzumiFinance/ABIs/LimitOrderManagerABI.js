// LimitOrderManagerABI.js
module.exports = [
  {
    "inputs": [
      { "internalType": "address", "name": "factory", "type": "address" },
      { "internalType": "address", "name": "weth", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "DEACTIVE_ORDER_LIM",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "WETH9",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "orderIdx", "type": "uint256" },
      { "internalType": "uint128", "name": "collectDec", "type": "uint128" },
      { "internalType": "uint128", "name": "collectEarn", "type": "uint128" }
    ],
    "name": "collectLimOrder",
    "outputs": [
      { "internalType": "uint128", "name": "actualCollectDec", "type": "uint128" },
      { "internalType": "uint128", "name": "actualCollectEarn", "type": "uint128" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "orderIdx", "type": "uint256" },
      { "internalType": "uint128", "name": "amount", "type": "uint128" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "decLimOrder",
    "outputs": [
      { "internalType": "uint128", "name": "actualDelta", "type": "uint128" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "factory",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "idx", "type": "uint256" }
    ],
    "name": "getActiveOrder",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "lastAccEarn", "type": "uint256" },
          { "internalType": "uint128", "name": "amount", "type": "uint128" },
          { "internalType": "uint128", "name": "sellingRemain", "type": "uint128" },
          { "internalType": "uint128", "name": "accSellingDec", "type": "uint128" },
          { "internalType": "uint128", "name": "sellingDec", "type": "uint128" },
          { "internalType": "uint128", "name": "earn", "type": "uint128" },
          { "internalType": "uint128", "name": "poolId", "type": "uint128" },
          { "internalType": "uint128", "name": "timestamp", "type": "uint128" },
          { "internalType": "int24", "name": "pt", "type": "int24" },
          { "internalType": "bool", "name": "sellXEarnY", "type": "bool" },
          { "internalType": "bool", "name": "active", "type": "bool" }
        ],
        "internalType": "struct LimOrder",
        "name": "limOrder",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getActiveOrders",
    "outputs": [
      { "internalType": "uint256[]", "name": "activeIdx", "type": "uint256[]" },
      {
        "components": [
          { "internalType": "uint256", "name": "lastAccEarn", "type": "uint256" },
          { "internalType": "uint128", "name": "amount", "type": "uint128" },
          { "internalType": "uint128", "name": "sellingRemain", "type": "uint128" },
          { "internalType": "uint128", "name": "accSellingDec", "type": "uint128" },
          { "internalType": "uint128", "name": "sellingDec", "type": "uint128" },
          { "internalType": "uint128", "name": "earn", "type": "uint128" },
          { "internalType": "uint128", "name": "poolId", "type": "uint128" },
          { "internalType": "uint128", "name": "timestamp", "type": "uint128" },
          { "internalType": "int24", "name": "pt", "type": "int24" },
          { "internalType": "bool", "name": "sellXEarnY", "type": "bool" },
          { "internalType": "bool", "name": "active", "type": "bool" }
        ],
        "internalType": "struct LimOrder[]",
        "name": "activeLimitOrder",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "idx", "type": "uint256" }
    ],
    "name": "getDeactiveOrder",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "lastAccEarn", "type": "uint256" },
          { "internalType": "uint128", "name": "amount", "type": "uint128" },
          { "internalType": "uint128", "name": "sellingRemain", "type": "uint128" },
          { "internalType": "uint128", "name": "accSellingDec", "type": "uint128" },
          { "internalType": "uint128", "name": "sellingDec", "type": "uint128" },
          { "internalType": "uint128", "name": "earn", "type": "uint128" },
          { "internalType": "uint128", "name": "poolId", "type": "uint128" },
          { "internalType": "uint128", "name": "timestamp", "type": "uint128" },
          { "internalType": "int24", "name": "pt", "type": "int24" },
          { "internalType": "bool", "name": "sellXEarnY", "type": "bool" },
          { "internalType": "bool", "name": "active", "type": "bool" }
        ],
        "internalType": "struct LimOrder",
        "name": "limOrder",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getDeactiveOrders",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "lastAccEarn", "type": "uint256" },
          { "internalType": "uint128", "name": "amount", "type": "uint128" },
          { "internalType": "uint128", "name": "sellingRemain", "type": "uint128" },
          { "internalType": "uint128", "name": "accSellingDec", "type": "uint128" },
          { "internalType": "uint128", "name": "sellingDec", "type": "uint128" },
          { "internalType": "uint128", "name": "earn", "type": "uint128" },
          { "internalType": "uint128", "name": "poolId", "type": "uint128" },
          { "internalType": "uint128", "name": "timestamp", "type": "uint128" },
          { "internalType": "int24", "name": "pt", "type": "int24" },
          { "internalType": "bool", "name": "sellXEarnY", "type": "bool" },
          { "internalType": "bool", "name": "active", "type": "bool" }
        ],
        "internalType": "struct LimOrder[]",
        "name": "deactiveLimitOrder",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getDeactiveSlot",
    "outputs": [
      { "internalType": "uint256", "name": "slotIdx", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes[]", "name": "data", "type": "bytes[]" }
    ],
    "name": "multicall",
    "outputs": [
      { "internalType": "bytes[]", "name": "results", "type": "bytes[]" }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "idx", "type": "uint256" },
      {
        "components": [
          { "internalType": "address", "name": "tokenX", "type": "address" },
          { "internalType": "address", "name": "tokenY", "type": "address" },
          { "internalType": "uint24", "name": "fee", "type": "uint24" },
          { "internalType": "int24", "name": "pt", "type": "int24" },
          { "internalType": "uint128", "name": "amount", "type": "uint128" },
          { "internalType": "bool", "name": "sellXEarnY", "type": "bool" },
          { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "internalType": "struct LimitOrderManager.AddLimOrderParam",
        "name": "addLimitOrderParam",
        "type": "tuple"
      }
    ],
    "name": "newLimOrder",
    "outputs": [
      { "internalType": "uint128", "name": "orderAmount", "type": "uint128" },
      { "internalType": "uint128", "name": "acquire", "type": "uint128" }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "x", "type": "uint256" },
      { "internalType": "uint256", "name": "y", "type": "uint256" },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "payCallback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "tokenX", "type": "address" },
      { "internalType": "address", "name": "tokenY", "type": "address" },
      { "internalType": "uint24", "name": "fee", "type": "uint24" }
    ],
    "name": "pool",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint128", "name": "", "type": "uint128" }
    ],
    "name": "poolAddrs",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "poolIds",
    "outputs": [
      { "internalType": "uint128", "name": "", "type": "uint128" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint128", "name": "", "type": "uint128" }
    ],
    "name": "poolMetas",
    "outputs": [
      { "internalType": "address", "name": "tokenX", "type": "address" },
      { "internalType": "address", "name": "tokenY", "type": "address" },
      { "internalType": "uint24", "name": "fee", "type": "uint24" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "refundETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "sellers",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "minAmount", "type": "uint256" },
      { "internalType": "address", "name": "recipient", "type": "address" }
    ],
    "name": "sweepToken",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "minAmount", "type": "uint256" },
      { "internalType": "address", "name": "recipient", "type": "address" }
    ],
    "name": "unwrapWETH9",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "orderIdx", "type": "uint256" }
    ],
    "name": "updateOrder",
    "outputs": [
      { "internalType": "uint256", "name": "earn", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];
