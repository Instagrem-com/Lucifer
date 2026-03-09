const axios = require('axios');

module.exports = {
  command: 'اقلب_النص', // بدل reverse
  aliases: ['قلب', 'اقلب_النص'],
  category: 'اوامـࢪ الاداوات',
  description: 'يقلب أي نص',
  usage: '.اقلب <النص>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const textToReverse = args?.join(' ')?.trim();

    if (!textToReverse) {
      return await sock.sendMessage(chatId, { 
        text: ' اكتب النص اللي تحب تقلبه 👀❤️\nمثال 📝: .اقلب_النص مرحبا بالعالم' 
      }, { quoted: message });
    }

    try {
      const apiUrl = `https://discardapi.dpdns.org/api/tools/reverse?apikey=guru&text=${encodeURIComponent(textToReverse)}`;
      const { data } = await axios.get(apiUrl, { timeout: 10000 });

      if (!data?.status || !data.result) {
        return await sock.sendMessage(chatId, { text: '❌ فشل في قلب النص، جرب تاني.' }, { quoted: message });
      }

      const reply = `🔄 *النص بعد قلبه* 🔄\n ${data.result}`;

      await sock.sendMessage(chatId, { text: reply }, { quoted: message });

    } catch (error) {
      console.error('خطأ في أمر قلب النص:', error);

      if (error.code === 'ECONNABORTED') {
        await sock.sendMessage(chatId, { text: '❌ انتهت المهلة، جرب تاني.' }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: '❌ فشل في قلب النص، جرب تاني.' }, { quoted: message });
      }
    }
  }
};