const axios = require('axios');

const AXIOS_DEFAULTS = {
  timeout: 60000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': '*/*'
  }
};

module.exports = {
  command: 'فيسبوك',
  aliases: ['fb','fbdl'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'تحميل فيديوهات فيسبوك',
  usage: '.فيسبوك <رابط فيديو فيسبوك>',

  async handler(sock, message, args, context = {}) {

    const chatId = context.chatId || message.key.remoteJid;
    const url = args.join(" ");

    try {

      if (!url) {
        return await sock.sendMessage(chatId,{
          text:'💻 *تحميل فيديو من فيسبوك* 💻\n\nالاستخدام:\n.فيسبوك <رابط>'
        },{quoted:message});
      }

      if (!/facebook\.com|fb\.watch/i.test(url)) {
        return await sock.sendMessage(chatId,{
          text:'الرابط غير صالح 👀'
        },{quoted:message});
      }

      await sock.sendMessage(chatId,{
        react:{ text:'🔄', key:message.key }
      });

      /*
      ========================
      🔥 API QASIM
      ========================
      */

      const apiUrl = `https://api.qasimdev.dpdns.org/api/facebook/download?url=${encodeURIComponent(url)}&apikey=qasim-dev`;

      const res = await axios.get(apiUrl, AXIOS_DEFAULTS);

      const data = res?.data;

      if (!data || !data.data || !data.data.length) {
        throw new Error('No video found');
      }

      // اختيار أعلى جودة
      const vids = data.data.sort((a,b)=>{
        const qa = parseInt(a.quality) || 0;
        const qb = parseInt(b.quality) || 0;
        return qb - qa;
      });

      const selected = vids[0];
      const videoUrl = selected.url;
      const quality = selected.quality || "غير معروفة";

      /*
      ========================
      ⚡ تحميل كـ Buffer (حل المشكلة)
      ========================
      */

      const videoBuffer = await axios.get(videoUrl, {
        responseType: 'arraybuffer',
        ...AXIOS_DEFAULTS
      });

      const caption =
`🥂 *الفيديو يا حب* 🥂

الجودة 💻 : *${quality}*

> *BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`;

      await sock.sendMessage(chatId,{
        video: videoBuffer.data,
        mimetype:'video/mp4',
        caption
      },{quoted:message});

    } catch(err) {

      console.log('FB ERROR:', err);

      await sock.sendMessage(chatId,{
        text:'❌ فشل تحميل الفيديو. جرب رابط تاني 😄'
      },{quoted:message});

    }

  }
};