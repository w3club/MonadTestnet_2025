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
        // Extraer signature, nonce y deadline
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

// Función para generar nombres automáticamente con el payload requerido
async function generateNames() {
  const url = 'https://www.spinxo.com/services/NameService.asmx/GetNames';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'x-requested-with': 'XMLHttpRequest',
    'Content-Type': 'application/json',
    'Cookie': 'ASP.NET_SessionId=2xn1ffnlt1mimmnckzyad5vq; _ga=GA1.1.1989310309.1741995047; __gads=ID=1c2e54f8e1e1c027:T=1741995046:RT=1741995046:S=ALNI_MbXP1UNy10b-033cjtraOGShpeXhg; __gpi=UID=000010723081a32f:T=1741995046:RT=1741995046:S=ALNI_MZJDL-DZfq_U9ZP9_o0ly8E1GV1zA; __eoi=ID=158449c41027a09d:T=1741995046:RT=1741995046:S=AA-AfjZEad01m_1kAng7ARGGMMei; FCNEC=%5B%5B%22AKsRol8xTdvFwGiDJGFlxb1Bi57x2k55E4Hgwo-sYXyR87jTEVTtxP2rdNPqivDvVI8FPp2Es36P78MlV0KhCH-PEjQbCTlNekJFuedGJMlt78lYfMGL5efA0qEsiKLDs0MhWMHU5ImOlBvQelgohkYRZBSc8w7wOA%3D%3D%22%5D%5D; _ga_2YVCQ4QDRJ=GS1.1.1741995046.1.1.1741995599.48.0.0; _ga_MDPVTNLB3G=GS1.1.1741995047.1.1.1741995599.48.0.0'
  };

  // Se agrega el payload solicitado con la propiedad "snr" y sus campos
  const payload = {
    snr: {
      category: 0,
      UserName: "",
      Hobbies: "",
      ThingsILike: "",
      Numbers: "",
      WhatAreYouLike: "",
      Words: "",
      CharacterTypeSlug: "",
      GenderAny: false,
      GenderFemale: false,
      GenderMale: false,
      LanguageCode: "es",
      NamesLanguageID: "45",
      OneWord: false,
      PersonalitySlug: "",
      Rhyming: false,
      ScreenNameStyleString: "",
      Stub: "usernames",
      ThemeSlug: "",
      UseExactWords: false
    }
  };

  try {
    const response = await axios.post(url, payload, { headers });
    if (response.status === 200) {
      // Se asume que la respuesta tiene la estructura: { d: { Names: [ ... ] } }
      const names = response.data.d.Names;
      return names;
    } else {
      throw new Error(`HTTP error: ${response.status}`);
    }
  } catch (error) {
    console.error("Error generating names:", error);
    throw error;
  }
}

module.exports = { getSignatureToBuy, generateNames };
