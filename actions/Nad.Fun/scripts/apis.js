// scripts/apis.js

const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

async function getTokenURI(fileName, fileSize, fileType) {
  const url = "https://r2-access-worker.jeeterlabs.workers.dev/get-upload-url";
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    "Content-Type": "application/json"
  };

  const payload = { fileName, fileSize, fileType };

  try {
    const response = await axios.post(url, payload, { headers });
    if (response.status === 200 && response.data.success) {
      return response.data.fileUrl;
    } else {
      throw new Error(`Unexpected response: ${response.status} - ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error("Error in getTokenURI:", error);
    throw error;
  }
}

async function getMetadataTokenURI(tokenName, tokenSymbol, imageURI, description) {
  const url = "https://r2-access-worker.jeeterlabs.workers.dev/get-metadata-upload-url";
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    "Content-Type": "application/json"
  };

  // Automatically generate a unique metadata filename using UUID
  const metadataFileName = `metadata-${uuidv4()}.json`;

  const payload = {
    fileName: metadataFileName,
    metadata: {
      name: tokenName,
      symbol: tokenSymbol,
      description: description,
      home_page: "",
      image_uri: imageURI,
      telegram: "",
      twitter: ""
    }
  };

  try {
    const response = await axios.post(url, payload, { headers });
    if (response.status === 200 && response.data.success) {
      // Return fileUrl as tokenURI
      return response.data.fileUrl;
    } else {
      throw new Error(`Metadata upload failed: ${response.status} - ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error("Error in getMetadataTokenURI:", error);
    throw error;
  }
}

async function getRecentLaunchedTokens() {
  const url = "https://testnet-api-server.nad.fun/order/latest_trade?page=1&limit=32";
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    "Content-Type": "application/json"
  };
  try {
    const response = await axios.get(url, { headers });
    if (response.status === 200 && response.data.order_token) {
      return response.data.order_token;
    } else {
      throw new Error(`Unexpected response: ${response.status} - ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error("Error in getRecentLaunchedTokens:", error);
    throw error;
  }
}

async function getTokenPrice(tokenAddress) {
  const url = `https://testnet-api-server.nad.fun/trade/market/${tokenAddress}`;
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
  };
  try {
    const response = await axios.get(url, { headers });
    if (response.status === 200 && response.data.price) {
      return response.data;
    } else {
      throw new Error(`Unexpected response: ${response.status} - ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error("Error in getTokenPrice:", error);
    throw error;
  }
}

module.exports = {
  getTokenURI,
  getMetadataTokenURI,
  getRecentLaunchedTokens,
  getTokenPrice
};
