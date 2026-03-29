const axios = require('axios');

const AXIOS_DEFAULTS = {
  timeout: 60000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json, text/plain, */*'
  }
};

module.exports = {
  command: 'فيسبوك',
  aliases: ['fb','fbdl'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'تحميل فيديوهات فيسبوك',
  usage: '.فيسبوك <رابط فيديو فيسبوك>',

  async handler(sock, message, args, context = {}) {

    const chatId = context.chatId || message.key.remoteJid
    const url = args.join(" ")

    try {

      if (!url) {
        return await sock.sendMessage(chatId,{
          text:'💻 *تحميل فيديو من فيسبوك* 💻\n\nالاستخدام:\n.فيسبوك <رابط>'
        },{quoted:message})
      }

      if (!/facebook\.com|fb\.watch/i.test(url)) {
        return await sock.sendMessage(chatId,{
          text:'الرابط غير صالح 👀'
        },{quoted:message})
      }

      await sock.sendMessage(chatId,{
        react:{ text:'🔄', key:message.key }
      })

      let videoUrl = null
      let quality = "غير معروفة"

      /*
      ========================
      ✅ API QASIM (أساسي)
      ========================
      */

      try {

        const apiQasim = `https://api.qasimdev.dpdns.org/api/facebook/download?url=${encodeURIComponent(url)}&apikey=qasim-dev`

        const res = await axios.get(apiQasim, AXIOS_DEFAULTS)

        const data = res?.data

        if (data?.data?.length) {

          const vids = data.data

          // نختار أعلى جودة
          const sorted = vids.sort((a,b)=>{
            const qa = parseInt(a.quality)||0
            const qb = parseInt(b.quality)||0
            return qb-qa
          })

          const selected = sorted.find(v=>v.url) || sorted[0]

          videoUrl = selected.url
          quality = selected.quality || quality

        }

      } catch (e) {
        console.log('Qasim API Failed');
      }

      /*
      ========================
      🔁 API 1 (backup)
      ========================
      */

      if (!videoUrl) {

        try {

          const api1 = `https://gtech-api-xtp1.onrender.com/api/download/fb?url=${encodeURIComponent(url)}&apikey=APIKEY`

          const res1 = await axios.get(api1,AXIOS_DEFAULTS)

          const vids = res1?.data?.data?.data

          if (Array.isArray(vids) && vids.length) {

            const sorted = vids.sort((a,b)=>{
              const qa = parseInt(a.resolution)||0
              const qb = parseInt(b.resolution)||0
              return qb-qa
            })

            const selected = sorted.find(v=>v.url) || sorted[0]

            videoUrl = selected.url
            quality = selected.resolution || quality

          }

        } catch {}

      }

      /*
      ========================
      🔁 API 2 (backup)
      ========================
      */

      if (!videoUrl) {

        try {

          const api2 = `https://api.vreden.my.id/api/fbdl?url=${encodeURIComponent(url)}`

          const res2 = await axios.get(api2,AXIOS_DEFAULTS)

          const vid = res2?.data?.result?.urls?.[0]

          if (vid?.hd || vid?.sd) {

            videoUrl = vid.hd || vid.sd
            quality = vid.hd ? "HD" : "SD"

          }

        } catch {}

      }

      /*
      ========================
      ❌ لو كله فشل
      ========================
      */

      if (!videoUrl) {
        throw new Error("All APIs failed")
      }

      const caption =
`🥂 *الفيديو يا حب* 🥂

الجودة 💻 : *${quality}*

> *BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`

      await sock.sendMessage(chatId,{
        video:{ url:videoUrl },
        mimetype:'video/mp4',
        caption
      },{quoted:message})

    } catch(err) {

      console.log(err)

      await sock.sendMessage(chatId,{
        text:'❌ فشل تحميل الفيديو. جرب رابط تاني 😄'
      },{quoted:message})

    }

  }
}