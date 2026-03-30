const axios = require("axios")

module.exports = {
  command: "صوره",
  aliases: ["صور","img"],
  category: "اوامـࢪ الاداوات",
  description: "بحث صور HD 🔥",

  async handler(sock, message, args) {

    const chatId = message.key.remoteJid
    const query = args.join(" ")

    if (!query) {
      return sock.sendMessage(chatId, {
        text: "📸 اكتب اسم الصورة\nمثال: .صوره قطة"
      }, { quoted: message })
    }

    try {

      await sock.sendMessage(chatId, {
        text: `🔎 بدور على صور HD لـ "${query}" ...`
      }, { quoted: message })

      // 🔥 سحب الصور من Bing (HD)
      const res = await axios.get(
        `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&FORM=HDRSC2`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        }
      )

      const matches = [...res.data.matchAll(/murl&quot;:&quot;(.*?)&quot;/g)]

      let images = matches.map(m => m[1]).filter(Boolean)

      // تنظيف الصور الضعيفة
      images = images.filter(url =>
        url.startsWith("http") &&
        !url.includes("logo") &&
        !url.includes("icon")
      )

      images = images.slice(0, 5)

      if (!images.length) {
        return sock.sendMessage(chatId, {
          text: "💀 ملقتش صور"
        }, { quoted: message })
      }

      for (let i = 0; i < images.length; i++) {

        await sock.sendMessage(chatId, {
          image: { url: images[i] },
          caption: `🖼️ صورة ${i+1} لـ "${query}"\n\n✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`
        }, { quoted: message })

        await new Promise(r => setTimeout(r, 700))
      }

    } catch (err) {
      console.log(err)
      sock.sendMessage(chatId, {
        text: "❌ حصل مشكلة في البحث"
      }, { quoted: message })
    }

  }
}