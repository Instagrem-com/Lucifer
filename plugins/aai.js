const axios = require("axios");

module.exports = {
    command: "بوت",
    aliases: ["ai", "chat", "ذكاء"],
    category: "اوامـࢪ الـAi",
    description: "تفاعل مع ذكاء اصطناعي Kimi",
    usage: ".كيمي <السؤال>",

    async handler(sock, message, args) {
        try {
            const chatId = message.key.remoteJid; // ✅ الصح
            const text = args.join(" ");

            if (!text) {
                return await sock.sendMessage(chatId, {
                    text: "❌ اكتب كلامك أو سؤالك يا كينج"
                }, { quoted: message });
            }

            await sock.sendMessage(chatId, {
                react: { text: "🧠", key: message.key }
            });

            // 🔥 رد خاص لو حد قال انت مين
            const lower = text.toLowerCase();
            if (lower.includes("انت مين") || lower.includes("اسمك ايه")) {
                return await sock.sendMessage(chatId, {
                    text: "انا لوسيفر، مساعدك الذكي 💀🖤"
                }, { quoted: message });
            }

            const apiUrl = `https://api.qasimdev.dpdns.org/api/kimi/ai?apikey=qasim-dev&prompt=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl);

            const reply = data?.success
                ? (data.result || "🤖 مش فاهم السؤال بصراحة 😅")
                : "❌ حصل مشكلة في الـ AI";

            await sock.sendMessage(chatId, {
                text: `🤖 لوسيفر:\n${reply}`
            }, { quoted: message });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(message.key.remoteJid, {
                text: "❌ حصل خطأ غير متوقع"
            }, { quoted: message });
        }
    }
};