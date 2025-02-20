const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { SocksProxyAgent } = require('socks-proxy-agent');

function getRandomProxy() {
  const proxiesPath = path.join(__dirname, '../../../proxies.txt');
  let proxies = [];
  try {
    const data = fs.readFileSync(proxiesPath, 'utf8');
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

async function claimFaucet(address) {
  const url = "https://faucet.morkie.xyz/api/monad";
  const proxyUrl = getRandomProxy();
  const agent = new SocksProxyAgent(proxyUrl);
  
  try {
    const response = await axios.post(
      url,
      {
        address: address
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

module.exports = { claimFaucet, getRandomProxy };
