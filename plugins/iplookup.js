const axios = require('axios');

module.exports = {
  command: 'whoisip',
  aliases: ['ip', 'iplookup'],
  category: 'search',
  description: 'هات معلومات المكان من IP أو دومين بسهولة 🔎',
  usage: '.ip <ip او دومين>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args[0];

    if (!query) {
      return await sock.sendMessage(chatId, { 
        text: 'اكتب IP أو دومين عشان أجيبلك معلوماته 😎\nمثال: .ip google.com' 
      });
    }

    try {
      const res = await axios.get(`http://ip-api.com/json/${query}?fields=status,message,country,regionName,city,zip,isp,org,as,query`);
      const data = res.data;

      if (data.status === 'fail') {
        return await sock.sendMessage(chatId, { 
          text: `في مشكلة في البحث: ${data.message} ❌` 
        });
      }

      const info = `
بحث IP أو دومين 🌐
────────────

الهدف 📍: ${data.query}
الدولة 🌍: ${data.country}
المدينة / المنطقة 🏙️: ${data.city}, ${data.regionName}
الرمز البريدي 📮: ${data.zip}
مزود الإنترنت 📡: ${data.isp}
المنظمة 🏢: ${data.org}

النتيجة جتلك من لوسيفر 😈
      `.trim();

      await sock.sendMessage(chatId, { text: info }, { quoted: message });

    } catch (err) {
      await sock.sendMessage(chatId, { 
        text: 'في مشكلة في الشبكة دلوقتي 😓 حاول تاني بعد شوية' 
      });
    }
  }
};