const axios = require('axios');

module.exports = {
  command: 'تصوير_موقع',
  aliases: ['ss', 'ssweb', 'تصوير_موقع'],
  category: 'اوامـࢪ الاداوات',
  description: 'التقاط صورة (سكرين شوت) لموقع',
  usage: '.تصوير_موقع <الرابط>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    let url = args?.[0]?.trim();

    if (!url) {
      return await sock.sendMessage(chatId, { 
        text: '🌐 اكتب رابط الموقع.\nمثال:\n.تصوير_موقع https://github.com' 
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
      // رسالة الانتظار
      await sock.sendMessage(chatId, { text: '🌐 جاري التقاط صورة الموقع… انتظر شوية' }, { quoted: message });

      // طلب الـ API
      const apiUrl = `https://api.qasimdev.dpdns.org/api/screenshot/take?url=${encodeURIComponent(url)}&apikey=qasim-dev`;
      const { data } = await axios.get(apiUrl);

      if (!data?.success || !data?.data?.screenshotUrl) {
        return await sock.sendMessage(chatId, { text: '❌ حصلت مشكلة، مش قادر أجيب صورة الموقع' }, { quoted: message });
      }

      const imageUrl = data.data.screenshotUrl;

      // نبعت الصورة على الشات
      await sock.sendMessage(chatId, { 
        image: { url: imageUrl }, 
        caption: `*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪\n${url}`
      }, { quoted: message });

    } catch (error) {
      console.error('خطأ في أمر screenshot:', error);
      await sock.sendMessage(chatId, { text: '❌ حصلت مشكلة أثناء محاولة التقاط الصورة' }, { quoted: message });
    }
  }
};