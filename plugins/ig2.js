const axios = require("axios")

module.exports = {
  command: "انستا",
  aliases: ["ig", "insta", "igdl"],
  category: "اوامـࢪ الـتـحـمـيـل",
  description: "تحميل كل حاجة من انستجرام 🔥",
  usage: ".انستا <لينك>",

  async handler(sock, m, args) {

    if (!args[0]) {
      return m.reply("هات لينك انستا يا علـق 😂")
    }

    const url = args[0]
    let mediaList = []

    try {
      m.reply("⏳ بحاول أجيب الميديا...")

      // 🔥 API 1 (خفيف وسريع)
      try {
        const r1 = await axios.get(`https://api.akuari.my.id/downloader/ig?link=${url}`)
        mediaList = r1.data.respon.map(v => ({
          url: v.url,
          type: v.type
        }))
      } catch {}

      // 🔥 API 2
      if (!mediaList.length) {
        try {
          const r2 = await axios.get(`https://vihangayt.me/download/instagram?url=${url}`)
          mediaList = r2.data.data.map(v => ({
            url: v.url,
            type: v.type
          }))
        } catch {}
      }

      // 🔥 API 3 (fallback سريع)
      if (!mediaList.length) {
        try {
          const r3 = await axios.get(`https://xzn.wtf/api/igdl?url=${url}`)
          mediaList = [{
            url: r3.data.result.url,
            type: "video"
          }]
        } catch {}
      }

      if (!mediaList.length) {
        return m.reply("💀 اللينك مش شغال أو خاص")
      }

      // إرسال الميديا
      for (let i = 0; i < mediaList.length; i++) {

        const media = mediaList[i]
        const isVideo =
          media.type === "video" ||
          media.url.includes(".mp4")

        if (isVideo) {
          await sock.sendMessage(m.chat, {
            video: { url: media.url },
            caption: "🔥 تم التحميل\n\n✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪"
          }, { quoted: m })
        } else {
          await sock.sendMessage(m.chat, {
            image: { url: media.url },
            caption: "🔥 تم التحميل\n\n✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪"
          }, { quoted: m })
        }

        // delay بسيط عشان متحظرش
        await new Promise(r => setTimeout(r, 800))
      }

    } catch (err) {
      console.log(err)
      m.reply("❌ حصلت مشكلة ف التحميل")
    }

  }
}