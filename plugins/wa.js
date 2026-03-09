module.exports = {
  command: 'رابط_رقم',
  aliases: ['wa', 'waid'],
  category: 'اوامـࢪ الاداوات',
  description: 'Generate a WhatsApp link from a phone number.',
  usage: '.walink <number> or reply to a user with .wa',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      let waNumber = '';
      if (args.length > 0) {
        waNumber = args.join('').replace(/[^0-9]/g, '');
      } else {
        const ctx = message.message?.extendedTextMessage?.contextInfo;
        
        if (ctx?.participant) {
          waNumber = ctx.participant.replace(/[^0-9]/g, '');
        } else if (ctx?.mentionedJid?.[0]) {
          waNumber = ctx.mentionedJid[0].replace(/[^0-9]/g, '');
        } else {
          return await sock.sendMessage(
            chatId,
            { text: 'اكتب الرقم ياحب 👀❤️' },
            { quoted: message }
          );
        }
      }
      if (!waNumber) {
        return await sock.sendMessage(
          chatId,
          { text: 'ف مشكله 👀❤️' },
          { quoted: message }
        );
      }
      const waLink = `https://wa.me/${waNumber}`;
      await sock.sendMessage(
        chatId,
        { text: `*الرابط يا حب* 👀❤️\n${waLink} \n\n*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪` },
        { quoted: message }
      );
    } catch (error) {
      console.error('WA COMMAND ERROR:', error);
      await sock.sendMessage(
        chatId,
        { text: 'ف مشكله ياحب 👀❤️' },
        { quoted: message }
      );
    }
  }
};
