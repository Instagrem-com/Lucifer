
module.exports = {
  command: 'ايدي_القناة',
  aliases: ['CID'],
  category: 'general',
  description: 'تـولـيـد ايـدي لـقـنـاة واتـسـاب 👀❤️',
  usage: '.ايدي_الـقـنـاة <الرابط>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    
    let url = args[0] || "";
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quoted) {
      url = quoted.conversation || quoted.extendedTextMessage?.text || url;
    }

    if (!url || !url.includes('whatsapp.com/channel/')) {
      return await sock.sendMessage(chatId, { 
        text: 'ابـعـت لـيـنـك الـقـنـاة يـاحـب 😊❤️.\n\n*مثلا:* .ايدي_القناة https://whatsapp.com/channel/0029VbCKWqiBKfi7Df0m7O1M' 
      }, { quoted: message });
    }

    const code = url.split('/').pop();

    try {

      const metadata = await sock.newsletterMetadata("invite", code);

      const response = `*The ID BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪ \n ${metadata.id}
      `.trim();

      await sock.sendMessage(chatId, { text: response }, { quoted: message });

    } catch (err) {
      console.error('Channel ID Error:', err);
      await sock.sendMessage(chatId, { 
        text: 'ف مـشـكـلـة يـا حـب او الـقـنـاة مـش مـوجـودة او الـلـيـنـك غـلـط حـاول تـانـي 👀❤️' 
      }, { quoted: message });
    }
  }
};
