const axios = require('axios');

module.exports = {
  command: 'تيرا',
  aliases: ['terabox', 'tb'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'تحميل فيديو من تيرا بوكس',
  usage: '.تيرا <لينك>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = args.join(' ');

    try {
      if (!text) {
        return sock.sendMessage(chatId, {
          text: '📥 ابعت لينك تيرا بوكس'
        }, { quoted: message });
      }

      await sock.sendMessage(chatId, {
        react: { text: '⏳', key: message.key }
      });

      // 🔥 API
      const apiUrl = `https://api.qasimdev.dpdns.org/api/terabox/download?url=${encodeURIComponent(text)}&apikey=qasim-dev`;

      const { data } = await axios.get(apiUrl);

      if (!data || !data.data || !data.data.files.length) {
        return sock.sendMessage(chatId, {
          text: '❌ اللينك مش شغال'
        }, { quoted: message });
      }

      // ✅ نجيب أول فيديو
      const file = data.data.files.find(f =>
        f.title.toLowerCase().endsWith('.mp4')
      );

      if (!file) {
        return sock.sendMessage(chatId, {
          text: '❌ مفيش فيديو'
        }, { quoted: message });
      }

      const videoUrl = file.downloadUrl;

      // 🔥 نجيب الهيدر بس
      const head = await axios.head(videoUrl).catch(() => null);

      const sizeMB = head?.headers['content-length']
        ? (parseInt(head.headers['content-length']) / (1024 * 1024)).toFixed(2)
        : null;

      console.log('SIZE:', sizeMB, 'MB');

      // ✅ لو الفيديو صغير (< 50MB) نبعته فيديو
      if (sizeMB && sizeMB < 300) {

        const res = await axios.get(videoUrl, {
          responseType: 'arraybuffer'
        });

        await sock.sendMessage(
          chatId,
          {
            video: Buffer.from(res.data),
            mimetype: 'video/mp4',
            caption: `🎬 ${file.title}`
          },
          { quoted: message }
        );

      } else {
        // ❌ كبير → document
        await sock.sendMessage(
          chatId,
          {
            document: { url: videoUrl },
            mimetype: 'video/mp4',
            fileName: file.title,
            caption: '📁 الفيديو كبير، اتبعت ملف'
          },
          { quoted: message }
        );
      }

    } catch (err) {
      console.error(err);

      await sock.sendMessage(chatId, {
        text: '❌ حصل خطأ'
      }, { quoted: message });
    }
  }
};