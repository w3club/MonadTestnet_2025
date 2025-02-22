const axios = require("axios");
const { SocksProxyAgent } = require("socks-proxy-agent");

async function requestFaucet(captchaSolution, tweetUrl, twitterUserId, twitterUsername, walletAddress, proxy) {
  const apiUrl = "https://faucet.trade/api/faucet_form.php";
  const payload = {
    hcaptcha: captchaSolution,
    tweet_url: tweetUrl,
    twitter_user_id: twitterUserId,
    twitter_username: twitterUsername,
    type: "monad_testnet_mon",
    wallet_address: walletAddress
  };
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    "Content-Type": "application/json"
  };

  let agent;
  if (proxy) {
    agent = new SocksProxyAgent(proxy);
  }

  const response = await axios.post(apiUrl, payload, {
    headers,
    ...(agent && { httpsAgent: agent })
  });
  return response.data;
}

module.exports = { requestFaucet };
