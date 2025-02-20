const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { SocksProxyAgent } = require('socks-proxy-agent');

// Function to read proxies from proxies.txt and return a random proxy URL
function getRandomProxy() {
  // proxies.txt is located at the project root (MonadTestnet)
  const proxiesPath = path.join(__dirname, '../../../proxies.txt');
  let proxies = [];
  try {
    const data = fs.readFileSync(proxiesPath, 'utf8');
    // Split by newlines and remove empty lines
    proxies = data.split(/\r?\n/).map(line => line.trim()).filter(line => line);
  } catch (err) {
    console.error("❌ Error reading proxies.txt:", err);
    throw err;
  }
  if (proxies.length === 0) {
    throw new Error("No proxies available in proxies.txt");
  }
  const randomIndex = Math.floor(Math.random() * proxies.length);
  return proxies[randomIndex];
}

async function requestFaucet(address, recaptchaToken) {
  const url = "https://testnet.monad.xyz/api/claim";
  const proxyUrl = getRandomProxy();
  const agent = new SocksProxyAgent(proxyUrl);

  try {
    const response = await axios.post(
      url,
      {
        address: address,
        recaptchaToken: recaptchaToken,
        visitorId: "52816d9c2ebb9205f385b2f36073b2a9"
      },
      {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
        },
        httpAgent: agent,
        httpsAgent: agent
      }
    );
    return response;
  } catch (err) {
    throw err;
  }
}

module.exports = { requestFaucet, getRandomProxy };
