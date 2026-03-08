const fetch = require('node-fetch');

module.exports = {
  command: 'معلومات_عن_اغنيه',
  aliases: ['معلومات_اغنيه'],
  category: 'اوامـࢪ الاداوات',
  description: 'هات معلومات تفصيلية عن أي أغنية من iTunes 🎶',
  usage: '.معلومات_عن_اغنيه <اسم الأغنية>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = args.join(' ').trim();

    if (!text) {
      await sock.sendMessage(chatId, {
        text: 'اكتب اسم الأغنية عشان أجيبلك تفاصيلها من موقع iTunes 👀❤️\n\nمثال 📝 : `.معلومات_عن_اغنيه me and davil`',
        quoted: message
      });
      return;
    }

    try {
      const url = `https://api.popcat.xyz/itunes?q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (!res.ok) throw `في مشكلة في السيرفر، الحالة: ${res.status} 🙂`;
      const json = await res.json();

      const songInfo = `
🎵 *${json.name || 'مش متوفر'}*
👤 *المغني:* ${json.artist || 'مش متوفر'}
💿 *الألبوم:* ${json.album || 'مش متوفر'}
📅 *تاريخ الإصدار:* ${json.release_date || 'مش متوفر'}
💰 *السعر:* ${json.price || 'مش متوفر'}
⏱️ *مدة الأغنية:* ${json.length || 'مش متوفر'}
🎼 *النوع:* ${json.genre || 'مش متوفر'}
🔗 *رابط الأغنية:* ${json.url || 'مش متوفر'}

*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪
      `.trim();

      if (json.thumbnail) {
        await sock.sendMessage(chatId, {
          image: { url: json.thumbnail },
          caption: songInfo,
          quoted: message
        });
      } else {
        await sock.sendMessage(chatId, { text: songInfo, quoted: message });
      }

    } catch (error) {
      console.error('iTunes Command Error:', error);
      await sock.sendMessage(chatId, {
        text: 'حصلت مشكلة وأنا بجيبلك بيانات الأغنية حاول تاني بعد شوي 😊❤️ة',
        quoted: message
      });
    }
  }
};