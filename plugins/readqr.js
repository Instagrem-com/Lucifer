const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'اقرا_كيو_ار', // بدل 'readqr'
  aliases: ['qrread', 'QR', 'مسح_كيو_ار'],
  category: 'اوامـࢪ الاداوات',
  description: 'اقرا QR Code من صورة',
  usage: 'رد على صورة واكتب .اقرا_كيو_ار',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const quoted =
        message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted?.imageMessage) {
        return await sock.sendMessage(
          chatId,
          { text: '🧾 *قارئ QR* 🧾\n\n رد على صورة فيها QR Code عشان اقراهولك 👀❤️\n\nالاستخدام 📝:\n.اقرا_كيو_ار' },
          { quoted: message }
        );
      }

      // تفاعل مؤقت مع الرسالة
      await sock.sendMessage(chatId, {
        react: { text: '🔍', key: message.key }
      });

      // تحميل الصورة
      const stream = await downloadContentFromMessage(
        quoted.imageMessage,
        'image'
      );

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const tempFile = path.join(__dirname, `qr_${Date.now()}.png`);
      fs.writeFileSync(tempFile, buffer);

      // رفع الصورة للAPI
      const form = new FormData();
      form.append('apikey', 'guru');
      form.append('image', fs.createReadStream(tempFile));

      const res = await axios.post(
        'https://discardapi.dpdns.org/api/tools/readqr',
        form,
        { headers: form.getHeaders(), timeout: 60000 }
      );

      // مسح الصورة المؤقتة
      fs.unlinkSync(tempFile);

      if (!res?.data?.status) throw new Error('فشل قراءة QR');

      await sock.sendMessage(
        chatId,
        {
          text:
`✅ *تم قراءة QR Code* ✅

📄 *النتيجة* 📄
\`\`\`
${res.data.result}
\`\`\`

بواسطة ⚡ : ${res.data.creator}

*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪
`
        },
        { quoted: message }
      );

    } catch (err) {
      console.error('خطأ في قارئ QR:', err);
      await sock.sendMessage(
        chatId,
        { text: '❌ مقدرتش اقرا QR Code. جرب صورة أوضح شوية.' },
        { quoted: message }
      );
    }
  }
};