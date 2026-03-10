const axios = require('axios');

module.exports = {
  command: 'سناب_شات',
  aliases: ['scspot', 'snapdl', 'سناب'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'تحميل فيديو أو صورة من رابط Snapchat Spotlight',
  usage: '.سناب_شات <رابط سناب>',

  async handler(sock, message, args, context) {
    const { chatId, channelInfo, rawText } = context;
    
    const prefix = context.rawText.match(/^[.!#]/)?.[0] || '.';
    const commandPart = rawText.slice(prefix.length).trim();
    const parts = commandPart.split(/\s+/);
    const url = parts.slice(1).join(' ').trim();

    if (!url) {
      return await sock.sendMessage(chatId, { 
        text: '❌ رجاءً ضع رابط Snapchat Spotlight.\nمثال: .snapchat https://www.snapchat.com/spotlight/...',
        ...channelInfo
      }, { quoted: message });
    }

    try {
      await sock.sendMessage(chatId, { 
        text: '⏳ جاري جلب الميديا من Snapchat...',
        ...channelInfo
      }, { quoted: message });

      const apiUrl = `https://discardapi.dpdns.org/api/dl/snapchat?apikey=guru&url=${encodeURIComponent(url)}`;
      
      console.log('طلب API للرابط:', apiUrl);
      console.log('الرابط الأصلي:', url);
      
      const { data } = await axios.get(apiUrl, { 
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      console.log('استجابة API السناب:', JSON.stringify(data, null, 2));

      if (!data || data.status !== true || !data.result || !Array.isArray(data.result) || data.result.length === 0) {
        return await sock.sendMessage(chatId, { 
          text: '❌ لم يتم العثور على أي ميديا لهذا الرابط.',
          ...channelInfo
        }, { quoted: message });
      }

      for (let mediaItem of data.result) {
        if (mediaItem.video) {
          await sock.sendMessage(chatId, { 
            video: { url: mediaItem.video }, 
            caption: '📹 فيديو Snapchat Spotlight',
            ...channelInfo
          }, { quoted: message });
        }
        if (mediaItem.image) {
          await sock.sendMessage(chatId, { 
            image: { url: mediaItem.image }, 
            caption: '🖼 صورة من Snapchat Spotlight',
            ...channelInfo
          }, { quoted: message });
        }
      }

    } catch (error) {
      console.error('خطأ في أمر Snapchat:', error.message);
      
      await sock.sendMessage(chatId, { 
        text: `❌ فشل تحميل الميديا من Snapchat.\nالخطأ: ${error.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};