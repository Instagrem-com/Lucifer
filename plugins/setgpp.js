const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    command: 'غير_صوره_الجروب',
    aliases: ['setgpic', 'grouppp', 'setgrouppic'],
    category: 'اوامـࢪ الـجـࢪوبـات',
    description: 'غير صورة البروفايل بتاع الجروب',
    usage: '.غير_صوره_الجروب (رد على صورة)',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMessage = quoted?.imageMessage || quoted?.stickerMessage;

        if (!imageMessage) {
            await sock.sendMessage(chatId, {
                text: 'يا عم لازم ترد على صورة عشان تغير صورة الجروب 😂😂\n\nالاستخدام 📝 : رد على صورة وبعدين اكتب `.غير_صوره_الجروب`'
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
                text: 'الصوره اتغيرت ياحب 👀❤️'
            }, { quoted: message });

        } catch (error) {
            console.error('خطأ في تغيير صورة الجروب:', error);
            await sock.sendMessage(chatId, {
                text: 'اتاكد اني ادمن ياحب 😄❤️.'
            }, { quoted: message });
        }
    }
};