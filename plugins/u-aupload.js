const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { uploadFile } = require('../lib/uploaders');

module.exports = {
    command: 'تحويل_اي_حاجه_لرابط',
    aliases: ['aupload', 'upall', 'aup', 'toall'],
    category: 'اوامـࢪ الاداوات',
    description: 'ارفع أي ميديا للسيرفر واحصل على رابط',
    usage: '.رفع_كامل (رد على صورة/فيديو/ستكر/مستند)',
    
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) {
                await sock.sendMessage(chatId, { text: '⚠️ من فضلك قم بالرد على صورة أو فيديو أو GIF أو ستكر أو مستند!' }, { quoted: message });
                return;
            }

            const type = Object.keys(quotedMsg)[0];
            const supportedTypes = ['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'];
            
            if (!supportedTypes.includes(type)) {
                await sock.sendMessage(chatId, { text: '⚠️ نوع الملف غير مدعوم! يجب أن يكون صورة/فيديو/ستكر/مستند' }, { quoted: message });
                return;
            }

            await sock.sendMessage(chatId, { text: '⏳ جاري رفع الملف للسيرفر...' }, { quoted: message });

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
            else if (type === 'documentMessage') {
                const fileName = quotedMsg[type].fileName || 'file';
                ext = fileName.split('.').pop() || 'bin';
            }

            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const tempPath = path.join(tempDir, `upload_${Date.now()}.${ext}`);
            fs.writeFileSync(tempPath, buffer);

            const stats = fs.statSync(tempPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

            const result = await uploadFile(tempPath);

            await sock.sendMessage(chatId, { 
                text: `✅ تم رفع الملف بنجاح!\n\n` +
                      `📊 *الخدمة:* ${result.service}\n` +
                      `📦 *الحجم:* ${fileSizeMB} MB\n` +
                      `🔗 *الرابط:* ${result.url}\n\n` +
                      `_اضغط على الرابط للعرض أو التحميل_`
            }, { quoted: message });

            fs.unlinkSync(tempPath);

        } catch (error) {
            console.error('Upload Error:', error);
            await sock.sendMessage(chatId, { 
                text: `❌ فشل رفع الملف!\n\nالسبب: ${error.message}` 
            }, { quoted: message });
        }
    }
};