const FACTORY_CONTRACT = "0x822EB1ADD41cf87C3F178100596cf24c9a6442f6";
const ROUTER_CONTRACT = "0x822EB1ADD41cf87C3F178100596cf24c9a6442f6";
const MON_CONTRACT = "0x0000000000000000000000000000000000000000";

const ABI = [
  // createCurve
  {
    "type": "function",
    "name": "createCurve",
    "inputs": [
      { "name": "creator", "type": "address", "internalType": "address" },
      { "name": "name", "type": "string", "internalType": "string" },
      { "name": "symbol", "type": "string", "internalType": "string" },
      { "name": "tokenURI", "type": "string", "internalType": "string" },
      { "name": "amountIn", "type": "uint256", "internalType": "uint256" },
      { "name": "fee", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "curve", "type": "address", "internalType": "address" },
      { "name": "token", "type": "address", "internalType": "address" },
      { "name": "virtualNative", "type": "uint256", "internalType": "uint256" },
      { "name": "virtualToken", "type": "uint256", "internalType": "uint256" },
      { "name": "amountOut", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "payable"
  },
  // getReserves
  {
    "type": "function",
    "name": "getReserves",
    "inputs": [],
    "outputs": [
      { "name": "reserveWNative", "type": "uint256", "internalType": "uint256" },
      { "name": "reserveToken", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  // getVirtualReserves
  {
    "type": "function",
    "name": "getVirtualReserves",
    "inputs": [],
    "outputs": [
      { "name": "virtualWNative", "type": "uint256", "internalType": "uint256" },
      { "name": "virtualToken", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  // getCurve
  {
    "type": "function",
    "name": "getCurve",
    "inputs": [
      { "name": "token", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "curve", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "view"
  },
  // getDexFactory
  {
    "type": "function",
    "name": "getDexFactory",
    "inputs": [],
    "outputs": [
      { "name": "dexFactory", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "view"
  },
  // buy
  {
    "type": "function",
    "name": "buy",
    "inputs": [
      { "name": "amountIn", "type": "uint256", "internalType": "uint256" },
      { "name": "fee", "type": "uint256", "internalType": "uint256" },
      { "name": "token", "type": "address", "internalType": "address" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "deadline", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  // exactOutBuy
  {
    "type": "function",
    "name": "exactOutBuy",
    "inputs": [
      { "name": "amountInMax", "type": "uint256", "internalType": "uint256" },
      { "name": "amountOut", "type": "uint256", "internalType": "uint256" },
      { "name": "token", "type": "address", "internalType": "address" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "deadline", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  // exactOutSell
  {
    "type": "function",
    "name": "exactOutSell",
    "inputs": [
      { "name": "amountInMax", "type": "uint256", "internalType": "uint256" },
      { "name": "amountOut", "type": "uint256", "internalType": "uint256" },
      { "name": "token", "type": "address", "internalType": "address" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "deadline", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  // protectBuy
  {
    "type": "function",
    "name": "protectBuy",
    "inputs": [
      { "name": "amountIn", "type": "uint256", "internalType": "uint256" },
      { "name": "amountOutMin", "type": "uint256", "internalType": "uint256" },
      { "name": "fee", "type": "uint256", "internalType": "uint256" },
      { "name": "token", "type": "address", "internalType": "address" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "deadline", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  // protectSell
  {
    "type": "function",
    "name": "protectSell",
    "inputs": [
      { "name": "amountIn", "type": "uint256", "internalType": "uint256" },
      { "name": "amountOutMin", "type": "uint256", "internalType": "uint256" },
      { "name": "token", "type": "address", "internalType": "address" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "deadline", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  // getAmountIn
  {
    "type": "function",
    "name": "getAmountIn",
    "inputs": [
      { "name": "amountOut", "type": "uint256", "internalType": "uint256" },
      { "name": "k", "type": "uint256", "internalType": "uint256" },
      { "name": "reserveIn", "type": "uint256", "internalType": "uint256" },
      { "name": "reserveOut", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "amountIn", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "pure"
  },
  // getAmountOut
  {
    "type": "function",
    "name": "getAmountOut",
    "inputs": [
      { "name": "amountIn", "type": "uint256", "internalType": "uint256" },
      { "name": "k", "type": "uint256", "internalType": "uint256" },
      { "name": "reserveIn", "type": "uint256", "internalType": "uint256" },
      { "name": "reserveOut", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "amountOut", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "pure"
  },
  // getCurveData (versión 2: recibe solo "curve")
  {
    "type": "function",
    "name": "getCurveData",
    "inputs": [
      { "name": "curve", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "virtualNative", "type": "uint256", "internalType": "uint256" },
      { "name": "virtualToken", "type": "uint256", "internalType": "uint256" },
      { "name": "k", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  // getCurveData (nueva versión: recibe factory y token)
  {
    "type": "function",
    "name": "getCurveData",
    "inputs": [
      { "name": "_factory", "type": "address", "internalType": "address" },
      { "name": "token", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "curve", "type": "address", "internalType": "address" },
      { "name": "virtualNative", "type": "uint256", "internalType": "uint256" },
      { "name": "virtualToken", "type": "uint256", "internalType": "uint256" },
      { "name": "k", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  // allowance
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      { "name": "owner", "type": "address", "internalType": "address" },
      { "name": "spender", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  // approve
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      { "name": "spender", "type": "address", "internalType": "address" },
      { "name": "value", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "nonpayable"
  },
  // balanceOf
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      { "name": "account", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  // totalSupply
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  // allPairs
  {
    "type": "function",
    "name": "allPairs",
    "inputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "pair", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "view"
  },
  // createPair
  {
    "type": "function",
    "name": "createPair",
    "inputs": [
      { "name": "tokenA", "type": "address", "internalType": "address" },
      { "name": "tokenB", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "pair", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "nonpayable"
  },
  // getPair
  {
    "type": "function",
    "name": "getPair",
    "inputs": [
      { "name": "tokenA", "type": "address", "internalType": "address" },
      { "name": "tokenB", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "pair", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "view"
  },
  // swap
  {
    "type": "function",
    "name": "swap",
    "inputs": [
      { "name": "amount0Out", "type": "uint256", "internalType": "uint256" },
      { "name": "amount1Out", "type": "uint256", "internalType": "uint256" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "data", "type": "bytes", "internalType": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  // addLiquidity
  {
    "type": "function",
    "name": "addLiquidity",
    "inputs": [
      { "name": "tokenA", "type": "address", "internalType": "address" },
      { "name": "tokenB", "type": "address", "internalType": "address" },
      { "name": "amountADesired", "type": "uint256", "internalType": "uint256" },
      { "name": "amountBDesired", "type": "uint256", "internalType": "uint256" },
      { "name": "amountAMin", "type": "uint256", "internalType": "uint256" },
      { "name": "amountBMin", "type": "uint256", "internalType": "uint256" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "deadline", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "amountA", "type": "uint256", "internalType": "uint256" },
      { "name": "amountB", "type": "uint256", "internalType": "uint256" },
      { "name": "liquidity", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "nonpayable"
  },
  // addLiquidityNative
  {
    "type": "function",
    "name": "addLiquidityNative",
    "inputs": [
      { "name": "token", "type": "address", "internalType": "address" },
      { "name": "amountTokenDesired", "type": "uint256", "internalType": "uint256" },
      { "name": "amountTokenMin", "type": "uint256", "internalType": "uint256" },
      { "name": "amountNativeMin", "type": "uint256", "internalType": "uint256" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "deadline", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "amountToken", "type": "uint256", "internalType": "uint256" },
      { "name": "amountNative", "type": "uint256", "internalType": "uint256" },
      { "name": "liquidity", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "payable"
  },
  // factory
  {
    "type": "function",
    "name": "factory",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "view"
  },
  // getAmountsIn
  {
    "type": "function",
    "name": "getAmountsIn",
    "inputs": [
      { "name": "amountOut", "type": "uint256", "internalType": "uint256" },
      { "name": "path", "type": "address[]", "internalType": "address[]" }
    ],
    "outputs": [
      { "name": "amounts", "type": "uint256[]", "internalType": "uint256[]" }
    ],
    "stateMutability": "view"
  },
  // getAmountsOut
  {
    "type": "function",
    "name": "getAmountsOut",
    "inputs": [
      { "name": "amountIn", "type": "uint256", "internalType": "uint256" },
      { "name": "path", "type": "address[]", "internalType": "address[]" }
    ],
    "outputs": [
      { "name": "amounts", "type": "uint256[]", "internalType": "uint256[]" }
    ],
    "stateMutability": "view"
  },
  // quote
  {
    "type": "function",
    "name": "quote",
    "inputs": [
      { "name": "amountA", "type": "uint256", "internalType": "uint256" },
      { "name": "reserveA", "type": "uint256", "internalType": "uint256" },
      { "name": "reserveB", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "amountB", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "pure"
  },
  // removeLiquidity
  {
    "type": "function",
    "name": "removeLiquidity",
    "inputs": [
      { "name": "tokenA", "type": "address", "internalType": "address" },
      { "name": "tokenB", "type": "address", "internalType": "address" },
      { "name": "liquidity", "type": "uint256", "internalType": "uint256" },
      { "name": "amountAMin", "type": "uint256", "internalType": "uint256" },
      { "name": "amountBMin", "type": "uint256", "internalType": "uint256" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "deadline", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "amountA", "type": "uint256", "internalType": "uint256" },
      { "name": "amountB", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "nonpayable"
  },
  // removeLiquidityNative
  {
    "type": "function",
    "name": "removeLiquidityNative",
    "inputs": [
      { "name": "token", "type": "address", "internalType": "address" },
      { "name": "liquidity", "type": "uint256", "internalType": "uint256" },
      { "name": "amountTokenMin", "type": "uint256", "internalType": "uint256" },
      { "name": "amountNativeMin", "type": "uint256", "internalType": "uint256" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "deadline", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "amountToken", "type": "uint256", "internalType": "uint256" },
      { "name": "amountNative", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "nonpayable"
  },
  // swapExactNativeForTokens
  {
    "type": "function",
    "name": "swapExactNativeForTokens",
    "inputs": [
      { "name": "amountOutMin", "type": "uint256", "internalType": "uint256" },
      { "name": "path", "type": "address[]", "internalType": "address[]" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "deadline", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "amounts", "type": "uint256[]", "internalType": "uint256[]" }
    ],
    "stateMutability": "payable"
  },
  // swapExactTokensForNative
  {
    "type": "function",
    "name": "swapExactTokensForNative",
    "inputs": [
      { "name": "amountIn", "type": "uint256", "internalType": "uint256" },
      { "name": "amountOutMin", "type": "uint256", "internalType": "uint256" },
      { "name": "path", "type": "address[]", "internalType": "address[]" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "deadline", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "amounts", "type": "uint256[]", "internalType": "uint256[]" }
    ],
    "stateMutability": "nonpayable"
  },
  // swapExactTokensForTokens
  {
    "type": "function",
    "name": "swapExactTokensForTokens",
    "inputs": [
      { "name": "amountIn", "type": "uint256", "internalType": "uint256" },
      { "name": "amountOutMin", "type": "uint256", "internalType": "uint256" },
      { "name": "path", "type": "address[]", "internalType": "address[]" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "deadline", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "amounts", "type": "uint256[]", "internalType": "uint256[]" }
    ],
    "stateMutability": "nonpayable"
  }
];

module.exports = { FACTORY_CONTRACT, ROUTER_CONTRACT, MON_CONTRACT, ABI };
