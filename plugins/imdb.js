const fetch = require('node-fetch');

module.exports = {
  command: 'معلومات_عن_فيلم',
  aliases: ['movie', 'film'],
  category: 'info',
  description: 'جيبلك كل التفاصيل عن فيلم أو مسلسل من IMDB 🔥',
  usage: '.imdb <اسم الفيلم/المسلسل>',
  
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = args.join(' ').trim();

    if (!text) {
      await sock.sendMessage(chatId, { 
        text: 'ابعتلي اسم الفيلم أو المسلسل عشان أجيبلك التفاصيل 😎\nمثال: `.imdb Inception`', 
        quoted: message 
      });
      return;
    }

    try {
      const res = await fetch(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(text)}`);
      if (!res.ok) throw new Error(`API معملش رد صح وحالته ${res.status}`);
      const json = await res.json();

      const ratings = (json.ratings || [])
        .map(r => `⭐ ${r.source}: ${r.value}`)
        .join('\n') || 'مفيش تقييمات متاحة 😅';

      const movieInfo = `
${json.title || 'N/A'} 🎬 (${json.year || 'N/A'})
النوع 🎭: ${json.genres || 'N/A'}
النوعية 📺: ${json.type || 'N/A'}
القصة 📝: ${json.plot || 'N/A'}
تقييم IMDB ⭐: ${json.rating || 'N/A'} (${json.votes || 'N/A'} صوت)
الجوائز 🏆: ${json.awards || 'N/A'}
المخرج 🎬: ${json.director || 'N/A'}
الكاتب ✍️: ${json.writer || 'N/A'}
النجوم 👨‍👩‍👧‍👦: ${json.actors || 'N/A'}
مدة العرض ⏱️: ${json.runtime || 'N/A'}
تاريخ الإصدار 📅: ${json.released || 'N/A'}
الدولة 🌐: ${json.country || 'N/A'}
اللغات 🗣️: ${json.languages || 'N/A'}
إيرادات 💰: ${json.boxoffice || 'N/A'}
إصدار DVD 💽: ${json.dvd || 'N/A'}
الإنتاج 🏢: ${json.production || 'N/A'}
الموقع 🔗: ${json.website || 'N/A'}

التقييمات:
${ratings}
      `.trim();

      if (json.poster) {
        await sock.sendMessage(chatId, { 
          image: { url: json.poster }, 
          caption: movieInfo, 
          quoted: message 
        });
      } else {
        await sock.sendMessage(chatId, { text: movieInfo, quoted: message });
      }

    } catch (error) {
      console.error('IMDB Command Error:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ معملش تحميل معلومات الفيلم دلوقتي 😓 جرب تاني بعد شويه', 
        quoted: message 
      });
    }
  }
};