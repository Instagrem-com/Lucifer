const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// ضع هنا رقمك المربوط بالبوت بصيغة WhatsApp ID
const OWNER_NUMBER = '201501728150@s.whatsapp.net'; // مثال: 'رقمك@c.us' للخاص

module.exports = {
  command: 'وان_فيو_2',
  aliases: ['❤️', 'vv'],
  category: 'اوامـࢪ الـمـطـوࢪ',
  description: 'إرسال صورة أو فيديو view-once على رقمك فقط بدون رد في الشات',
  usage: '.👀 (رد على view-once)',

  async handler(sock, message, args, context = {}) {

    try {
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const quotedImage = quoted?.imageMessage;
      const quotedVideo = quoted?.videoMessage;

      // دالة لتحويل المحتوى لبافر
      async function getBuffer(streamType, content) {
        const stream = await downloadContentFromMessage(content, streamType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        return buffer;
      }

      if (quotedImage?.viewOnce) {
        const buffer = await getBuffer('image', quotedImage);
        await sock.sendMessage(OWNER_NUMBER, {
          image: buffer,
          fileName: 'viewonce.jpg',
          caption: quotedImage.caption || '🫪'
        });
      } 
      else if (quotedVideo?.viewOnce) {
        const buffer = await getBuffer('video', quotedVideo);
        await sock.sendMessage(OWNER_NUMBER, {
          video: buffer,
          fileName: 'viewonce.mp4',
          caption: quotedVideo.caption || '🫪'
        });
      } 
      else {
        // لو الرسالة مش view-once ممكن تجاهلها بدون رد
        return;
      }

    } catch (error) {
      console.error('Error sending view-once to owner:', error);
      // مش هنبعت أي رد في الشات الأصلي
    }

  }
};