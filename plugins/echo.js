module.exports = {
  command: 'تكرار_كلمه',
  aliases: [],
  category: 'اوامـࢪ الـبـوت',
  description: 'لتكرار كلمه كذا مره تحت بعض',
  usage: '.تكرار_كلمه <الكلمه> <العدد>',
  isPrefixless: true,

  async handler(sock, message, args) {
    const chatId = message.key.remoteJid;

    if (args.length < 2) {
      return await sock.sendMessage(chatId, { text: 'الاستخدام 📝 :\n .تكرار_كلمه <الكلمه> <العدد> 👀❤️' }, { quoted: message });
    }

    const count = parseInt(args[args.length - 1]);
    if (isNaN(count) || count <= 0) {
      return await sock.sendMessage(chatId, { text: '🫪' }, { quoted: message });
    }

    args.pop();
    const text = args.join(' ').trim();

    const repeated = Array(count).fill(text).join('\n');
    await sock.sendMessage(chatId, { text: repeated }, { quoted: message });
  }
};
