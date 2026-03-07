const Qasim = require('api-qasim');
const axios = require('axios');

module.exports = {
  command: 'تطبيق',
  aliases: ['ابلكيشن', 'apk'],
  category: 'apks',
  description: 'تنزيل تطبيق من ع النت ❤️👀',
  usage: '.تطبيق >اسم التطبيق<',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args.join(' ').trim();

    try {
      if (!query) {
        return await sock.sendMessage(chatId, { text: '*اکـتـب اسـم الـتـطـبـيـق ب الانجليزي 👀💙*\nمثلا : .تطبيق Facebook' }, { quoted: message });
      }

      await sock.sendMessage(chatId, { text: ' بـجـبـلـك الـتـطـبـيـق ويـت...🔎' }, { quoted: message });

      const res = await Qasim.apksearch(query);

      if (!res?.data || !Array.isArray(res.data) || res.data.length === 0) {
        return await sock.sendMessage(chatId, { text: 'ف مشكلة ياحب جرب تاني 👀❤️' }, { quoted: message });
      }

      const results = res.data;
      const first = results[0];

      let caption = ` *كل حاجه عن التطبيق 👀❤️* *${query}*\n\n`;
      caption += `↩️ *اعمل ريبلاي برقم التطبيق 📝*\n\n`;

      results.forEach((item, i) => {
  caption +=
    `*${i + 1}.* ${item.judul}\n` +
    `👨‍💻 الـمـصـدࢪ : ${item.dev}\n` +
    `⭐ الـتـقـيـيـم : ${item.rating}\n` +
    `🔗 ${item.link}\n\n`;
});

      const sentMsg = await sock.sendMessage(chatId, { image: { url: first.thumb }, caption }, { quoted: message });

      const timeout = setTimeout(async () => {
        sock.ev.off('messages.upsert', listener);
        await sock.sendMessage(chatId, { text: 'الـوقـت خـلـص يـحـب جـرب تـانـي 😁' }, { quoted: sentMsg });
      }, 5 * 60 * 1000);

      const listener = async ({ messages }) => {
        const m = messages[0];
        if (!m?.message || m.key.remoteJid !== chatId) return;

        const ctx = m.message?.extendedTextMessage?.contextInfo;
        if (!ctx?.stanzaId || ctx.stanzaId !== sentMsg.key.id) return;

        const replyText =
          m.message.conversation ||
          m.message.extendedTextMessage?.text ||
          '';

        const choice = parseInt(replyText.trim());
        if (isNaN(choice) || choice < 1 || choice > results.length) {
          return await sock.sendMessage(chatId, { text: `رقم غلط يسطا جرب من 1-${results.length}.` }, { quoted: m });
        }

        clearTimeout(timeout);
        sock.ev.off('messages.upsert', listener);

        const selected = results[choice - 1];
        
        await sock.sendMessage(chatId, { text: `جاري تنزيل *${selected.judul}*...\n استنا يحب 👀❤️` }, { quoted: m });
        const apiUrl =
          `https://discardapi.dpdns.org/api/apk/dl/android1?apikey=guru&url=` +
          encodeURIComponent(selected.link);

        const dlRes = await axios.get(apiUrl);

        const apk = dlRes.data?.result;
        if (!apk?.url) {
          return await sock.sendMessage(chatId, { text: 'ف مشكلة ياحب جرب تاني 👀❤️' }, { quoted: m });
        }
        const safeName = apk.name.replace(/[^\w.-]/g, '_');

        const apkCaption =
          `📦 *تـم تـحـمـيـل الـتـطـبـيـق*\n\n` +
          `📛 الاسـم : ${apk.name}\n` +
          `⭐ الـتـقـيـيـم : ${apk.rating}\n` +
          `📦 الـحـجـم : ${apk.size}\n` +
          `📱 انـدرويـد : ${apk.requirement}\n` +
          `🧒 الـعـمـر : ${apk.rated}\n` +
          `📅 تـاريـخ الـنـشـر : ${apk.published}\n\n` +
          `📝 الـوصـف :\n${apk.description}`;

        await sock.sendMessage(chatId, { document: { url: apk.url }, fileName: `${safeName}.apk`, mimetype: 'application/vnd.android.package-archive', caption: apkCaption }, { quoted: m });
      };

      sock.ev.on('messages.upsert', listener);

    } catch (err) {
      console.error('ف مشكلة ياحب جرب تاني 👀❤️', err);
      await sock.sendMessage(chatId, { text: 'ف مشكلة ياحب جرب تاني 👀❤️' }, { quoted: message });
    }
  }
};

