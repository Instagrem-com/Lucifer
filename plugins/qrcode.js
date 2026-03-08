const QRCode = require('qrcode');

module.exports = {
  command: 'كيو_ار', // بدل 'qrcode'
  aliases: ['qr', 'كيوار'],
  category: 'اوامـࢪ الاداوات',
  description: 'اعمل QR Code من أي نص',
  usage: '.كيو_ار <النص>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = args?.join(' ')?.trim();

    if (!text) {
      return await sock.sendMessage(chatId, { 
        text: '*ادخل النص عشان اعملك QR Code* 👀❤️\n\nمثال : .كيو_ار ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪' 
      }, { quoted: message });
    }

    try {
      const qr = await QRCode.toDataURL(text.slice(0, 2048), {
        errorCorrectionLevel: 'H',
        scale: 8
      });

      await sock.sendMessage(chatId, { 
        image: { url: qr }, 
        caption: 'عملتلك الQR يا حب 👀❤️\n\n*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪' 
      }, { quoted: message });
    } catch (err) {
      console.error('خطأ في أمر QR:', err);
      await sock.sendMessage(chatId, { 
        text: ' حصل خطأ، مقدرتش اعملك QR Code 🙃' 
      }, { quoted: message });
    }
  }
};