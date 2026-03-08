const axios = require('axios');

module.exports = {
  command: 'تطبيق',
  aliases: ['apk', 'ابلكيشن'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'تنزيل برنامج أندرويد',
  usage: '.تطبيق  <اسم البرنامج>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args.join(' ');

    if (!query) {
      return await sock.sendMessage(chatId, {
        text: '📱 اكتب اسم البرنامج.\nمثال:\n.تطبيق whatsapp'
      }, { quoted: message });
    }

    try {
      await sock.sendMessage(chatId, { text: '⏳ جاري البحث عن البرنامج...' }, { quoted: message });

      const api = `https://api.akuari.my.id/search/apk?q=${encodeURIComponent(query)}`;
      const { data } = await axios.get(api);

      if (!data?.hasil?.length) {
        return await sock.sendMessage(chatId, {
          text: '❌ مفيش برنامج بالاسم ده.'
        }, { quoted: message });
      }

      const app = data.hasil[0];

      const caption = `📦 *${app.nama}*
👨‍💻 المطور: ${app.developer}
⭐ التقييم: ${app.rating}
📥 التحميل:
${app.link}`;

      await sock.sendMessage(chatId, {
        image: { url: app.icon },
        caption
      }, { quoted: message });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(chatId, {
        text: '❌ حصل خطأ أثناء البحث عن البرنامج.'
      }, { quoted: message });
    }
  }
};
