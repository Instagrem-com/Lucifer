const axios = require('axios');

module.exports = {
  command: 'تويتر',
  aliases: ['twitter', 'xtweet', 'tweetdl', 'twitterdl'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'تحميل فيديو أو صورة من منشور X / تويتر',
  usage: '.تويتر <رابط التغريدة>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const url = args?.[0];

    if (!url) {
      return await sock.sendMessage(chatId, { 
        text: '❌ من فضلك أرسل رابط تغريدة من تويتر / X.\n\nمثال:\n.تويتر https://x.com/i/status/2002054360428167305' 
      }, { quoted: message });
    }

    try {
      const apiUrl = `https://discardapi.dpdns.org/api/dl/twitter?apikey=guru&url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl, { timeout: 10000 });

      if (!data?.status || !data.result?.media?.length) {
        return await sock.sendMessage(chatId, { 
          text: '❌ لم يتم العثور على وسائط في هذه التغريدة.' 
        }, { quoted: message });
      }

      const tweet = data.result;

      const caption = `
📝 الحساب: @${tweet.authorUsername} (${tweet.authorName})
📅 التاريخ: ${tweet.date}

❤️ الإعجابات: ${tweet.likes}
🔁 إعادة النشر: ${tweet.retweets}
💬 الردود: ${tweet.replies}

📢 نص التغريدة:
${tweet.text}
      `.trim();

      for (let mediaItem of tweet.media) {

        if (mediaItem.type === 'video') {
          await sock.sendMessage(
            chatId,
            { video: { url: mediaItem.url }, caption: caption },
            { quoted: message }
          );

        } else if (mediaItem.type === 'image') {
          await sock.sendMessage(
            chatId,
            { image: { url: mediaItem.url }, caption: caption },
            { quoted: message }
          );
        }

      }

    } catch (error) {
      console.error('Twitter plugin error:', error);

      if (error.code === 'ECONNABORTED') {
        await sock.sendMessage(chatId, { 
          text: '❌ انتهت مهلة الاتصال. قد يكون الـ API بطيئًا أو غير متاح حاليًا.' 
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { 
          text: '❌ فشل تحميل الوسائط من تويتر / X.' 
        }, { quoted: message });
      }
    }
  }
};