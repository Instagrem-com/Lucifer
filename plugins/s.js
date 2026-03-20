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
        text: '🌐 اكتب رابط الموقع.\nمثال:\n.تصوير_موقع github.com' 
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
      const screenshotUrl = `https://image.thum.io/get/fullpage/${encodeURIComponent(url)}`;
      const caption = `*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪\n${url}`;

      await sock.sendMessage(chatId, { 
        image: { url: screenshotUrl }, 
        caption 
      }, { quoted: message });

    } catch (error) {
      console.error('خطأ في أمر screenshot:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ حصلت مشكلة أثناء التقاط الصورة، حاول مرة تانية.' 
      }, { quoted: message });
    }
  }
};