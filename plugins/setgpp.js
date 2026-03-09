const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    command: 'غير_صوره_الجروب',
    aliases: ['setgpic', 'grouppp', 'setgrouppic'],
    category: 'اوامـࢪ الـجـࢪوبـات',
    description: 'غير صورة البروفايل بتاع الجروب',
    usage: '.setgpp (رد على صورة)',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMessage = quoted?.imageMessage || quoted?.stickerMessage;

        if (!imageMessage) {
            await sock.sendMessage(chatId, {
                text: '❌ يا عم لازم ترد على صورة أو ستيكر عشان تغير صورة الجروب!\n\nUsage: رد على صورة وبعدين اكتب `.setgpp`'
            }, { quoted: message });
            return;
        }

        try {
            const tmpDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

            const stream = await downloadContentFromMessage(imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            const imgPath = path.join(tmpDir, `gpp_${Date.now()}.jpg`);
            fs.writeFileSync(imgPath, buffer);

            await sock.updateProfilePicture(chatId, { url: imgPath });

            try { fs.unlinkSync(imgPath); } catch (e) {}

            await sock.sendMessage(chatId, {
                text: '✅ تمام! صورة الجروب اتغيرت بنجاح 😎'
            }, { quoted: message });

        } catch (error) {
            console.error('خطأ في تغيير صورة الجروب:', error);
            await sock.sendMessage(chatId, {
                text: '❌ معلش 😔 مقدرتش أغير صورة الجروب\n\nاتأكد إن البوت مشرف والصورة سليمة.'
            }, { quoted: message });
        }
    }
};