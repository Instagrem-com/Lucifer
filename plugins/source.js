const axios = require('axios');

module.exports = {
  command: 'كود_موقع',
  aliases: ['source', 'viewsource', 'سورس'],
  category: 'اوامـࢪ الاداوات',
  description: 'جلب كود HTML الخام لأي موقع',
  usage: '.getpage <الرابط>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const url = args[0];

    if (!url || !url.startsWith('http')) {
      return await sock.sendMessage(chatId, { 
        text: '❌ حط رابط صحيح ويكون فيه http أو https.' 
      }, { quoted: message });
    }

    try {
      await sock.sendMessage(chatId, { 
        text: ' جاري جلب سورس الموقع...🌐' 
      });

      const res = await axios.get(url);
      const html = res.data;
      const buffer = Buffer.from(html, 'utf-8');

      await sock.sendMessage(chatId, { 
        document: buffer, 
        mimetype: 'text/html', 
        fileName: 'source.html',
        caption: `*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪\n${url}`
      }, { quoted: message });

    } catch (err) {
      await sock.sendMessage(chatId, { 
        text: '❌ مقدرتش أجيب سورس الموقع. ممكن يكون الموقع محمي.' 
      }, { quoted: message });
    }
  }
};