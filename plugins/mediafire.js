const axios = require('axios');
const cheerio = require('cheerio');

async function mediafireDl(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);
        const link = $('#downloadButton').attr('href');
        const name = $('div.dl-info > div.promo-text').text().trim() || $('.dl-btn-label').attr('title');
        
        const size = $('#downloadButton').text().replace(/Download|[\(\)]|\s/g, '').trim() || 'Unknown';
        const ext = name.split('.').pop();
        
        return { name, size, link, ext };
    } catch (e) {
        return null;
    }
}

module.exports = {
  command: 'ميديافاير',
  aliases: ['ميديا', 'فاير'],
  category: 'تحميل',
  description: 'يحمل أي ملف من ميديافاير',
  usage: '.ميديافاير <الرابط>',

  async handler(sock, message, args, context = {}) {
    const { chatId } = context;
    const text = args.join(' ');

    if (!text) return await sock.sendMessage(chatId, { 
      text: "ابعت رابط ميديافاير عشان أحمل الملف ليك ❌\n\nمثال:\n.ميديافاير https://www.mediafire.com/file/xxxxx/file" 
    }, { quoted: message });

    try {

      const data = await mediafireDl(text);
      if (!data || !data.link) {
        return await sock.sendMessage(chatId, { 
          text: "مش قادر أقرأ صفحة ميديافاير، يمكن الرابط خاص أو بايظ ❌" 
        }, { quoted: message });
      }

      let caption = `≡ *محمل ميديافاير*\n\n`;
      caption += `▢ *الملف:* ${data.name}\n`;
      caption += `▢ *الحجم:* ${data.size}\n`;
      caption += `▢ *النوع:* ${data.ext}\n\n`;
      caption += `جاري تحميل الملف... استنى شوية ⌛`;

      await sock.sendMessage(chatId, { text: caption }, { quoted: message });

      const response = await axios({
          method: 'get',
          url: data.link,
          responseType: 'arraybuffer',
          headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
              'Referer': text
          }
      });

      const buffer = Buffer.from(response.data);

      if (buffer.length < 10000) {
          return await sock.sendMessage(chatId, { 
            text: "الملف اتحمل بس شكله تالف أو مش صحيح ❌" 
          });
      }

      let mimeType = 'application/octet-stream';
      const mimes = { 
        'zip': 'application/zip', 
        'pdf': 'application/pdf', 
        'apk': 'application/vnd.android.package-archive', 
        'mp4': 'video/mp4',
        'mp3': 'audio/mpeg',
        'jpg': 'image/jpeg',
        'png': 'image/png'
      };
      if (mimes[data.ext.toLowerCase()]) mimeType = mimes[data.ext.toLowerCase()];

      await sock.sendMessage(chatId, {
        document: buffer,
        fileName: data.name,
        mimetype: mimeType,
        caption: `تم تحميل الملف بنجاح: ${data.name} ✅`
      }, { quoted: message });

    } catch (err) {
      console.error('MF Download Error:', err);
      await sock.sendMessage(chatId, { 
        text: 'حصل خطأ أثناء التحميل: ' + err.message + ' ❌' 
      }, { quoted: message });
    }
  }
};