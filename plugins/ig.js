const axios = require('axios');

const processedMessages = new Set();

module.exports = {
  command: 'انستجرام',
  aliases: ['ig', 'igdl', 'انستا'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'تحميل من انستجرام',
  usage: '.انستا <اللينك>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text =
      args.join(' ') ||
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text;

    try {
      if (processedMessages.has(message.key.id)) return;
      processedMessages.add(message.key.id);
      setTimeout(() => processedMessages.delete(message.key.id), 5 * 60 * 1000);

      if (!text) {
        return await sock.sendMessage(
          chatId,
          { text: '📸 *تنزيل انستا* 📸\n\nالاستخدام 👀 :\n.انستا <اللينك>' },
          { quoted: message }
        );
      }

      const igRegex =
        /https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(p|reel|tv)\//i;

      if (!igRegex.test(text)) {
        return await sock.sendMessage(
          chatId,
          { text: 'ابعتلي لينك فيديو انستا ياحب 👀❤️' },
          { quoted: message }
        );
      }

      await sock.sendMessage(chatId, {
        react: { text: '🔄', key: message.key }
      });

      // 🔥 API REQUEST
      const apiUrl = `https://api.qasimdev.dpdns.org/api/instagram/download?url=${encodeURIComponent(text)}&apikey=qasim-dev`;
      const { data } = await axios.get(apiUrl);

      // دعم اختلاف هيكل JSON
      const mediaList = data.data?.results || data.results;
      if (!mediaList || !mediaList.length) {
        return await sock.sendMessage(
          chatId,
          { text: 'اللينك مش مدعوم او البوست برايفت 👀❤️' },
          { quoted: message }
        );
      }

      for (let media of mediaList) {
        const url = media.url;
        const type = (media.type || '').toLowerCase();

        const isVideo = type.includes('video') || /\.(mp4|mov|webm|mkv)$/i.test(url);

        if (isVideo) {
          try {
            const videoBuffer = await axios.get(url, {
              responseType: 'arraybuffer',
              headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            // إرسال الفيديو كـ video
            await sock.sendMessage(chatId, {
              video: videoBuffer.data,
              mimetype: 'video/mp4',
              caption: '> *_BY_   ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪*'
            }, { quoted: message });

          } catch (err) {
            console.log('فشل إرسال الفيديو كـ video، نجرب document...');

            // إرسال الفيديو كـ document كحل احتياطي
            await sock.sendMessage(chatId, {
              document: videoBuffer.data,
              mimetype: 'video/mp4',
              fileName: 'instagram.mp4',
              caption: '> *_BY_   ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪*'
            }, { quoted: message });
          }

        } else {
          // إرسال الصور
          await sock.sendMessage(chatId, {
            image: { url },
            caption: '> *_BY_   ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪*'
          }, { quoted: message });
        }

        await new Promise(r => setTimeout(r, 1000));
      }

    } catch (err) {
      console.error('Instagram API error:', err);
      await sock.sendMessage(
        chatId,
        { text: 'حصل مشكلة في التحميل 😢 جرب تاني بعد شوية' },
        { quoted: message }
      );
    }
  }
};