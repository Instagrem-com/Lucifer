const axios = require('axios')
const { igdl } = require('ruhend-scraper')
const processed = new Set()

// دالة للتأكد من نوع الميديا الحقيقي (فيديو أم صورة)
async function getMediaType(url) {
  try {
    const res = await axios.head(url, { timeout: 5000 });
    const contentType = res.headers['content-type'];
    if (contentType.includes('video')) return 'video';
    if (contentType.includes('image')) return 'image';
    return null;
  } catch {
    return null;
  }
}

function uniqueMedia(arr = []) {
  const seen = new Set()
  return arr.filter(m => {
    if (!m?.url || seen.has(m.url)) return false
    seen.add(m.url)
    return true
  })
}

module.exports = {
  command: 'انستا',
  aliases: ['ig', 'انستجرام', 'insta'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'تحميل من إنستجرام 🔥 Reels | Posts | Stories',
  usage: '.انستا <رابط>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid
    const text = args.join(" ")

    try {
      if (processed.has(message.key.id)) return
      processed.add(message.key.id)
      setTimeout(() => processed.delete(message.key.id), 300000)

      if (!text) return sock.sendMessage(chatId, {
        text: 'طريقة الاستخدام:\n.انستا <رابط البوست أو الريلز أو الستوري>'
      }, { quoted: message })

      if (!/instagram\.com|instagr\.am/i.test(text)) return sock.sendMessage(chatId, {
        text: 'الرابط مش صحيح 👀'
      }, { quoted: message })

      await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } })

      let media = []

      // المحاولة الأولى: ruhend-scraper
      try {
        const res = await igdl(text)
        if (res?.data?.length) {
          res.data.forEach(m => media.push({ url: m.url, type: m.type }))
        }
      } catch { }

      // المحاولة الثانية: vreden API
      if (!media.length) {
        try {
          const api = `https://api.vreden.my.id/api/igdl?url=${encodeURIComponent(text)}`
          const r = await axios.get(api)
          const result = r?.data?.result
          if (result) {
            if (result.video) media.push({ url: result.video, type: 'video' })
            if (Array.isArray(result.images)) result.images.forEach(img => {
              media.push({ url: img, type: 'image' })
            })
          }
        } catch { }
      }

      // تنظيف القائمة والتأكد من الروابط
      media = uniqueMedia(media).filter(m => m.url)
      if (!media.length) throw new Error("No media found")

      media = media.slice(0, 20)

      for (const m of media) {
        // الفحص الذكي لنوع الملف
        let actualType = await getMediaType(m.url);
        
        // لو الفحص فشل، نعتمد على النوع اللي جاي من الـ API أو الامتداد كخطة بديلة
        if (!actualType) {
          actualType = (m.type === 'video' || /\.(mp4|mov|webm|m4v)$/i.test(m.url)) ? 'video' : 'image';
        }

        if (actualType === 'video') {
          await sock.sendMessage(chatId, {
            video: { url: m.url },
            mimetype: 'video/mp4',
            caption: 'تم تحميل الفيديو بنجاح 🔥💀\n*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪'
          }, { quoted: message })
        } else {
          await sock.sendMessage(chatId, {
            image: { url: m.url },
            caption: 'تم تحميل الصورة بنجاح 🔥💀\n*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪'
          }, { quoted: message })
        }

        await new Promise(r => setTimeout(r, 1500)) // تأخير بسيط لتجنب الحظر
      }

      await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } })

    } catch (err) {
      console.log("IG error:", err)
      await sock.sendMessage(chatId, {
        text: 'عذراً، تعذر تحميل الميديا. تأكد أن الحساب عام (Public) وأن الرابط صحيح.'
      }, { quoted: message })
    }
  }
}