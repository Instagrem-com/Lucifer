const axios = require('axios');

module.exports = {
  command: 'صوره',
  aliases: ['صور','img'],
  category: 'اوامـࢪ الاداوات',
  description: 'البحث عن صور',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args.join(' ').trim();

    if (!query) {
      return sock.sendMessage(chatId, {
        text: "📸 اكتب اسم الصورة\nمثال: .صوره قطة"
      }, { quoted: message });
    }

    try {
      await sock.sendMessage(chatId, {
        text: `🔎 بدور على صور "${query}" ...`
      }, { quoted: message });

      const images = [];

      for (let i = 0; i < 5; i++) {
        // نسمح للaxios يتبع redirect
        const url = `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}&sig=${Math.random()}`;
        images.push(url);
      }

      for (let i = 0; i < images.length; i++) {
        await sock.sendMessage(chatId, {
          image: { url: images[i] },
          caption: `🖼️ صورة ${i + 1} لـ "${query}"\n\n*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`
        }, { quoted: message });

        await new Promise(r => setTimeout(r, 700));
      }

    } catch (e) {
      console.log(e);
      await sock.sendMessage(chatId, {
        text: "❌ حصلت مشكلة في جلب الصور"
      }, { quoted: message });
    }
  }
        }
