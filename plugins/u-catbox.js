const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { uploadToCatbox } = require('../lib/uploaders');

module.exports = {
    command: 'صوره_فيديو_لرابط_2',
    aliases: ['ulr'],
    category: 'ااوامـࢪ الاداوات',
    description: 'ارفع أي ميديا على Catbox.moe (200MB، رابط دائم)',
    usage: '.كاتبوكس (رد على ميديا)',
    
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) {
                await sock.sendMessage(chatId, { text: '⚠️ من فضلك قم بالرد على صورة أو فيديو أو ستكر أو مستند!' }, { quoted: message });
                return;
            }

            const type = Object.keys(quotedMsg)[0];
            const supportedTypes = ['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'];
            
            if (!supportedTypes.includes(type)) {
                await sock.sendMessage(chatId, { text: '⚠️ نوع الملف غير مدعوم!' }, { quoted: message });
                return;
            }

            await sock.sendMessage(chatId, { text: '⏳ جاري رفع الملف على Catbox...' }, { quoted: message });

            const mediaType = type === 'stickerMessage' ? 'sticker' : type.replace('Message', '');
            const stream = await downloadContentFromMessage(quotedMsg[type], mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            let ext = 'bin';
            if (type === 'imageMessage') ext = 'jpg';
            else if (type === 'videoMessage') ext = 'mp4';
            else if (type === 'stickerMessage') ext = 'webp';
            else if (quotedMsg[type].fileName) {
                ext = quotedMsg[type].fileName.split('.').pop() || 'bin';
            }

            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const tempPath = path.join(tempDir, `catbox_${Date.now()}.${ext}`);
            fs.writeFileSync(tempPath, buffer);

            const result = await uploadToCatbox(tempPath);

            await sock.sendMessage(chatId, { 
                text: `✅ تم رفع الملف على Catbox بنجاح!\n\n🔗 الرابط: ${result.url}`
            }, { quoted: message });

            fs.unlinkSync(tempPath);

        } catch (error) {
            console.error('Catbox Error:', error);
            await sock.sendMessage(chatId, { text: `❌ فشل رفع الملف!\nالسبب: ${error.message}` }, { quoted: message });
        }
    }
};