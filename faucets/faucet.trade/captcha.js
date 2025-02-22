#!/usr/bin/env node
const colors = require('colors');
const bestcaptchasolverapi = require('bestcaptchasolver');

let inSolving = false;

function log(txt) {
  console.log(txt);
}

function example_hcaptcha() {
  const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';
  let captcha_id;

  if (!inSolving) {
    inSolving = true;
  } else {
    return log("🚫 Already processing another task".red);
  }

  bestcaptchasolverapi.set_access_token(ACCESS_TOKEN);

  bestcaptchasolverapi.account_balance()
    .then((balance) => {
      log(("💰 Balance: $" + balance).green);
      log("🔍 Solving hCaptcha".blue);
      return bestcaptchasolverapi.submit_hcaptcha({
        page_url: 'https://faucet.trade/monad-testnet-mon-faucet',
        site_key: '0ac6f52e-bb3a-4390-867a-2bec2bf8fdf0'
      });
    })
    .then((id) => {
      captcha_id = id;
      log(("✅ Got ID " + id + ", waiting for completion ...").yellow);
      return bestcaptchasolverapi.retrieve_captcha(id);
    })
    .then((data) => {
      log(("🔑 response: " + JSON.stringify(data.solution)).magenta);
    })
    .catch((err) => {
      log(("❌ Error: " + (err.message || err)).red);
    })
    .then(() => {
      inSolving = false;
    });
}

example_hcaptcha();
