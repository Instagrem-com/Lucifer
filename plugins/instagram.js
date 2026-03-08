const { igdl } = require('ruhend-scraper');

const processedMessages = new Set();

function extractUniqueMedia(mediaData = []) {
  const seen = new Set();
  return mediaData.filter(m => {
    if (!m?.url || seen.has(m.url)) return false;
    seen.add(m.url);
    return true;
  });
}

module.exports = {
  command: 'انستا',
  aliases: ['ig', 'igdl', 'insta'],
  category: 'download',
  description: 'حمّل بوستات ورييلز وفيديوهات إنستجرام بسهولة 🔥',
  usage: '.ig <لينك الانستجرام>',

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
          { text: 'حمّل من إنستجرام بسهولة 📸\n\nطريقة الاستخدام:\n.ig <لينك بوست أو ريل>' },
          { quoted: message }
        );
      }

      const igRegex =
        /https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(p|reel|tv)\//i;

      if (!igRegex.test(text)) {
        return await sock.sendMessage(
          chatId,
          { text: 'اللينك ده مش صحيح 😅 ابعت لينك بوست أو ريل من إنستجرام' },
          { quoted: message }
        );
      }

      await sock.sendMessage(chatId, {
        react: { text: '🔄', key: message.key }
      });

      const res = await igdl(text);

      if (!res?.data?.length) {
        return await sock.sendMessage(
          chatId,
          { text: 'ملقتش ميديا في اللينك ده 😓 ممكن يكون البوست برايفت أو اتمسح' },
          { quoted: message }
        );
      }

      const mediaList = extractUniqueMedia(res.data).slice(0, 20);

      if (!mediaList.length) {
        return await sock.sendMessage(
          chatId,
          { text: 'ملقتش ميديا قابلة للتحميل من اللينك ده 😢' },
          { quoted: message }
        );
      }

      for (let i = 0; i < mediaList.length; i++) {
        const media = mediaList[i];
        const url = media.url;

        const isVideo =
          media.type === 'video' ||
          /\.(mp4|mov|webm|mkv)$/i.test(url) ||
          text.includes('/reel/') ||
          text.includes('/tv/');

        if (isVideo) {
          await sock.sendMessage(
            chatId,
            {
              video: { url },
              mimetype: 'video/mp4',
              caption: 'اتحمل من البوت لوسيفر بنجاح 🔥'
            },
            { quoted: message }
          );
        } else {
          await sock.sendMessage(
            chatId,
            {
              image: { url },
              caption: 'اتحملت من البوت لوسيفر بنجاح 🔥'
            },
            { quoted: message }
          );
        }

        if (i < mediaList.length - 1) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }

    } catch (err) {
      console.error('Instagram plugin error:', err);
      await sock.sendMessage(
        chatId,
        { text: 'معرفتش أحمل الميديا من إنستجرام دلوقتي 😓 جرب تاني بعد شوية' },
        { quoted: message }
      );
    }
  }
};