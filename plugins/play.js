const yts = require('yt-search')
const axios = require('axios')

const API = 'https://api.qasimdev.dpdns.org/api/loaderto/download'
const API_KEY = 'qasim-dev'

module.exports = {
  command: 'اغنيه',
  aliases: ['اغنية', 'play', 'music'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'ابحث عن اغنية من يوتيوب وحملها MP3',
  usage: '.تشغيل <اسم الاغنية>',

  async handler(sock, message, args, context = {}) {

    const chatId = context.chatId || message.key.remoteJid
    const query = args.join(' ').trim()

    if (!query) {
      return sock.sendMessage(chatId, {
        text: `🎧 *اكتب اسم الاغنية* 🎧\n\nمثال 📝👇🏼 :\n.اغنيه اتنسيت`
      }, { quoted: message })
    }

    try {

      await sock.sendMessage(chatId, {
        text: ' * ويـيــت بدور على الاغنية...🔎*'
      }, { quoted: message })

      const search = await yts(query)

      if (!search.videos.length) {
        return sock.sendMessage(chatId, {
          text: '*ملقتش اي اغنية بالاسم دا.😄❤️*'
        }, { quoted: message })
      }

      const video = search.videos[0]

      await sock.sendMessage(chatId, {
        text:
`⚡ الاغنيه اتحميل ⚡

🎵 ${video.title}
⏱️ ${video.timestamp}
👤 ${video.author.name}

*جاري التحميل...⏳*

*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`
      }, { quoted: message })

      const { data } = await axios.get(API, {
        params: {
          apiKey: API_KEY,
          format: 'mp3',
          url: video.url
        },
        timeout: 90000
      })

      if (!data?.data?.downloadUrl) {
        throw new Error('No download url')
      }

      const song = data.data

      const thumb = await axios.get(video.thumbnail, {
        responseType: 'arraybuffer'
      })

      const thumbnail = Buffer.from(thumb.data)

      await sock.sendMessage(chatId, {
        audio: { url: song.downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${song.title}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: song.title,
            body: `${video.author.name} • ${video.timestamp}`,
            thumbnail: thumbnail,
            mediaType: 2,
            sourceUrl: video.url
          }
        }
      }, { quoted: message })

    } catch (err) {

      console.error('Play error:', err)

      await sock.sendMessage(chatId, {
        text: `❌ *حصل خطأ أثناء تحميل الاغنية*\n\n${err.message}`
      }, { quoted: message })

    }
  }
}