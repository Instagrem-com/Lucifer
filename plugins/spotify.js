const axios = require('axios');

module.exports = {
  command: 'سبوتيفاي',
  aliases: ['sp', 'spotifydl', 'سبوتيفاي'],
  category: 'اوامـࢪ الاداوات',
  description: 'تحميل أغنية من سبوتيفاي',
  usage: '.spotify <اسم الأغنية أو الفنان>',
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    try {
      const query = args.join(' ');

      if (!query) {
        await sock.sendMessage(chatId, { 
          text: '🎵 الاستخدام:\n.spotify <اسم الأغنية أو الفنان>\n\nمثال:\n.spotify con calma',
          ...channelInfo
        }, { quoted: message });
        return;
      }

      const apiUrl = `https://okatsu-rolezapiiz.vercel.app/search/spotify?q=${encodeURIComponent(query)}`;
      const { data } = await axios.get(apiUrl, { 
        timeout: 20000, 
        headers: { 'user-agent': 'Mozilla/5.0' } 
      });

      if (!data?.status || !data?.result) {
        throw new Error('مفيش نتيجة من API');
      }

      const r = data.result;
      const audioUrl = r.audio;
      
      if (!audioUrl) {
        await sock.sendMessage(chatId, { 
          text: '❌ مفيش صوت قابل للتحميل للأغنية دي.',
          ...channelInfo
        }, { quoted: message });
        return;
      }

      const caption = `🎵 ${r.title || r.name || 'عنوان غير معروف'}
👤 ${r.artist || 'غير معروف'}
⏱ ${r.duration || ''}
🔗 ${r.url || ''}`.trim();

      if (r.thumbnails) {
        await sock.sendMessage(chatId, { 
          image: { url: r.thumbnails }, 
          caption,
          ...channelInfo
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { 
          text: caption,
          ...channelInfo
        }, { quoted: message });
      }
      
      await sock.sendMessage(chatId, {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${(r.title || r.name || 'track').replace(/[\\/:*?"<>|]/g, '')}.mp3`,
        ...channelInfo
      }, { quoted: message });

    } catch (error) {
      console.error('[SPOTIFY] خطأ:', error?.message || error);
      await sock.sendMessage(chatId, { 
        text: '❌ حصل خطأ أثناء تحميل الأغنية من سبوتيفاي. جرب اسم تاني.',
        ...channelInfo
      }, { quoted: message });
    }
  }
};