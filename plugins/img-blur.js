const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');

module.exports = {
  command: 'بلور_للصوره',
  aliases: ['blurimg', 'blurpic'],
  category: 'اوامـࢪ الاداوات',
  description: 'اعمل تأثير تمويه للصورة ✨',
  usage: '.بلور_للصوره (رد على صورة أو ابعتها مع الكابشن)',
  
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    try {
      let imageBuffer;
      
      if (quotedMessage?.imageMessage) {
        const quoted = { message: { imageMessage: quotedMessage.imageMessage } };
        imageBuffer = await downloadMediaMessage(quoted, 'buffer', {}, {});
      } else if (message.message?.imageMessage) {
        imageBuffer = await downloadMediaMessage(message, 'buffer', {}, {});
      } else {
        await sock.sendMessage(chatId, { 
          text: 'ابعتلي صورة أو رد على صورة مع `.بلور_للصوره` عشان أعملها تمويه 👀❤️', 
          quoted: message 
        });
        return;
      }

      const resizedImage = await sharp(imageBuffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      const blurredImage = await sharp(resizedImage)
        .blur(10)
        .toBuffer();

      await sock.sendMessage(chatId, {
        image: blurredImage,
        caption: 'تمويه الصورة خلص ياحب 👀❤️\n\n*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪',
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363425019719202@newsletter',
            newsletterName: '✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪',
            serverMessageId: -1
          }
        }
      }, { quoted: message });

    } catch (error) {
      console.error('خطأ في أمر التمويه:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ معملش تمويه للصورة دلوقتي 😓 جرب تاني بعد شويه', 
        quoted: message 
      });
    }
  }
};