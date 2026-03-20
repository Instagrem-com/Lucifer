const axios = require("axios")

module.exports = {
  command: "فيسبوك",
  aliases: ["fb","fbdl"],
  category: "اوامـࢪ الـتـحـمـيـل",
  description: "تحميل فيديو من فيسبوك",
  usage: ".فيسبوك <رابط>",

  async handler(sock, m, args) {

    if (!args[0]) {
      return await sock.sendMessage(m.chat, {
        text: "ابعت رابط فيديو فيسبوك يا علـق 😂"
      }, { quoted: m })
    }

    const url = args[0]

    try {

      await sock.sendMessage(m.chat, {
        text: "⏳ جارِ تحميل الفيديو..."
      }, { quoted: m })

      let video

      try {
        const res = await axios.get(`https://arslan-apis.vercel.app/download/fbdown?url=${url}`)
        video = res.data.data?.hd || res.data.data?.sd
      } catch {}

      if (!video) {
        const res2 = await axios.get(`https://apiskeith.top/download/fbdown?url=${url}`)
        video = res2.data.result?.url || res2.data.result?.sd
      }

      if (!video) {
        return await sock.sendMessage(m.chat, {
          text: "مقدرتش احمل الفيديو 🙂"
        }, { quoted: m })
      }

      await sock.sendMessage(m.chat, {
        video: { url: video },
        caption: "⚡ جبتلك الفيديو ياحب ⚡\n\n *BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪"
      }, { quoted: m })

    } catch (err) {
      console.log(err)
      await sock.sendMessage(m.chat, {
        text: "❌ حصل خطأ في التحميل"
      }, { quoted: m })
    }

  }
}