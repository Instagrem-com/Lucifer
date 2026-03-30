const axios = require('axios');

const processedMessages = new Set();

module.exports = {
  command: 'انستجرام_3',
  aliases: ['ig', 'igdl', 'انستا_3'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'تحميل فيديو من انستجرام',
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
          { text: '🎬 ابعت لينك انستا عشان احملهولك' },
          { quoted: message }
        );
      }

      await sock.sendMessage(chatId, {
        react: { text: '🔄', key: message.key }
      });

      const apiUrl = `https://api.qasimdev.dpdns.org/api/instagram/download?url=${encodeURIComponent(text)}&apikey=qasim-dev`;

      const { data } = await axios.get(apiUrl);

      if (!data || !data.data || !data.data.length) {
        return sock.sendMessage(chatId, {
          text: '> *~اللينك مش شغال او برايفت جرب غيرو~* 👀❤️'
        }, { quoted: message });
      }

      // ✅ نجيب الفيديو بس
      const videoItem = data.data.find(item =>
        item.title.toLowerCase().includes('video')
      );

      if (!videoItem) {
        return sock.sendMessage(chatId, {
          text: '> *~مفيش فيديو في البوست ده يحب~* 👀❤️'
        }, { quoted: message });
      }

      const videoUrl = videoItem.url;

      // 🔥 نبعت كـ document عشان يشتغل 100%
      await sock.sendMessage(
        chatId,
        {
          document: { url: videoUrl },
          mimetype: 'video/mp4',
          fileName: 'Lucifer.mp4',
          caption: '> BY ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪'
        },
        { quoted: message }
      );

    } catch (err) {
      console.error(err);

      await sock.sendMessage(
        chatId,
        { text: 'حصل مشكلة 😢 جرب تاني' },
        { quoted: message }
      );
    }
  }
};