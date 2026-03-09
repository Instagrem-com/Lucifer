const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'توضيح_الصوره',
  aliases: ['enhance'],
  category: 'اوامـࢪ الاداوات',
  description: 'تحويل الصورة لتصبح أكثر وضوحًا (Sharpen)',
  usage: 'رد على صورة مع .sharpen',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted?.imageMessage) {
        return await sock.sendMessage(
          chatId,
          { text: '🩵 *توضيح الصورة*\n\nرد على صورة عشان البوت يحسنها ويخليها أوضح\n\nالاستخدام:\n.sharpen' },
          { quoted: message }
        );
      }

      // إرسال رد فعل مؤقت
      await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });

      // تحميل الصورة المرفقة
      const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      const tempFile = path.join(__dirname, `sharpen_${Date.now()}.jpg`);
      fs.writeFileSync(tempFile, buffer);

      const form = new FormData();
      form.append('apikey', 'guru');
      form.append('file', fs.createReadStream(tempFile));

      // رفع الصورة لAPI للتعديل
      const res = await axios.post(
        'https://discardapi.dpdns.org/api/image/sharpen',
        form,
        { headers: form.getHeaders(), responseType: 'arraybuffer', timeout: 60000 }
      );
      fs.unlinkSync(tempFile);

      if (!res?.data) throw new Error('فشل تعديل الصورة');

      const resultFile = path.join(__dirname, `sharpen_result_${Date.now()}.jpg`);
      fs.writeFileSync(resultFile, res.data);

      await sock.sendMessage(
        chatId,
        {
          image: { url: resultFile },
          caption: '🩵 *الصورة تم تحسينها*\n\nتمت المعالجة بواسطة: MEGA-MD'
        },
        { quoted: message }
      );

      fs.unlinkSync(resultFile);

    } catch (err) {
      console.error('خطأ في Sharpen Plugin:', err);
      await sock.sendMessage(
        chatId,
        { text: '❌ فشل في تحسين الصورة. اتأكد ان الصورة واضحة وجرب تاني.' },
        { quoted: message }
      );
    }
  }
};