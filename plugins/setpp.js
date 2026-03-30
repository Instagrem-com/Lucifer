const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const isOwnerOrSudo = require('../lib/isOwner');

module.exports = {
  command: 'غير_صوره_البروفايل',
  aliases: ['setppic', 'setdp'],
  category: 'اوامـࢪ الـمـطـوࢪ',
  description: 'غير صورة البوت (للمالك بس)',
  usage: '.setpp (رد على صورة)',
  
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const senderId = message.key.participant || message.key.remoteJid;
      const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

      if (!message.key.fromMe && !isOwner) {
        await sock.sendMessage(chatId, { 
          text: '⚠️ الأمر ده متاح بس للمالك!' 
        }, { quoted: message });
        return;
      }

      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMessage) {
        await sock.sendMessage(chatId, { 
          text: '⚠️ رد على صورة وبعدين اكتب .setpp عشان تغير صورة البوت!' 
        }, { quoted: message });
        return;
      }

      const imageMessage = quotedMessage.imageMessage || quotedMessage.stickerMessage;
      if (!imageMessage) {
        await sock.sendMessage(chatId, { 
          text: '⚠️ الرسالة اللي رديت عليها لازم تكون صورة!' 
        }, { quoted: message });
        return;
      }

      const tmpDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const stream = await downloadContentFromMessage(imageMessage, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      const imagePath = path.join(tmpDir, `profile_${Date.now()}.jpg`);
      fs.writeFileSync(imagePath, buffer);

      await sock.updateProfilePicture(sock.user.id, { url: imagePath });
      fs.unlinkSync(imagePath);

      await sock.sendMessage(chatId, { 
        text: '✅ تمام! صورة البوت اتغيرت بنجاح 😎' 
      }, { quoted: message });

    } catch (error) {
      console.error('خطأ في SetPP:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ معلش 😔 مقدرتش أغير صورة البوت!' 
      }, { quoted: message });
    }
  }
};