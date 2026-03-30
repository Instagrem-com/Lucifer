const axios = require('axios');

module.exports = {
  command: 'فيسبوك',
  aliases: ['fb','fbdl'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'تحميل فيديوهات فيسبوك',
  usage: '.فيسبوك <رابط فيديو فيسبوك>',

  async handler(sock, message, args) {
    const chatId = message.key.remoteJid;
    const url = args.join(" ");

    try {
      // ❌ مفيش رابط
      if (!url) {
        return await sock.sendMessage(chatId, {
          text: '💻 *تحميل فيديو من فيسبوك* 💻\n\nالاستخدام:\n.فيسبوك <رابط>'
        }, { quoted: message });
      }

      // ❌ رابط غلط
      if (!/facebook\.com|fb\.watch/i.test(url)) {
        return await sock.sendMessage(chatId, {
          text: '❌ الرابط غير صالح'
        }, { quoted: message });
      }

      // 🔄 رياكشن تحميل
      await sock.sendMessage(chatId, {
        react: { text: '🔄', key: message.key }
      });

      // 🌐 طلب API
      const api = `https://api.qasimdev.dpdns.org/api/facebook/download?url=${encodeURIComponent(url)}&apikey=qasim-dev`;
      const res = await axios.get(api);

      const data = res?.data?.data;
      const results = data?.results;

      if (!results || !results.length) {
        throw new Error("مفيش نتائج");
      }

      // 🎯 نختار أعلى جودة
      let selected = results.find(v => v.type === 'HD') || results[0];

      const videoUrl = selected.url;
      const quality = selected.quality
        .replace(/\s+Download/g, '')
        .trim();

      if (!videoUrl) {
        throw new Error("مفيش لينك فيديو");
      }

      // ⬇️ تحميل الفيديو كـ Buffer
      const videoBuffer = await axios.get(videoUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      // 📩 إرسال الفيديو
      await sock.sendMessage(chatId, {
        video: videoBuffer.data,
        mimetype: 'video/mp4',
        caption:
`🥂 *الفيديو وصل يا معلم* 🥂

🎥 الجودة: *${quality}*

> BY ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`
      }, { quoted: message });

      // ✅ رياكشن نجاح
      await sock.sendMessage(chatId, {
        react: { text: '✅', key: message.key }
      });

    } catch (err) {
      console.log(err);

      await sock.sendMessage(chatId, {
        text: '❌ فشل تحميل الفيديو. جرب رابط تاني 😄'
      }, { quoted: message });

      await sock.sendMessage(chatId, {
        react: { text: '❌', key: message.key }
      });
    }
  }
};