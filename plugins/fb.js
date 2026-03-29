const axios = require("axios")

module.exports = {
  command: "فيسبوك",
  aliases: ["fb","fbdl","fbpro"],
  category: "اوامـࢪ الـتـحـمـيـل",
  description: "تحميل فيديوهات فيسبوك (نسخة برو)",
  usage: ".فيسبوك <رابط>",

  async handler(sock, m, args) {

    if (!args[0]) {
      return m.reply("هات لينك فيسبوك يا علـق 😂")
    }

    const url = args[0]
    let video = null

    try {
      m.reply("⏳ بحاول أجيب الفيديو بأعلى جودة...")

      // API 1 🔥
      try {
        const r1 = await axios.get(`https://api.akuari.my.id/downloader/fb?link=${url}`)
        video = r1.data.respon?.hd || r1.data.respon?.sd
      } catch {}

      // API 2 🔥
      if (!video) {
        try {
          const r2 = await axios.get(`https://vihangayt.me/download/fb?url=${url}`)
          video = r2.data.data?.hd || r2.data.data?.sd
        } catch {}
      }

      // API 3 🔥
      if (!video) {
        try {
          const r3 = await axios.get(`https://xzn.wtf/api/fbdl?url=${url}`)
          video = r3.data.result?.url
        } catch {}
      }

      // API 4 🔥 (قوي)
      if (!video) {
        try {
          const r4 = await axios.get(`https://api.betabotz.eu.org/api/download/fbdown?url=${url}`)
          video = r4.data.result?.HD || r4.data.result?.SD
        } catch {}
      }

      if (!video) {
        return m.reply("💀 الفيديو ده مش راضي يتحمل\nيا إما خاص أو السيرفرات نايمة")
      }

      await sock.sendMessage(m.chat, {
        video: { url: video },
        caption: "⚡ تم التحميل بنجاح 😎🔥\n\n✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪"
      }, { quoted: m })

    } catch (err) {
      console.log(err)
      m.reply("❌ حصلت مشكله جامده ف التحميل")
    }

  }
}