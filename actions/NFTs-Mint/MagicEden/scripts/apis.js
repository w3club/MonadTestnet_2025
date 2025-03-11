const axios = require('axios');
const { ethers } = require('ethers');

async function quoteMintData(nftContract, wallet) {
  const payload = {
    chain: "monad-testnet",
    collectionId: nftContract,
    kind: "public",
    nftAmount: 1,
    protocol: "ERC1155",
    tokenId: 0,
    wallet: { address: wallet, chain: "monad-testnet" },
    address: wallet,
    chain: "monad-testnet"
  };

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    "Content-Type": "application/json"
  };

  try {
    const response = await axios.post(
      "https://api-mainnet.magiceden.io/v4/self_serve/nft/mint_token",
      payload,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("❌ AxiosError in quoteMintData:", error.message);
    if (error.response) {
      console.error("Response Data:", error.response.data);
    }
    throw error;
  }
}

async function getAvailableMints() {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
  };

  try {
    const response = await axios.get(
      "https://api-mainnet.magiceden.io/v3/rtp/monad-testnet/collections/trending-mints/v1?period=1h&type=any&limit=200&useNonFlaggedFloorAsk=true",
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("❌ AxiosError in getAvailableMints:", error.message);
    if (error.response) {
      console.error("Response Data:", error.response.data);
    }
    throw error;
  }
}

async function getAvailableItems(wallet) {
  const url = `https://api-mainnet.magiceden.io/v3/rtp/monad-testnet/users/${wallet}/collections/v4?limit=1000&includeOnSaleCount=true&excludeSpam=true&offset=0`;
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
  };

  try {
    const response = await axios.get(url, { headers });
    const filtered = response.data.collections.map(item => {
      const collection = item.collection;
      const ownership = item.ownership;
      return {
        id: collection.id,
        name: collection.name,
        isSpam: collection.isSpam,
        native: collection.floorAskPrice && collection.floorAskPrice.amount
          ? collection.floorAskPrice.amount.native
          : null,
        tokenCount: ownership.tokenCount,
        onSaleCount: ownership.onSaleCount
      };
    });
    return filtered;
  } catch (error) {
    console.error("❌ AxiosError in getAvailableItems:", error.message);
    if (error.response) {
      console.error("Response Data:", error.response.data);
    }
    throw error;
  }
}

module.exports = { quoteMintData, getAvailableMints, getAvailableItems };
