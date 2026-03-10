const fetch = require('node-fetch');

module.exports = {
  command: 'كلمات_اغنيه',
  aliases: ['كلمات', 'اغنية_كلمات'],
  category: 'اوامـࢪ الاداوات',
  description: 'جيبلك كلمات الأغنية مع اسم الفنان والصورة',
  usage: '.كلمات_اغنية <اسم الأغنية>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const songTitle = args.join(' ').trim();

    if (!songTitle) {
      await sock.sendMessage(chatId, {
        text: 'اكتب اسم الأغنية عشان أجيبلك كلماتها ياحب 👀❤️\n\nالاستخدام 📝: `.كلمات_اغنية <اسم الأغنية>`',
        quoted: message
      });
      return;
    }

    try {
      const apiUrl = `https://discardapi.dpdns.org/api/music/lyrics?apikey=qasim&song=${encodeURIComponent(songTitle)}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw `فشل الطلب برمز: ${res.status}`;
      const data = await res.json();
      const messageData = data?.result?.message;

      if (!messageData?.lyrics) {
        await sock.sendMessage(chatId, {
          text: `مش لاقي كلمات الأغنية ياحب  "${songTitle}" 🙃 `,
          quoted: message
        });
        return;
      }

      const { artist, lyrics, image, title, url } = messageData;
      const maxChars = 4096;
      const lyricsOutput = lyrics.length > maxChars ? lyrics.slice(0, maxChars - 3) + '...' : lyrics;

      const caption = `
🎵 *${title}*
👤 *الفنان:* ${artist}
🔗 *الرابط:* ${url}

📝 *كلمات الأغنية:*
${lyricsOutput}

*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪
      `.trim();

      if (image) {
        await sock.sendMessage(chatId, {
          image: { url: image },
          caption: caption,
          quoted: message
        });
      } else {
        await sock.sendMessage(chatId, {
          text: caption,
          quoted: message
        });
      }

    } catch (error) {
      console.error('Lyrics Command Error:', error);
      await sock.sendMessage(chatId, {
        text: `مش قادر أجيب كلمات الأغنية "${songTitle}". جرب تاني او شوف غيرها 🙃❤️`,
        quoted: message
      });
    }
  }
};