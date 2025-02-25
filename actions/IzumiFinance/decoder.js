// MonadTestnet/actions/IzumiFinance/ABI.js
module.exports = {
  ROUTER_CONTRACT: "0xf6ffe4f3fdc8bbb7f70ffd48e61f17d1e343ddfd",
  QUOTER_ADDRESS: "0x95c5F14106ab4d1dc0cFC9326225287c18c2d247",
  QUOTER_ADDRESS_LIMIT: "0x4d140E612e476A6ba54EF1306b2bA398a5dEff09",
  LIQUIDITY_MANAGER_ADDRESS: "0x1eE5eDC5Fe498a2dD82862746D674DB2a5e7fef6",
  iZiSwapRouterABI: [
    {
      "inputs": [{ "internalType": "bytes[]", "name": "data", "type": "bytes[]" }],
      "name": "multicall",
      "outputs": [{ "internalType": "bytes[]", "name": "results", "type": "bytes[]" }],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [{
        "components": [
          { "internalType": "bytes", "name": "path", "type": "bytes" },
          { "internalType": "address", "name": "recipient", "type": "address" },
          { "internalType": "uint128", "name": "desire", "type": "uint128" },
          { "internalType": "uint256", "name": "maxPayed", "type": "uint256" },
          { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "internalType": "struct Swap.SwapDesireParams",
        "name": "params",
        "type": "tuple"
      }],
      "name": "swapDesire",
      "outputs": [
        { "internalType": "uint256", "name": "cost", "type": "uint256" },
        { "internalType": "uint256", "name": "acquire", "type": "uint256" }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [{
        "components": [
          { "internalType": "bytes", "name": "path", "type": "bytes" },
          { "internalType": "address", "name": "recipient", "type": "address" },
          { "internalType": "uint128", "name": "amount", "type": "uint128" },
          { "internalType": "uint256", "name": "minAcquired", "type": "uint256" },
          { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "internalType": "struct Swap.SwapAmountParams",
        "name": "params",
        "type": "tuple"
      }],
      "name": "swapAmount",
      "outputs": [
        { "internalType": "uint256", "name": "cost", "type": "uint256" },
        { "internalType": "uint256", "name": "acquire", "type": "uint256" }
      ],
      "stateMutability": "payable",
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
      "inputs": [],
      "name": "WETH9",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "tokenX", "type": "address" },
        { "internalType": "address", "name": "tokenY", "type": "address" },
        { "internalType": "uint24", "name": "fee", "type": "uint24" }
      ],
      "name": "pool",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  izumiQuoterABI: [
    {
      "inputs": [
        { "internalType": "address", "name": "_factory", "type": "address" },
        { "internalType": "address", "name": "_weth", "type": "address" }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "WETH9",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "factory",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "bytes[]", "name": "data", "type": "bytes[]" }],
      "name": "multicall",
      "outputs": [{ "internalType": "bytes[]", "name": "results", "type": "bytes[]" }],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint128", "name": "desire", "type": "uint128" },
        { "internalType": "bytes", "name": "path", "type": "bytes" }
      ],
      "name": "swapDesire",
      "outputs": [
        { "internalType": "uint256", "name": "cost", "type": "uint256" },
        { "internalType": "int24[]", "name": "pointAfterList", "type": "int24[]" }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  iZiSwapLiquidityABI: [
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
      "name": "WETH9",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "tuple", "name": "addLiquidityParam", "type": "tuple" }
      ],
      "name": "addLiquidity",
      "outputs": [
        { "internalType": "uint128", "name": "liquidityDelta", "type": "uint128" },
        { "internalType": "uint256", "name": "amountX", "type": "uint256" },
        { "internalType": "uint256", "name": "amountY", "type": "uint256" }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "lid", "type": "uint256" }],
      "name": "burn",
      "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "recipient", "type": "address" },
        { "internalType": "uint256", "name": "lid", "type": "uint256" },
        { "internalType": "uint128", "name": "amountXLim", "type": "uint128" },
        { "internalType": "uint128", "name": "amountYLim", "type": "uint128" }
      ],
      "name": "collect",
      "outputs": [
        { "internalType": "uint256", "name": "amountX", "type": "uint256" },
        { "internalType": "uint256", "name": "amountY", "type": "uint256" }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "tokenX", "type": "address" },
        { "internalType": "address", "name": "tokenY", "type": "address" },
        { "internalType": "uint24", "name": "fee", "type": "uint24" },
        { "internalType": "int24", "name": "initialPoint", "type": "int24" }
      ],
      "name": "createPool",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "lid", "type": "uint256" },
        { "internalType": "uint128", "name": "liquidDelta", "type": "uint128" },
        { "internalType": "uint256", "name": "amountXMin", "type": "uint256" },
        { "internalType": "uint256", "name": "amountYMin", "type": "uint256" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "name": "decLiquidity",
      "outputs": [
        { "internalType": "uint256", "name": "amountX", "type": "uint256" },
        { "internalType": "uint256", "name": "amountY", "type": "uint256" }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "factory",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
      "name": "getApproved",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "owner", "type": "address" },
        { "internalType": "address", "name": "operator", "type": "address" }
      ],
      "name": "isApprovedForAll",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "name": "liquidities",
      "outputs": [
        { "internalType": "int24", "name": "leftPt", "type": "int24" },
        { "internalType": "int24", "name": "rightPt", "type": "int24" },
        { "internalType": "uint128", "name": "liquidity", "type": "uint128" },
        { "internalType": "uint256", "name": "lastFeeScaleX_128", "type": "uint256" },
        { "internalType": "uint256", "name": "lastFeeScaleY_128", "type": "uint256" },
        { "internalType": "uint256", "name": "remainTokenX", "type": "uint256" },
        { "internalType": "uint256", "name": "remainTokenY", "type": "uint256" },
        { "internalType": "uint128", "name": "poolId", "type": "uint128" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "liquidityNum",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "tuple", "name": "mintParam", "type": "tuple" }],
      "name": "mint",
      "outputs": [
        { "internalType": "uint256", "name": "lid", "type": "uint256" },
        { "internalType": "uint128", "name": "liquidity", "type": "uint128" },
        { "internalType": "uint256", "name": "amountX", "type": "uint256" },
        { "internalType": "uint256", "name": "amountY", "type": "uint256" }
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
      "name": "mintDepositCallback",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "bytes[]", "name": "data", "type": "bytes[]" }],
      "name": "multicall",
      "outputs": [{ "internalType": "bytes[]", "name": "results", "type": "bytes[]" }],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
      "name": "ownerOf",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "tokenX", "type": "address" },
        { "internalType": "address", "name": "tokenY", "type": "address" },
        { "internalType": "uint24", "name": "fee", "type": "uint24" }
      ],
      "name": "pool",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "name": "poolIds",
      "outputs": [{ "internalType": "uint128", "name": "", "type": "uint128" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint128", "name": "", "type": "uint128" }],
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
        { "internalType": "address", "name": "from", "type": "address" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "from", "type": "address" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
        { "internalType": "bytes", "name": "_data", "type": "bytes" }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "operator", "type": "address" },
        { "internalType": "bool", "name": "approved", "type": "bool" }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }
      ],
      "name": "supportsInterface",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
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
      "inputs": [],
      "name": "symbol",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }],
      "name": "tokenByIndex",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "owner", "type": "address" },
        { "internalType": "uint256", "name": "index", "type": "uint256" }
      ],
      "name": "tokenOfOwnerByIndex",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
      "name": "tokenURI",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "from", "type": "address" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
      ],
      "name": "transferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
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
    }
  ]
};
