module.exports = {
  command: 'سبام',
  aliases: [],
  category: 'اوامـࢪ الـبـوت',
  description: 'لتكرار كلمه كذا مره كل رسالة لوحدها',
  usage: '.تكرار_كلمه <الكلمه> <العدد>',
  isPrefixless: true,
  ownerOnly: true,

  async handler(sock, message, args) {
    const chatId = message.key.remoteJid;

    if (args.length < 2) {
      return await sock.sendMessage(chatId, { 
        text: 'الاستخدام 📝 :\n .تكرار_كلمه <الكلمه> <العدد> 👀❤️' 
      }, { quoted: message });
    }

    const count = parseInt(args[args.length - 1]);
    if (isNaN(count) || count <= 0) {
      return await sock.sendMessage(chatId, { text: '🫪' }, { quoted: message });
    }

    args.pop();
    const text = args.join(' ').trim();

    // حلقة لإرسال كل رسالة لوحدها
    for (let i = 0; i < count; i++) {
      await sock.sendMessage(chatId, { text: text });
      // اختيارياً ممكن تحط تأخير صغير عشان ما يعتبرش spam
      await new Promise(r => setTimeout(r, 300)); // 300ms delay
    }
  }
};