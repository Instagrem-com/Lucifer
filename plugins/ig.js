const axios = require("axios")
const { igdl } = require("ruhend-scraper")

const processedMessages = new Set()

function extractUniqueMedia(mediaData = []) {
  const seen = new Set()
  return mediaData.filter(m => {
    if (!m?.url || seen.has(m.url)) return false
    seen.add(m.url)
    return true
  })
}

module.exports = {
  command: 'انستا',
  aliases: ['ig', 'igdl', 'insta'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'تحميل من انستجرام (نسخة برو)',
  usage: '.انستا <لينك>',

  async handler(sock, message, args) {

    const chatId = message.key.remoteJid
    const text = args.join(' ')

    if (!text) {
      return sock.sendMessage(chatId, {
        text: "هات لينك انستا يا علـق 😂"
      }, { quoted: message })
    }

    if (processedMessages.has(message.key.id)) return
    processedMessages.add(message.key.id)
    setTimeout(() => processedMessages.delete(message.key.id), 300000)

    await sock.sendMessage(chatId, {
      react: { text: '⏳', key: message.key }
    })

    let mediaList = []

    try {

      // 🔥 الطريقة 1 (ruhend)
      try {
        const res = await igdl(text)
        mediaList = extractUniqueMedia(res.data)
      } catch {}

      // 🔥 الطريقة 2 (API)
      if (!mediaList.length) {
        try {
          const r2 = await axios.get(`https://api.akuari.my.id/downloader/ig?link=${text}`)
          mediaList = r2.data.respon.map(v => ({
            url: v.url,
            type: v.type
          }))
        } catch {}
      }

      // 🔥 الطريقة 3
      if (!mediaList.length) {
        try {
          const r3 = await axios.get(`https://vihangayt.me/download/instagram?url=${text}`)
          mediaList = r3.data.data.map(v => ({
            url: v.url,
            type: v.type
          }))
        } catch {}
      }

      // 🔥 الطريقة 4 (قوية)
      if (!mediaList.length) {
        try {
          const r4 = await axios.get(`https://xzn.wtf/api/igdl?url=${text}`)
          mediaList = [{
            url: r4.data.result.url,
            type: "video"
          }]
        } catch {}
      }

      if (!mediaList.length) {
        return sock.sendMessage(chatId, {
          text: "💀 اللينك ده مش راضي يتحمل\nيا خاص يا السيرفرات نايمة"
        }, { quoted: message })
      }

      // إرسال الميديا
      for (let i = 0; i < mediaList.length; i++) {

        const media = mediaList[i]
        const url = media.url

        const isVideo =
          media.type === "video" ||
          /\.(mp4|mov|webm)$/i.test(url)

        if (isVideo) {
          await sock.sendMessage(chatId, {
            video: { url },
            caption: "🔥 تم التحميل يا معلم\n\n✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪"
          }, { quoted: message })
        } else {
          await sock.sendMessage(chatId, {
            image: { url },
            caption: "🔥 تم التحميل يا معلم\n\n✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪"
          }, { quoted: message })
        }

        await new Promise(r => setTimeout(r, 1200))
      }

    } catch (err) {
      console.log(err)
      sock.sendMessage(chatId, {
        text: "❌ حصلت مشكلة ف التحميل"
      }, { quoted: message })
    }

  }
}