const { File } = require('megajs');
const path = require('path');

module.exports = {
    command: 'ميجا',
    aliases: ['megadl', 'ميجادل'],
    category: 'اوامـࢪ الـتـحـمـيـل',
    description: 'يحمل الملفات من MEGA مع شريط تقدم لحظي',
    usage: '.ميجا <رابط ميجا>',

    async handler(sock, message, args, context = {}) {
        const { chatId } = context;
        const text = args.join(' ');

        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: "ابعت رابط ميجا عشان أحمل الملف ليك من الموقع 👀❤️\n\nمثال 📝👇🏼:\n.ميجا https://mega.nz/file/xxxx#xxxx"
            }, { quoted: message });
        }

        try {
            const file = File.fromURL(text);
            await file.loadAttributes();

            if (file.size >= 500 * 1024 * 1024) {
                return await sock.sendMessage(chatId, { text: ' الملف كبير ياعم قوي الحد الأقصى 500MB 😂❤️' }, { quoted: message });
            }

            const { key } = await sock.sendMessage(chatId, { 
                text: `🌩️ *تحميل MEGA* 🌩️\n\n▢ *الملف* 💻 : ${file.name}\n▢ *الحجم* ⚙️ : ${this.formatBytes(file.size)}\n\n*التقدم:* 0% [░░░░░░░░░░]` 
            }, { quoted: message });

            const stream = file.download();
            let chunks = [];
            let lastUpdate = Date.now();

            stream.on('progress', async (info) => {
                const { bytesLoaded, bytesTotal } = info;
                const percentage = Math.floor((bytesLoaded / bytesTotal) * 100);

                if (Date.now() - lastUpdate > 3000 || percentage === 100) {
                    const bar = this.generateBar(percentage);
                    await sock.sendMessage(chatId, { 
                        text: `🌩️ *تحميل MEGA* 🌩️\n\n▢ *الملف* 💻 ${file.name}\n▢ *الحجم* ⚙️ ${this.formatBytes(bytesTotal)}\n\n*التقدم:* ${percentage}% [${bar}]`,
                        edit: key 
                    });
                    lastUpdate = Date.now();
                }
            });

            stream.on('data', (chunk) => chunks.push(chunk));

            stream.on('end', async () => {
                const buffer = Buffer.concat(chunks);
                const ext = path.extname(file.name).toLowerCase();
                
                const mimeTypes = {
                    '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.zip': 'application/zip',
                    '.apk': 'application/vnd.android.package-archive', '.png': 'image/png', '.jpg': 'image/jpeg'
                };

                await sock.sendMessage(chatId, {
                    document: buffer,
                    fileName: file.name,
                    mimetype: mimeTypes[ext] || 'application/octet-stream',
                    caption: `الملف نزل ياحب 👀❤️\n▢ *الملف:* ${file.name}\n▢ *الحجم:* ${this.formatBytes(file.size)}\n\n*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`
                }, { quoted: message });
            });

            stream.on('error', async (err) => {
                await sock.sendMessage(chatId, { text: `❌ حصل خطأ أثناء التحميل: ${err.message}` });
            });

        } catch (error) {
            await sock.sendMessage(chatId, { text: `❌ حصل خطأ: ${error.message}` });
        }
    },

    formatBytes(bytes) {
        if (bytes === 0) return '0 بايت';
        const k = 1024;
        const sizes = ['بايت', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    generateBar(percentage) {
        const totalBars = 10;
        const filledBars = Math.floor((percentage / 100) * totalBars);
        return '█'.repeat(filledBars) + '░'.repeat(totalBars - filledBars);
    }
};