const axios = require("axios");

module.exports = {
    command: "سكرين",
    aliases: ["screenshot", "ss"],
    category: "اوامـࢪ الاداوات",
    description: "تصوير موقع",

    async handler(client, message, args) {
        try {
            if (!args[0]) return message.reply("❌ اكتب لينك الموقع يا كينج");

            let url = args[0];
            let api = `https://api.qasimdev.dpdns.org/api/screenshot/take?url=${encodeURIComponent(url)}&apikey=qasim-dev`;

            let { data } = await axios.get(api);

            if (!data.success) return message.reply("❌ حصل خطأ في السحب");

            let img = data.data.screenshotUrl;

            await client.sendMessage(message.from, {
                image: { url: img },
                caption: `📸 سكرين شوت للموقع\n\n🔗 ${url}`
            }, { quoted: message });

        } catch (err) {
            console.log(err);
            message.reply("❌ في مشكلة حصلت");
        }
    }
};