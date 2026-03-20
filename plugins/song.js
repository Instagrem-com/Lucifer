const axios = require('axios')
const yts = require('yt-search')

const DL_API = 'https://api.qasimdev.dpdns.org/api/loaderto/download'
const API_KEY = 'xbps-install-Syu'

const wait = (ms) => new Promise(r => setTimeout(r, ms))

const downloadWithRetry = async (url, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const { data } = await axios.get(DL_API, {
                params: { apiKey: API_KEY, format: 'mp3', url },
                timeout: 90000
            })

            if (data?.data?.downloadUrl)
                return data.data

            throw new Error('No download URL')
        } catch (err) {
            if (i === retries - 1) throw err
            console.log(`Retry ${i + 1}...`)
            await wait(5000)
        }
    }
}

module.exports = {
    command: 'اغنيه_2',
    aliases: ['music', 'audio', 'mp3'],
    category: 'اوامـࢪ الـتـحـمـيـل',
    description: 'Download song from YouTube (MP3)',
    usage: '.song <song name | youtube link>',

    async handler(sock, message, args, context) {

        const chatId = context?.chatId || message.key.remoteJid
        const query = args.join(' ').trim()

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: '🎵 اكتب اسم الاغنية'
            }, { quoted: message })
        }

        try {

            let video

            if (query.includes('youtube.com') || query.includes('youtu.be')) {
                video = { url: query }
            } else {
                const { videos } = await yts(query)
                if (!videos?.length) {
                    return await sock.sendMessage(chatId, {
                        text: '❌ مفيش نتائج'
                    }, { quoted: message })
                }
                video = videos[0]
            }

            const audio = await downloadWithRetry(video.url)

            await sock.sendMessage(chatId, {
                audio: { url: audio.downloadUrl },
                mimetype: 'audio/mpeg',
                fileName: `${audio.title || 'song'}.mp3`
            }, { quoted: message })

        } catch (err) {
            console.log(err)
            await sock.sendMessage(chatId, {
                text: '❌ حصل خطأ في التحميل'
            }, { quoted: message })
        }
    }
}