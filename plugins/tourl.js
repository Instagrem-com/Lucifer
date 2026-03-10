const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const axios = require('axios')
const FormData = require('form-data')
const FileType = require('file-type')

async function getMediaBuffer(msg, sock) {
  return await downloadMediaMessage(
    msg,
    'buffer',
    {},
    {
      logger: sock.logger,
      reuploadRequest: sock.updateMediaMessage
    }
  )
}

function getQuotedMessage(message) {
  const ctx = message.message?.extendedTextMessage?.contextInfo
  if (!ctx?.quotedMessage) return null

  return {
    key: {
      remoteJid: message.key.remoteJid,
      fromMe: false,
      id: ctx.stanzaId,
      participant: ctx.participant
    },
    message: ctx.quotedMessage
  }
}

module.exports = {
  command: 'صوره_فيديو_لرابط', // الاسم بالعربي
  aliases: ['mediaurl', 'upload', 'تورل'],
  category: 'اوامـࢪ الاداوات',
  description: 'ارفع الوسائط واحصل على رابط مباشر',
  usage: '.رفع_رابط (رد على وسائط أو أرسل وسائط مع الكابتشن)',

  async handler(sock, message) {
    const chatId = message.key.remoteJid

    try {
      let targetMsg = null

      if (
        message.message?.imageMessage ||
        message.message?.videoMessage ||
        message.message?.audioMessage ||
        message.message?.stickerMessage ||
        message.message?.documentMessage
      ) {
        targetMsg = message
      }
      if (!targetMsg) {
        const quoted = getQuotedMessage(message)
        if (quoted) targetMsg = quoted
      }
      if (!targetMsg) {
        return sock.sendMessage(
          chatId,
          { text: '❌ من فضلك قم بالرد على وسائط أو أرسل وسائط مع `.رفع_رابط`' },
          { quoted: message }
        )
      }

      const buffer = await getMediaBuffer(targetMsg, sock)
      if (!buffer) throw new Error('فشل في تحميل الوسائط')

      if (buffer.length > 10 * 1024 * 1024) {
        return sock.sendMessage(
          chatId,
          { text: '✴️ حجم الوسائط يتجاوز 10 ميجابايت.' },
          { quoted: message }
        )
      }

      const type = await FileType.fromBuffer(buffer)
      if (!type) throw new Error('تعذر التعرف على نوع الملف')

      const form = new FormData()
      form.append('reqtype', 'fileupload')
      form.append('fileToUpload', buffer, `upload.${type.ext}`)

      const res = await axios.post(
        'https://catbox.moe/user/api.php',
        form,
        { headers: form.getHeaders() }
      )

      const url = res.data
      if (typeof url !== 'string' || !url.startsWith('https://')) {
        throw new Error('الرابط المرفوع غير صالح')
      }

      const sizeMB = (buffer.length / 1024 / 1024).toFixed(2)

      await sock.sendMessage(
        chatId,
        { text: `✅ تم رفع الوسائط بنجاح ✅\n🔗 الرابط المباشر :\n${url}\n💾 الحجم : ${sizeMB} MB` },
        { quoted: message }
      )

    } catch (e) {
      console.error('خطأ في رفع Catbox:', e)
      await sock.sendMessage(
        chatId,
        { text: `❌ فشل رفع الوسائط: ${e.message}` },
        { quoted: message }
      )
    }
  }
}