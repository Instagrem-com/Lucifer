const axios = require('axios');

module.exports = {
  command: 'تصوير_موقع',
  aliases: ['ss', 'ssweb', 'تصوير_موقع'],
  category: 'اوامـࢪ الاداوات',
  description: 'التقاط صورة (سكرين شوت) لموقع',
  usage: '.screenshot <الرابط>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    let url = args?.[0]?.trim();

    if (!url) {
      return await sock.sendMessage(chatId, { 
        text: '🌐 اكتب رابط الموقع.\nمثال:\n.screenshot https://github.com' 
      }, { quoted: message });
    }

    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    try {
      new URL(url);
    } catch {
      return await sock.sendMessage(chatId, { 
        text: '❌ الرابط غير صالح.' 
      }, { quoted: message });
    }

    try {
      const apiUrl = `https://discardapi.dpdns.org/api/tools/ssweb?apikey=guru&url=${encodeURIComponent(url)}`;

      const { data } = await axios.get(apiUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
      });

      const caption = `📸 لقطة شاشة للموقع:\n${url}`;

      await sock.sendMessage(chatId, { 
        image: { buffer: data }, 
        caption 
      }, { quoted: message });

    } catch (error) {
      console.error('خطأ في أمر screenshot:', error);

      if (error.code === 'ECONNABORTED') {
        await sock.sendMessage(chatId, { 
          text: '❌ انتهى وقت الطلب. ممكن الموقع بطيء أو غير متاح.' 
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { 
          text: '❌ فشل في أخذ لقطة للموقع. اتأكد إن الرابط صحيح.' 
        }, { quoted: message });
      }
    }
  }
};