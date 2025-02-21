const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const axios = require('axios'); // Se requiere para la llamada directa sin proxy
const inquirer = require('inquirer'); // Para preguntar al usuario
const { requestFaucet, getRandomProxy } = require('./scripts/apis.js');
const colors = require('colors');

// Load wallets from utils/wallets.json
const walletsPath = path.resolve(__dirname, '../../utils/wallets.json');
let wallets = [];
try {
  wallets = JSON.parse(fs.readFileSync(walletsPath, 'utf8'));
} catch (err) {
  console.error("❌ Error reading wallets.json".red, err);
  process.exit(1);
}

// Get full path to solve_captcha.py (located in faucets/official_faucet)
const solveCaptchaPath = path.resolve(__dirname, 'solve_captcha.py');
if (!fs.existsSync(solveCaptchaPath)) {
  console.error(`❌ solve_captcha.py not found at path: ${solveCaptchaPath}`.red);
  process.exit(1);
}

async function main() {
  // Preguntar si se desea usar proxies
  const { useProxies } = await inquirer.prompt({
    type: 'confirm',
    name: 'useProxies',
    message: 'Do you wish to use proxies in faucet claim?',
    default: true
  });

  for (const wallet of wallets) {
    console.log(`\n🔹 Processing Wallet - [${wallet.address}]`.green);
    console.log("⏳ Solving Captcha...".green);

    // Ejecutar solve_captcha.py utilizando spawnSync con la ruta completa
    const spawnResult = spawnSync('python3', [solveCaptchaPath], { encoding: 'utf8' });
    if (spawnResult.error) {
      console.error(`❌ Error executing solve_captcha.py for wallet [${wallet.address}]: ${spawnResult.error}`.red);
      continue;
    }
    if (spawnResult.status !== 0) {
      console.error(`❌ solve_captcha.py exited with code ${spawnResult.status} for wallet [${wallet.address}]: ${spawnResult.stderr}`.red);
      continue;
    }

    let captchaResult;
    try {
      captchaResult = JSON.parse(spawnResult.stdout.trim());
    } catch (e) {
      console.error(`❌ Error parsing captcha output for wallet [${wallet.address}]: ${e.message}`.red);
      continue;
    }
    if (captchaResult.error) {
      console.error(`❌ Captcha solving error for wallet [${wallet.address}]: ${captchaResult.error}`.red);
      continue;
    }
    console.log("✅ Captcha Solved!".green);
    const recaptchaToken = captchaResult.code;

    if (useProxies) {
      // Se utiliza proxy: se obtiene uno y se usa la función requestFaucet
      const proxyUrl = getRandomProxy();
      const match = proxyUrl.match(/-zone-custom-session-([^-\s]+)-sessTime-/);
      const proxyID = match ? match[1] : proxyUrl;
      console.log(`🛡️  Using Proxy ID - [${proxyID}]`.green);

      try {
        const response = await requestFaucet(wallet.address, recaptchaToken);
        if (response.status === 200) {
          console.log(`🚀 Faucet Successfully Claimed for Wallet - [${wallet.address}]`.magenta);
        } else {
          console.error(`❌ Faucet claim failed for wallet [${wallet.address}]. Status: ${response.status}`.red);
        }
      } catch (apiError) {
        console.error(`❌ API error for wallet [${wallet.address}]: ${apiError.message}`.red);
      }
    } else {
      // No se usan proxies: llamada directa a la API sin agente proxy
      console.log("⚠️  Not using proxies for this claim".yellow);
      const url = "https://testnet.monad.xyz/api/claim";
      try {
        const response = await axios.post(
          url,
          {
            address: wallet.address,
            recaptchaToken: recaptchaToken,
            visitorId: "52816d9c2ebb9205f385b2f36073b2a9"
          },
          {
            headers: {
              'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
            }
          }
        );
        if (response.status === 200) {
          console.log(`🚀 Faucet Successfully Claimed for Wallet - [${wallet.address}]`.magenta);
        } else {
          console.error(`❌ Faucet claim failed for wallet [${wallet.address}]. Status: ${response.status}`.red);
        }
      } catch (apiError) {
        console.error(`❌ API error for wallet [${wallet.address}]: ${apiError.message}`.red);
      }
    }
  }
}

main();
