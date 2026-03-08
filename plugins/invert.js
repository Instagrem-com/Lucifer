const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'صوره_نيجاتيف',
  aliases: ['negative'],
  category: 'tools',
  description: 'حوّل الصورة لنيجاتيف بسهولة 🔥',
  usage: 'رد على صورة واكتب .invert',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const quoted =
        message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted?.imageMessage) {
        return await sock.sendMessage(
          chatId,
          { text: 'حوّل الصورة لنيجاتيف بسهولة 🤍\n\nرد على صورة عشان أحولها نيجاتيف\n\nطريقة الاستخدام:\n.invert' },
          { quoted: message }
        );
      }

      await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });

      const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const tempFile = path.join(__dirname, `invert_${Date.now()}.jpg`);
      fs.writeFileSync(tempFile, buffer);

      const form = new FormData();
      form.append('apikey', 'guru');
      form.append('file', fs.createReadStream(tempFile));

      const res = await axios.post(
        'https://discardapi.dpdns.org/api/image/invert',
        form,
        { headers: form.getHeaders(), responseType: 'arraybuffer', timeout: 60000 }
      );
      fs.unlinkSync(tempFile);

      if (!res?.data) throw new Error('فشل تحويل الصورة');

      const grayFile = path.join(__dirname, `invert_result_${Date.now()}.jpg`);
      fs.writeFileSync(grayFile, res.data);

      await sock.sendMessage(
        chatId,
        {
          image: { url: grayFile },
          caption: `الصورة اتحولت لنيجاتيف بنجاح 🤍\n\nتم المعالجة عن طريق لوسيفر 🔥`
        },
        { quoted: message }
      );
      fs.unlinkSync(grayFile);

    } catch (err) {
      console.error('Invert Plugin Error:', err);
      await sock.sendMessage(
        chatId,
        { text: 'معرفتش أحول الصورة لنيجاتيف دلوقتي 😓 اتأكد إن الصورة واضحة وجرب تاني' },
        { quoted: message }
      );
    }
  }
};