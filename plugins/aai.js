const axios = require("axios");

module.exports = {
    name: "بوت",
    aliases: ["ai", "chat", "ذكاء"],
    category: "اوامـࢪ الـAi",
    description: "تفاعل مع ذكاء اصطناعي Kimi",
    usage: ".كيمي <السؤال>",

    async execute(client, message, args) {
        try {
            const chatId = message.from;
            const text = args.join(" ");

            if (!text) {
                return message.reply("❌ اكتب كلامك أو سؤالك يا كينج");
            }

            await client.sendMessage(chatId, {
                react: { text: "🧠", key: message.key }
            });

            // رابط الـ API
            const apiUrl = `https://api.qasimdev.dpdns.org/api/kimi/ai?apikey=qasim-dev&prompt=${encodeURIComponent(text)}`;

            const { data } = await axios.get(apiUrl);

            if (!data || !data.success) {
                return message.reply("❌ حصل مشكلة في الـ AI، جرب تاني");
            }

            const reply = data.result || "🤖 لا أعرف الرد على ده";

            // نبعت الرد
            await client.sendMessage(chatId, { text: `بوت 🤖 : ${reply}` }, { quoted: message });

        } catch (err) {
            console.error(err);
            message.reply("❌ حصل خطأ غير متوقع");
        }
    }
};