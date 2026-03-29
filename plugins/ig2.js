const axios = require('axios');

const processedMessages = new Set();

module.exports = {
  command: 'انستجرام_3',
  aliases: ['ig', 'igdl', 'انستا_3'],

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = args.join(' ');

    try {
      if (!text) {
        return sock.sendMessage(chatId, {
          text: '🎬 ابعت لينك انستا'
        }, { quoted: message });
      }

      await sock.sendMessage(chatId, {
        react: { text: '🔄', key: message.key }
      });

      const { data } = await axios.get(
        `https://api.qasimdev.dpdns.org/api/instagram/download?url=${encodeURIComponent(text)}&apikey=qasim-dev`
      );

      const videoItem = data.data.find(x =>
        x.title.toLowerCase().includes('video')
      );

      if (!videoItem) {
        return sock.sendMessage(chatId, {
          text: '❌ مفيش فيديو'
        }, { quoted: message });
      }

      // 🔥 نجيب الفيديو
      const res = await axios.get(videoItem.url, {
        responseType: 'arraybuffer',
        maxRedirects: 5, // مهم
        validateStatus: () => true
      });

      const contentType = res.headers['content-type'];

      console.log('TYPE:', contentType);

      // ✅ لو فعلاً فيديو
      if (contentType && contentType.includes('video')) {
        await sock.sendMessage(chatId, {
          video: Buffer.from(res.data),
          mimetype: 'video/mp4',
          caption: '🎬 تم التحميل'
        }, { quoted: message });

      } else {
        // ❌ لو رجع صورة أو حاجة تانية
        await sock.sendMessage(chatId, {
          text: '❌ السيرفر رجع صورة مش فيديو\nهبعت كملف بدلها'
        }, { quoted: message });

        await sock.sendMessage(chatId, {
          document: { url: videoItem.url },
          mimetype: 'video/mp4',
          fileName: 'instagram.mp4'
        }, { quoted: message });
      }

    } catch (err) {
      console.error(err);

      await sock.sendMessage(chatId, {
        text: '❌ حصل خطأ'
      }, { quoted: message });
    }
  }
};