const sharp = require('sharp');
const fs = require('fs');
const fsPromises = require('fs/promises');
const fse = require('fs-extra');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const tempDir = './temp';
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

const scheduleFileDeletion = (filePath) => {
    setTimeout(async () => {
        try {
            await fse.remove(filePath);
            console.log(`تم مسح الملف: ${filePath}`);
        } catch (error) {
            console.error(`فشل مسح الملف:`, error);
        }
    }, 10000); // 10 ثواني
};

module.exports = {
    command: 'استيكر_لصورة',
    aliases: ['simage', 'stoimg', 'صورة_لستيكر'],
    category: 'اوامـࢪ الاداوات',
    description: 'تحويل ستكر لصورة PNG',
    usage: '.استيكر_لصورة (رد على ستكر)',
    
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMessage?.stickerMessage) {
                await sock.sendMessage(chatId, { 
                    text: 'ياعم رد ع استيكر 😂😂❤️' 
                }, { quoted: message });
                return;
            }

            const stickerFilePath = path.join(tempDir, `sticker_${Date.now()}.webp`);
            const outputImagePath = path.join(tempDir, `converted_image_${Date.now()}.png`);

            const stream = await downloadContentFromMessage(quotedMessage.stickerMessage, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            await fsPromises.writeFile(stickerFilePath, buffer);
            await sharp(stickerFilePath).toFormat('png').toFile(outputImagePath);

            const imageBuffer = await fsPromises.readFile(outputImagePath);
            await sock.sendMessage(chatId, { 
                image: imageBuffer, 
                caption: '*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪' 
            }, { quoted: message });

            scheduleFileDeletion(stickerFilePath);
            scheduleFileDeletion(outputImagePath);

        } catch (error) {
            console.error('خطأ في أمر s2img:', error);
            await sock.sendMessage(chatId, { 
                text: 'ف مشكله ياحب 😄❤️' 
            }, { quoted: message });
        }
    }
};