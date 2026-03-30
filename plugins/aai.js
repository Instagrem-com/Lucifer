const axios = require("axios");

module.exports = {
    command: "كيمي",
    aliases: ["ai", "chat", "ذكاء"],
    category: "ذكاء اصطناعي",
    description: "تفاعل مع ذكاء اصطناعي Kimi",
    usage: ".كيمي <السؤال>",

    async handler(client, message, args) {
        try {
            const chatId = message.from;
            const text = args.join(" ");

            if (!text) return message.reply("❌ اكتب كلامك أو سؤالك يا كينج");

            await client.sendMessage(chatId, { react: { text: "🧠", key: message.key } });

            const apiUrl = `https://api.qasimdev.dpdns.org/api/kimi/ai?apikey=qasim-dev&prompt=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl);

            const reply = data?.success ? (data.result || "🤖 لا أعرف الرد على ده") : "❌ حصل مشكلة في الـ AI، جرب تاني";

            await client.sendMessage(chatId, { text: `بوت 🤖 : ${reply}` }, { quoted: message });

        } catch (err) {
            console.error(err);
            message.reply("❌ حصل خطأ غير متوقع");
        }
    }
};