module.exports = {
  command: 'هكر',
  aliases: ['اختراق', 'اختراق_وهمي'],
  category: 'اوامـࢪ الاداوات',
  description: 'محاكاة عملية اختراق للمزاح',
  usage: '.اختراق <الهدف>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const target = args?.[0] || 'الهدف';

    try {
      await sock.sendMessage(chatId, { text: `جاري بدء عملية الاختراق 💻\n\n*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪` }, { quoted: message });
      await delay(1500);

      await sock.sendMessage(chatId, { text: `جارى الاتصال بالسيرفر بأمان 🔌` }, { quoted: message });
      await delay(1500);

      await sock.sendMessage(chatId, { text: `جارى تخطي الجدران النارية ونظام الحماية 🛡` }, { quoted: message });
      await displayProgressBar(sock, message, 'تخطي الحماية', 4, chatId);

      await sock.sendMessage(chatId, { text: `جارى الدخول لقاعدة البيانات المشفرة 🔐` }, { quoted: message });
      await delay(2000);

      await sock.sendMessage(chatId, { text: `جارى كسر مفاتيح التشفير 🔑` }, { quoted: message });
      await displayProgressBar(sock, message, 'كسر التشفير', 6, chatId);

      await sock.sendMessage(chatId, { text: `جارى تحميل البيانات السرية من السيرفر 📥` }, { quoted: message });
      await displayProgressBar(sock, message, 'تحميل الملفات', 5, chatId);

      await sock.sendMessage(chatId, { text: `جارى تامين اتصال الاختراق 🔒` }, { quoted: message });
      await delay(2500);

      await sock.sendMessage(chatId, { text: `تم الاختراق بنجاح الهدف "${target}" ⚡` }, { quoted: message });
      await delay(1000);

      await sock.sendMessage(chatId, { text: `تمت المهمة بنجاح جاري ارسال بياناتك للمطور 💀🖤` }, { quoted: message });

    } catch (error) {
      console.error('Error in hack sequence:', error);
      await sock.sendMessage(chatId, { text: ` ⚠️ حصل خطأ أثناء عملية الاختراق حاول مرة أخرى ` }, { quoted: message });
    }
  }
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function displayProgressBar(sock, message, taskName, steps, chatId) {
  const progressBarLength = 20;

  for (let i = 1; i <= steps; i++) {
    const progress = Math.round((i / steps) * progressBarLength);
    const bar = '█'.repeat(progress) + '░'.repeat(progressBarLength - progress);
    await sock.sendMessage(chatId, { text: `${taskName}: [${bar}]` }, { quoted: message });
    await delay(1000);
  }
}