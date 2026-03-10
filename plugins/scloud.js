const axios = require('axios');

module.exports = {
  command: 'ساوند_كلاود', // بدل scloud
  aliases: ['sc', 'بحث_ساوند'],
  category: 'اوامـࢪ الاداوات',
  description: 'دور على أي أغنية على SoundCloud',
  usage: '.ساوندكلاود <اسم الأغنية>',
  
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const searchQuery = args.join(' ').trim();

    try {
      if (!searchQuery) {
        return await sock.sendMessage(chatId, {
          text: " تحب تدور على أي أغنية على ساوندكلاود 👀❤️\nمثال 📝: .ساوند_كلاود me and davil"
        }, { quoted: message });
      }

      await sock.sendMessage(chatId, { text: " بدوّرلك على الأغاني...🔍" }, { quoted: message });

      await new Promise(resolve => setTimeout(resolve, 5000)); // انتظار وهمي

      const searchUrl = `https://discardapi.dpdns.org/api/search/soundcloud?apikey=guru&query=${encodeURIComponent(searchQuery)}`;
      const response = await axios.get(searchUrl, { timeout: 30000 });
      
      if (!response.data?.result?.result || response.data.result.result.length === 0) {
        return await sock.sendMessage(chatId, { text: "❌ مافيش نتائج! جرب اسم تاني ❌" }, { quoted: message });
      }

      const results = response.data.result.result;
      const tracks = results.filter(item => item.kind === 'track');

      if (tracks.length === 0) {
        return await sock.sendMessage(chatId, { text: "مفيش اغنيه ياحب ب الاسم دا جرب غيرها 👀❤️" }, { quoted: message });
      }

      const limit = Math.min(5, tracks.length);
      let resultText = `🎵 *نتائج ساوند كلاود* 🎵\n`;
      resultText += `لقيت ${tracks.length} أغاني 👀❤️\n\n`;

      for (let i = 0; i < limit; i++) {
        const track = tracks[i];
        const duration = Math.floor(track.duration / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;

        resultText += `*${i + 1}. ${track.title}*\n`;
        resultText += ` الفنان 👤 : ${track.user_id ? 'موجود' : 'غير معروف'}\n`;
        resultText += `⏱️ المدة: ${minutes}:${seconds.toString().padStart(2,'0')}\n`;
        resultText += ` عدد مرات التشغيل 👂 : ${track.playback_count?.toLocaleString() || 'N/A'}\n`;
        resultText += ` الإعجابات ❤️ : ${track.likes_count?.toLocaleString() || 'N/A'}\n`;
        resultText += ` التعليقات 💬 : ${track.comment_count?.toLocaleString() || 'N/A'}\n`;
        resultText += ` النوع 🎼 : ${track.genre || 'غير معروف'}\n`;
        resultText += ` الرابط 🔗 : ${track.permalink_url}\n\n`;
      }

      if (tracks.length > limit) {
        resultText += `_+${tracks.length - limit} أغاني تانية موجودة_ 👀❤️`;
      }

      const firstTrack = tracks[0];
      if (firstTrack.artwork_url) {
        try {
          const imageBuffer = await axios.get(firstTrack.artwork_url, { responseType: 'arraybuffer', timeout: 15000 })
                                        .then(res => Buffer.from(res.data));
          await sock.sendMessage(chatId, { image: imageBuffer, caption: resultText }, { quoted: message });
        } catch (imgError) {
          await sock.sendMessage(chatId, { text: resultText }, { quoted: message });
        }
      } else {
        await sock.sendMessage(chatId, { text: resultText }, { quoted: message });
      }

    } catch (error) {
      console.error('خطأ في بحث ساوندكلاود:', error);
      
      let errorMsg = "❌ فشل البحث!\n\n";

      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        errorMsg += "الوقت خلص ياحب 👀❤️\nعشان خدت فطره طويله ف الرد 😄";
      } else if (error.response) {
        errorMsg += `📌 الحالة: ${error.response.status}\nخطأ: ${error.response.statusText}`;
      } else {
        errorMsg += `📌 خطأ: ${error.message}`;
      }

      errorMsg += "\n\nجرب تاني بعد شوية.";

      await sock.sendMessage(chatId, { text: errorMsg }, { quoted: message });
    }
  }
};