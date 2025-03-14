// ABI.js

const ABI = [
  "function swapExactNativeForTokens(address tokenOut, uint24 fee, uint256 amountOutMin) external payable returns (uint256 amountOut)",
  "function swapExactTokensForNative(address tokenIn, uint24 fee, uint256 amountIn, uint256 nativeAmountMin) external returns (uint256 nativeAmountOut)",
  "function swap(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint256 amountOutMin) external returns (uint256 amountOut)",
  "function calculateNativeToTokenAmountOutMin(address tokenOut, uint24 fee, uint256 amountIn, uint24 slippageBps) external view returns (uint256 amountOutMin)",
  "function calculateTokenToNativeAmountOutMin(address tokenIn, uint24 fee, uint256 amountIn, uint24 slippageBps) external view returns (uint256 nativeAmountMin)",
  "function calculateAmountOutMin(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint24 slippageBps) external view returns (uint256 amountOutMin)"
];

const TOKENS = [
  {
    symbol: "USDC",
    address: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea",
    decimals: 6
  },
  {
    symbol: "USDT",
    address: "0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D",
    decimals: 6
  },
  {
    symbol: "WBTC",
    address: "0xcf5a6076cfa32686c0Df13aBaDa2b40dec133F1d",
    decimals: 18
  },
  {
    symbol: "WMON",
    address: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
    decimals: 18
  },
  {
    symbol: "WETH",
    address: "0xB5a30b0FDc5EA94A52fDc42e3E9760Cb8449Fb37",
    decimals: 18
  },
  {
    symbol: "WSOL",
    address: "0x5387C85A4965769f6B0Df430638a1388493486F1",
    decimals: 18
  }
];

const ROUTER_CONTRACT = "0x8facA0CBe979152F9b93018f8B475fa0a35D667E";

module.exports = { ABI, TOKENS, ROUTER_CONTRACT };
