const axios = require('axios');

const processedMessages = new Set();

module.exports = {
  command: 'انستجرام_2',
  aliases: ['ig', 'igdl', 'insta'],
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

      if (!data || !data.data || !data.data.length) {
        return await sock.sendMessage(
          chatId,
          { text: 'اللينك مش مدعوم او البوست برايفت 👀❤️' },
          { quoted: message }
        );
      }

      const mediaList = data.data;

      for (let i = 0; i < mediaList.length; i++) {
        const media = mediaList[i];
        const url = media.url;

        const isVideo =
          media.type === 'video' ||
          /\.(mp4|mov|webm|mkv)$/i.test(url);

        if (isVideo) {
          await sock.sendMessage(
            chatId,
            {
              video: { url },
              mimetype: 'video/mp4',
              caption: '> *_BY_   ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪*'
            },
            { quoted: message }
          );
        } else {
          await sock.sendMessage(
            chatId,
            {
              image: { url },
              caption: '> *_BY_   ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪*'
            },
            { quoted: message }
          );
        }

        if (i < mediaList.length - 1) {
          await new Promise(r => setTimeout(r, 1000));
        }
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