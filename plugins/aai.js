const axios = require("axios");

module.exports = {
    command: "كيمي",
    aliases: ["ai", "chat", "ذكاء"],
    category: "ذكاء اصطناعي",
    description: "تفاعل مع ذكاء اصطناعي Kimi",
    usage: ".كيمي <السؤال>",

    async handler(sock, message, args) {
        try {
            const chatId = message.key.remoteJid;
            const text = args.join(" ");

            // ❌ مفيش نص
            if (!text) {
                return await sock.sendMessage(chatId, {
                    text: "❌ اكتب سؤالك يا كينج"
                }, { quoted: message });
            }

            // 🧠 ريأكشن
            await sock.sendMessage(chatId, {
                react: { text: "🧠", key: message.key }
            });

            // 😈 رد مخصص
            const lower = text.toLowerCase();
            if (lower.includes("انت مين") || lower.includes("مين انت")) {
                return await sock.sendMessage(chatId, {
                    text: "🤖 انا لوسيفر، مساعدك الشخصي 💀🖤"
                }, { quoted: message });
            }

            // 🔥 API
            const apiUrl = `https://api.qasimdev.dpdns.org/api/kimi/ai?apikey=qasim-dev&prompt=${encodeURIComponent(text)}`;

            const { data } = await axios.get(apiUrl);

            // 👇 دي أهم حتة (حل مشكلة الرد الفاضي)
            const reply =
                data?.result ||
                data?.data?.answer ||
                data?.data?.response ||
                data?.message ||
                "❌ الرد طلع فاضي من الـ API";

            // 📩 إرسال الرد
            await sock.sendMessage(chatId, {
                text: `🤖 لوسيفر:\n${reply}`
            }, { quoted: message });

        } catch (err) {
            console.error("AI Error:", err);

            await sock.sendMessage(message.key.remoteJid, {
                text: "❌ حصل خطأ في الذكاء الاصطناعي"
            }, { quoted: message });
        }
    }
};