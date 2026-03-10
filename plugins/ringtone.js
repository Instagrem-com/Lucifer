const axios = require('axios');

module.exports = {
  command: 'رنه', // بدل ringtone
  aliases: ['رن', 'نغمة'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'ابحث وحمّل نغمات رنين',
  usage: '.رنات <اسم النغمة>',
  
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const searchQuery = args.join(' ').trim();

    try {
      if (!searchQuery) {
        return await sock.sendMessage(chatId, {
          text: " قولّي تحب تدور على انهي رنه 👀❤️\nمثال 📝: .رنه نوكيا"
        }, { quoted: message });
      }

      await sock.sendMessage(chatId, {
        text: " بدوّرلك على النغمات...🔍"
      }, { quoted: message });

      // انتظار وهمي للتجربة
      await new Promise(resolve => setTimeout(resolve, 5000));

      const searchUrl = `https://discardapi.dpdns.org/api/dl/ringtone?apikey=guru&title=${encodeURIComponent(searchQuery)}`;
      const response = await axios.get(searchUrl, { timeout: 30000 });
      
      if (!response.data?.result || response.data.result.length === 0) {
        return await sock.sendMessage(chatId, {
          text: "❌ مافيش نغمات متاحة! جرب اسم تاني."
        }, { quoted: message });
      }

      const ringtones = response.data.result;
      const totalFound = ringtones.length;
      const limit = Math.min(2, totalFound); // يبعت أول 2 بس

      for (let i = 0; i < limit; i++) {
        const audioUrl = ringtones[i].audio;
        
        try {
          await sock.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${searchQuery}_${i + 1}.mp3`,
            contextInfo: {
              externalAdReply: {
                title: `${searchQuery} - نغمة ${i + 1}`,
                body: `نغمة ${i + 1} من ${limit}`,
                mediaType: 2,
                thumbnail: null
              }
            }
          }, { quoted: message });

          if (i < limit - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (sendError) {
          console.error(`فشل إرسال النغمة ${i + 1}:`, sendError.message);
          continue;
        }
      }

      await sock.sendMessage(chatId, {
        text: `✅ بعتلك ${limit} الرنه ✅\n\n${totalFound > limit ? `📊 فيه ${totalFound - limit} رنه تانية ممكن تجيبها\nكرر الأمر تاني علشان تشوفهم 👀❤️` : ''}`
      }, { quoted: message });

    } catch (error) {
      console.error('خطأ في أمر النغمات:', error);
      
      let errorMsg = "❌ فشل البحث!\n\n";
      
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        errorMsg += "الوقت خلص ياحب 👀❤️\nطولت ف الاختيار 😄";
      } else if (error.response) {
        errorMsg += `📌 حالة: ${error.response.status}\nخطأ: ${error.response.statusText}`;
      } else {
        errorMsg += `📌 خطأ: ${error.message}`;
      }
      
      errorMsg += "\n\nجرب تاني بعد شوية.";

      await sock.sendMessage(chatId, { text: errorMsg }, { quoted: message });
    }
  }
};