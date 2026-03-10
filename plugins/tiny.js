const fetch = require('node-fetch');

module.exports = {
  command: 'تقصير_رابط',
  aliases: ['shorten', 'tiny'],
  category: 'اوامـࢪ الاداوات',
  description: 'اختصار الروابط باستخدام TinyURL',
  usage: '.tinyurl <الرابط>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args?.join(' ')?.trim();

    if (!query) {
      return await sock.sendMessage(chatId, { 
        text: '*من فضلك أرسل رابط ليتم اختصاره.*\nمثال:\n.tinyurl https://example.com' 
      }, { quoted: message });
    }

    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(query)}`);
      const shortUrl = await response.text();

      if (!shortUrl) {
        return await sock.sendMessage(chatId, { 
          text: '❌ خطأ: لم يتم إنشاء الرابط المختصر.' 
        }, { quoted: message });
      }

      const output = 
        `✨ *الرابط المختصر*\n\n` +
        `🔗 *الرابط الأصلي:*\n${query}\n\n` +
        `✂️ *الرابط بعد الاختصار:*\n${shortUrl}`;

      await sock.sendMessage(chatId, { text: output }, { quoted: message });

    } catch (err) {
      console.error('TinyURL plugin error:', err);
      await sock.sendMessage(chatId, { 
        text: '❌ فشل اختصار الرابط.' 
      }, { quoted: message });
    }
  }
};