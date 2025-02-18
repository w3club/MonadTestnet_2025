module.exports = {
  // Addresses
  FAUCET_CONTRACT: "0x181579497d5c4EfEC2424A21095907ED7d91ac9A",
  USDC_CONTRACT: "0x924F1Bf31b19a7f9695F3FC6c69C2BA668Ea4a0a",
  USDT_CONTRACT: "0x9eBcD0Ab11D930964F8aD66425758E65c53A7DF1",
  STAKE_CONTRACT: "", // Draft – not yet configured

  // ABIs
  FAUCET_ABI: [
    "function claimToken(address token) external"
  ],
  ERC20_ABI: [
    "function balanceOf(address owner) view returns (uint256)"
  ],
  STAKE_ABI: [
    "function stake(address token, uint256 amount) external"
  ]
};
