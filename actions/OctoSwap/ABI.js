const ABI = {
  router: [
    {
      "type": "constructor",
      "inputs": [
        { "internalType": "address", "name": "_factory", "type": "address" },
        { "internalType": "address", "name": "_WETH", "type": "address" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "WETH",
      "inputs": [],
      "outputs": [
        { "internalType": "address", "name": "", "type": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "addLiquidity",
      "inputs": [
        { "internalType": "address", "name": "tokenA", "type": "address" },
        { "internalType": "address", "name": "tokenB", "type": "address" },
        { "internalType": "uint256", "name": "amountADesired", "type": "uint256" },
        { "internalType": "uint256", "name": "amountBDesired", "type": "uint256" },
        { "internalType": "uint256", "name": "amountAMin", "type": "uint256" },
        { "internalType": "uint256", "name": "amountBMin", "type": "uint256" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "outputs": [
        { "internalType": "uint256", "name": "amountA", "type": "uint256" },
        { "internalType": "uint256", "name": "amountB", "type": "uint256" },
        { "internalType": "uint256", "name": "liquidity", "type": "uint256" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "addLiquidityETH",
      "inputs": [
        { "internalType": "address", "name": "token", "type": "address" },
        { "internalType": "uint256", "name": "amountTokenDesired", "type": "uint256" },
        { "internalType": "uint256", "name": "amountTokenMin", "type": "uint256" },
        { "internalType": "uint256", "name": "amountETHMin", "type": "uint256" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "outputs": [
        { "internalType": "uint256", "name": "amountToken", "type": "uint256" },
        { "internalType": "uint256", "name": "amountETH", "type": "uint256" },
        { "internalType": "uint256", "name": "liquidity", "type": "uint256" }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "factory",
      "inputs": [],
      "outputs": [
        { "internalType": "address", "name": "", "type": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getAmountIn",
      "inputs": [
        { "internalType": "uint256", "name": "amountOut", "type": "uint256" },
        { "internalType": "uint256", "name": "reserveIn", "type": "uint256" },
        { "internalType": "uint256", "name": "reserveOut", "type": "uint256" }
      ],
      "outputs": [
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "getAmountOut",
      "inputs": [
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
        { "internalType": "uint256", "name": "reserveIn", "type": "uint256" },
        { "internalType": "uint256", "name": "reserveOut", "type": "uint256" }
      ],
      "outputs": [
        { "internalType": "uint256", "name": "amountOut", "type": "uint256" }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "getAmountsIn",
      "inputs": [
        { "internalType": "uint256", "name": "amountOut", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" }
      ],
      "outputs": [
        { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getAmountsOut",
      "inputs": [
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" }
      ],
      "outputs": [
        { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "quote",
      "inputs": [
        { "internalType": "uint256", "name": "amountA", "type": "uint256" },
        { "internalType": "uint256", "name": "reserveA", "type": "uint256" },
        { "internalType": "uint256", "name": "reserveB", "type": "uint256" }
      ],
      "outputs": [
        { "internalType": "uint256", "name": "amountB", "type": "uint256" }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "removeLiquidity",
      "inputs": [
        { "internalType": "address", "name": "tokenA", "type": "address" },
        { "internalType": "address", "name": "tokenB", "type": "address" },
        { "internalType": "uint256", "name": "liquidity", "type": "uint256" },
        { "internalType": "uint256", "name": "amountAMin", "type": "uint256" },
        { "internalType": "uint256", "name": "amountBMin", "type": "uint256" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "outputs": [
        { "internalType": "uint256", "name": "amountA", "type": "uint256" },
        { "internalType": "uint256", "name": "amountB", "type": "uint256" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "removeLiquidityETH",
      "inputs": [
        { "internalType": "address", "name": "token", "type": "address" },
        { "internalType": "uint256", "name": "liquidity", "type": "uint256" },
        { "internalType": "uint256", "name": "amountTokenMin", "type": "uint256" },
        { "internalType": "uint256", "name": "amountETHMin", "type": "uint256" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "outputs": [
        { "internalType": "uint256", "name": "amountToken", "type": "uint256" },
        { "internalType": "uint256", "name": "amountETH", "type": "uint256" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "removeLiquidityETHSupportingFeeOnTransferTokens",
      "inputs": [
        { "internalType": "address", "name": "token", "type": "address" },
        { "internalType": "uint256", "name": "liquidity", "type": "uint256" },
        { "internalType": "uint256", "name": "amountTokenMin", "type": "uint256" },
        { "internalType": "uint256", "name": "amountETHMin", "type": "uint256" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "outputs": [
        { "internalType": "uint256", "name": "amountETH", "type": "uint256" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "removeLiquidityETHWithPermit",
      "inputs": [
        { "internalType": "address", "name": "token", "type": "address" },
        { "internalType": "uint256", "name": "liquidity", "type": "uint256" },
        { "internalType": "uint256", "name": "amountTokenMin", "type": "uint256" },
        { "internalType": "uint256", "name": "amountETHMin", "type": "uint256" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" },
        { "internalType": "bool", "name": "approveMax", "type": "bool" },
        { "internalType": "uint8", "name": "v", "type": "uint8" },
        { "internalType": "bytes32", "name": "r", "type": "bytes32" },
        { "internalType": "bytes32", "name": "s", "type": "bytes32" }
      ],
      "outputs": [
        { "internalType": "uint256", "name": "amountToken", "type": "uint256" },
        { "internalType": "uint256", "name": "amountETH", "type": "uint256" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens",
      "inputs": [
        { "internalType": "address", "name": "token", "type": "address" },
        { "internalType": "uint256", "name": "liquidity", "type": "uint256" },
        { "internalType": "uint256", "name": "amountTokenMin", "type": "uint256" },
        { "internalType": "uint256", "name": "amountETHMin", "type": "uint256" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" },
        { "internalType": "bool", "name": "approveMax", "type": "bool" },
        { "internalType": "uint8", "name": "v", "type": "uint8" },
        { "internalType": "bytes32", "name": "r", "type": "bytes32" },
        { "internalType": "bytes32", "name": "s", "type": "bytes32" }
      ],
      "outputs": [
        { "internalType": "uint256", "name": "amountETH", "type": "uint256" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "removeLiquidityWithPermit",
      "inputs": [
        { "internalType": "address", "name": "tokenA", "type": "address" },
        { "internalType": "address", "name": "tokenB", "type": "address" },
        { "internalType": "uint256", "name": "liquidity", "type": "uint256" },
        { "internalType": "uint256", "name": "amountAMin", "type": "uint256" },
        { "internalType": "uint256", "name": "amountBMin", "type": "uint256" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" },
        { "internalType": "bool", "name": "approveMax", "type": "bool" },
        { "internalType": "uint8", "name": "v", "type": "uint8" },
        { "internalType": "bytes32", "name": "r", "type": "bytes32" },
        { "internalType": "bytes32", "name": "s", "type": "bytes32" }
      ],
      "outputs": [
        { "internalType": "uint256", "name": "amountA", "type": "uint256" },
        { "internalType": "uint256", "name": "amountB", "type": "uint256" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "swapETHForExactTokens",
      "inputs": [
        { "internalType": "uint256", "name": "amountOut", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "outputs": [
        { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "swapExactETHForTokens",
      "inputs": [
        { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "outputs": [
        { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "swapExactETHForTokensSupportingFeeOnTransferTokens",
      "inputs": [
        { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "swapExactTokensForETH",
      "inputs": [
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
        { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "outputs": [
        { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "swapExactTokensForETHSupportingFeeOnTransferTokens",
      "inputs": [
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
        { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "swapExactTokensForTokens",
      "inputs": [
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
        { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "outputs": [
        { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "swapExactTokensForTokensSupportingFeeOnTransferTokens",
      "inputs": [
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
        { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "swapTokensForExactETH",
      "inputs": [
        { "internalType": "uint256", "name": "amountOut", "type": "uint256" },
        { "internalType": "uint256", "name": "amountInMax", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "outputs": [
        { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "swapTokensForExactTokens",
      "inputs": [
        { "internalType": "uint256", "name": "amountOut", "type": "uint256" },
        { "internalType": "uint256", "name": "amountInMax", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "outputs": [
        { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "receive",
      "stateMutability": "payable"
    }
  ],
  factory: [
    {
      "type": "constructor",
      "inputs": [
        { "internalType": "address", "name": "_feeToSetter", "type": "address" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "allPairs",
      "inputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "outputs": [
        { "internalType": "address", "name": "", "type": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "allPairsLength",
      "inputs": [],
      "outputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "createPair",
      "inputs": [
        { "internalType": "address", "name": "tokenA", "type": "address" },
        { "internalType": "address", "name": "tokenB", "type": "address" }
      ],
      "outputs": [
        { "internalType": "address", "name": "pair", "type": "address" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "feeTo",
      "inputs": [],
      "outputs": [
        { "internalType": "address", "name": "", "type": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "feeToSetter",
      "inputs": [],
      "outputs": [
        { "internalType": "address", "name": "", "type": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getPair",
      "inputs": [
        { "internalType": "address", "name": "", "type": "address" },
        { "internalType": "address", "name": "", "type": "address" }
      ],
      "outputs": [
        { "internalType": "address", "name": "", "type": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "pairCodeHash",
      "inputs": [],
      "outputs": [
        { "internalType": "bytes32", "name": "", "type": "bytes32" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "setFeeTo",
      "inputs": [
        { "internalType": "address", "name": "_feeTo", "type": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "setFeeToSetter",
      "inputs": [
        { "internalType": "address", "name": "_feeToSetter", "type": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    }
  ],
  token: [
    {
      "type": "function",
      "name": "name",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "string" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "approve",
      "inputs": [
        { "name": "guy", "type": "address" },
        { "name": "wad", "type": "uint256" }
      ],
      "outputs": [
        { "name": "", "type": "bool" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "totalSupply",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "transferFrom",
      "inputs": [
        { "name": "src", "type": "address" },
        { "name": "dst", "type": "address" },
        { "name": "wad", "type": "uint256" }
      ],
      "outputs": [
        { "name": "", "type": "bool" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "withdraw",
      "inputs": [
        { "name": "wad", "type": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "decimals",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "uint8" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "balanceOf",
      "inputs": [
        { "name": "", "type": "address" }
      ],
      "outputs": [
        { "name": "", "type": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "symbol",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "string" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "transfer",
      "inputs": [
        { "name": "dst", "type": "address" },
        { "name": "wad", "type": "uint256" }
      ],
      "outputs": [
        { "name": "", "type": "bool" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "deposit",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "allowance",
      "inputs": [
        { "name": "", "type": "address" },
        { "name": "", "type": "address" }
      ],
      "outputs": [
        { "name": "", "type": "uint256" }
      ],
      "stateMutability": "view"
    }
  ],
  pair: [
    {
      "type": "constructor",
      "inputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "DOMAIN_SEPARATOR",
      "inputs": [],
      "outputs": [
        { "internalType": "bytes32", "name": "", "type": "bytes32" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "MINIMUM_LIQUIDITY",
      "inputs": [],
      "outputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "PERMIT_TYPEHASH",
      "inputs": [],
      "outputs": [
        { "internalType": "bytes32", "name": "", "type": "bytes32" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "allowance",
      "inputs": [
        { "internalType": "address", "name": "", "type": "address" },
        { "internalType": "address", "name": "", "type": "address" }
      ],
      "outputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "approve",
      "inputs": [
        { "name": "spender", "type": "address" },
        { "name": "value", "type": "uint256" }
      ],
      "outputs": [
        { "name": "", "type": "bool" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "balanceOf",
      "inputs": [
        { "name": "", "type": "address" }
      ],
      "outputs": [
        { "name": "", "type": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "burn",
      "inputs": [
        { "name": "to", "type": "address" }
      ],
      "outputs": [
        { "name": "amount0", "type": "uint256" },
        { "name": "amount1", "type": "uint256" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "decimals",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "uint8" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "factory",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getReserves",
      "inputs": [],
      "outputs": [
        { "internalType": "uint112", "name": "_reserve0", "type": "uint112" },
        { "internalType": "uint112", "name": "_reserve1", "type": "uint112" },
        { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "initialize",
      "inputs": [
        { "internalType": "address", "name": "_token0", "type": "address" },
        { "internalType": "address", "name": "_token1", "type": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "kLast",
      "inputs": [],
      "outputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "mint",
      "inputs": [
        { "internalType": "address", "name": "to", "type": "address" }
      ],
      "outputs": [
        { "internalType": "uint256", "name": "liquidity", "type": "uint256" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "name",
      "inputs": [],
      "outputs": [
        { "internalType": "string", "name": "", "type": "string" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "nonces",
      "inputs": [
        { "internalType": "address", "name": "", "type": "address" }
      ],
      "outputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "permit",
      "inputs": [
        { "internalType": "address", "name": "owner", "type": "address" },
        { "internalType": "address", "name": "spender", "type": "address" },
        { "internalType": "uint256", "name": "value", "type": "uint256" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" },
        { "internalType": "uint8", "name": "v", "type": "uint8" },
        { "internalType": "bytes32", "name": "r", "type": "bytes32" },
        { "internalType": "bytes32", "name": "s", "type": "bytes32" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "price0CumulativeLast",
      "inputs": [],
      "outputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "price1CumulativeLast",
      "inputs": [],
      "outputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "skim",
      "inputs": [
        { "internalType": "address", "name": "to", "type": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "swap",
      "inputs": [
        { "internalType": "uint256", "name": "amount0Out", "type": "uint256" },
        { "internalType": "uint256", "name": "amount1Out", "type": "uint256" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "bytes", "name": "data", "type": "bytes" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "symbol",
      "inputs": [],
      "outputs": [
        { "internalType": "string", "name": "", "type": "string" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "sync",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "token0",
      "inputs": [],
      "outputs": [
        { "internalType": "address", "name": "", "type": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "token1",
      "inputs": [],
      "outputs": [
        { "internalType": "address", "name": "", "type": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "totalSupply",
      "inputs": [],
      "outputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "transfer",
      "inputs": [
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "value", "type": "uint256" }
      ],
      "outputs": [
        { "internalType": "bool", "name": "", "type": "bool" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferFrom",
      "inputs": [
        { "internalType": "address", "name": "from", "type": "address" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "value", "type": "uint256" }
      ],
      "outputs": [
        { "internalType": "bool", "name": "", "type": "bool" }
      ],
      "stateMutability": "nonpayable"
    }
  ]
};

const ROUTER_CONTRACT = "0xb6091233aAcACbA45225a2B2121BBaC807aF4255";
const WMON_CONTRACT = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701";
const USDC_CONTRACT = "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea";
const USDT_CONTRACT = "0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D";
const TEST1_CONTRACT = "0xe42cFeCD310d9be03d3F80D605251d8D0Bc5cDF3";
const TEST2_CONTRACT = "0x73c03bc8F8f094c61c668AE9833D7Ed6C04FDc21";
const DAK_CONTRACT = "0x0F0BDEbF0F83cD1EE3974779Bcb7315f9808c714";

module.exports = {
  ABI,
  ROUTER_CONTRACT,
  WMON_CONTRACT,
  USDC_CONTRACT,
  USDT_CONTRACT,
  TEST1_CONTRACT,
  TEST2_CONTRACT,
  DAK_CONTRACT
};
