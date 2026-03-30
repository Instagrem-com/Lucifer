const axios = require('axios');

module.exports = {
  command: 'تيكتوك',
  aliases: ['tt', 'ttdl', 'tiktokdl'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'تحميل فيديو من تيك توك بدون علامة مائية',
  usage: '.tiktok <رابط تيك توك>',

  async handler(sock, message, args, context) {
    const { chatId, channelInfo, rawText } = context;
    
    const prefix = rawText.match(/^[.!#]/)?.[0] || '.';
    const commandPart = rawText.slice(prefix.length).trim();
    const parts = commandPart.split(/\s+/);
    const url = parts.slice(1).join(' ').trim();

    if (!url) {
      return await sock.sendMessage(chatId, { 
        text: '🎵 *محمل فيديوهات تيك توك* 🎵\n\nابعت رابط تيك توك.\nمثال 📝 :\n.تيكتوك https://vm.tiktok.com/XXXX'
      }, { quoted: message });
    }

    try {
      await sock.sendMessage(chatId, { 
        text: ' جاري تحميل فيديو تيك توك...⏳'
      }, { quoted: message });

      const apiUrl = `https://discardapi.onrender.com/api/dl/tiktok?apikey=guru&url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl, { 
        timeout: 45000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!data?.status || !data?.result) {
        throw new Error('استجابة غير صالحة من الـ API');
      }

      const res = data.result;
      const hd = res.data.find(v => v.type === 'nowatermark_hd');
      const noWm = res.data.find(v => v.type === 'nowatermark');
      const videoUrl = hd?.url || noWm?.url;

      if (!videoUrl) {
        throw new Error('لم يتم العثور على فيديو قابل للتحميل');
      }

      const caption =
`🎵 *محمل تيك توك*
━━━━━━━━━━━━━━━━━━━
👤 *المستخدم:* ${res.author.nickname}
🆔 *اسم الحساب:* ${res.author.fullname}
🌍 *المنطقة:* ${res.region}
⏱️ *المدة:* ${res.duration}

❤️ *الإعجابات:* ${res.stats.likes}
💬 *التعليقات:* ${res.stats.comment}
🔁 *المشاركات:* ${res.stats.share}
👀 *المشاهدات:* ${res.stats.views}

🎧 *الصوت:* ${res.music_info.title}
📅 *تاريخ النشر:* ${res.taken_at}

📝 *الوصف:*
${res.title || 'لا يوجد وصف'}

✨ *الجودة:* ${hd ? 'HD بدون علامة مائية' : 'بدون علامة مائية'}

*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪
━━━━━━━━━━━━━━━━━━━`;

      await sock.sendMessage(chatId, { 
        video: { url: videoUrl }, 
        mimetype: 'video/mp4', 
        caption 
      }, { quoted: message });

    } catch (error) {
      console.error('TikTok plugin error:', error);

      if (error.code === 'ECONNABORTED') {
        await sock.sendMessage(chatId, { 
          text: 'ف مشكله ياحب 😄❤️.' 
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { 
          text: `ف مشكله ياحب 😄❤️ ${error.message}` 
        }, { quoted: message });
      }
    }
  }
};