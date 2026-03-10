const axios = require('axios');
const cheerio = require('cheerio');

const lastSearch = {}; // لتخزين حالة البحث لكل كلمه

module.exports = {
    command: 'صوره',
    aliases: ['صور', 'googleimg'],
    category: 'اوامـࢪ الـتـحـمـيـل',
    description: 'جيبلك صور من جوجل 😎',
    usage: '.صوره <اسم الصورة>',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args.join(" ");

        if (!query) {
            return sock.sendMessage(chatId, { 
                text: "📸 اكتب اسم الصورة عشان أجيبلك صور من جوجل 😎\nمثال: `.صوره نانسي عجرم`" 
            }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, { text: `⏳ بدورلك على صور "${query}" ...` }, { quoted: message });

            // جلب صفحة البحث عن الصور
            const res = await axios.get(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            });

            const $ = cheerio.load(res.data);
            const images = [];
            $('img').each((i, el) => {
                const src = $(el).attr('src');
                if (src && src.startsWith('http')) images.push(src);
            });

            if (!images.length) {
                return sock.sendMessage(chatId, { text: `😕 ملقتش صور "${query}"` }, { quoted: message });
            }

            // ترتيب عشوائي مع التغيير لو نفس البحث
            if (!lastSearch[query]) lastSearch[query] = 0;
            const start = lastSearch[query];
            const selected = images.slice(start, start + 5);
            lastSearch[query] = (start + 5) % images.length;

            for (let i = 0; i < selected.length; i++) {
                await sock.sendMessage(chatId, {
                    image: { url: selected[i] },
                    caption: `صورة ${i+1} من البحث عن "${query}"\n*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`
                }, { quoted: message });

                await new Promise(r => setTimeout(r, 1000)); // وقت بسيط بين الصور
            }

        } catch (err) {
            console.error(err);
            await sock.sendMessage(chatId, { text: '❌ حصل غلطة في جلب الصور، جرب تاني 😢' }, { quoted: message });
        }
    }
};