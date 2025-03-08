// scripts/apis.js

const axios = require('axios');

async function getSignatureToBuy(username, wallet) {
  const url = `https://api.nad.domains/register/signature?name=${encodeURIComponent(username)}&nameOwner=${encodeURIComponent(wallet)}&setAsPrimaryName=true&referrer=0x0000000000000000000000000000000000000000&discountKey=0x0000000000000000000000000000000000000000000000000000000000000000&discountClaimProof=0x0000000000000000000000000000000000000000000000000000000000000000&chainId=10143`;

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
  };

  try {
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
      const data = response.data;
      if (data.code === 0 && data.success) {
        // Extract signature, nonce, and deadline
        const { signature, nonce, deadline } = data;
        return { signature, nonce, deadline };
      } else {
        throw new Error(`API error: ${data.message || 'Unknown error'}`);
      }
    } else {
      throw new Error(`HTTP error: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching signature:", error);
    throw error;
  }
}

module.exports = { getSignatureToBuy };
