const axios = require('axios')

const AXIOS_DEFAULTS = {
  timeout: 60000,
  headers: {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'application/json'
  }
}

// تحويل روابط fb.watch و share
async function normalizeFacebookUrl(url) {
  try {

    if (url.includes("fb.watch")) {
      const res = await axios.get(url)
      const match = res.request?.res?.responseUrl
      if (match) return match
    }

    if (url.includes("facebook.com/share")) {
      const res = await axios.get(url)
      const real = res.request?.res?.responseUrl
      if (real) return real
    }

    return url

  } catch {
    return url
  }
}

// جلب الفيديو من عدة APIs
async function getFacebookVideo(url) {

  const apis = [

`https://gtech-api-xtp1.onrender.com/api/download/fb?url=${encodeURIComponent(url)}&apikey=APIKEY`,

`https://api.vreden.my.id/api/fbdl?url=${encodeURIComponent(url)}`,

`https://api.agatz.xyz/api/fbdl?url=${encodeURIComponent(url)}`

]

  for (let api of apis) {

    try {

      const res = await axios.get(api, AXIOS_DEFAULTS)

      // API 1
      if(res?.data?.data?.data){
        let videos = res.data.data.data

        let sorted = videos.sort((a,b)=>{
          const qa = parseInt(a.resolution) || 0
          const qb = parseInt(b.resolution) || 0
          return qb - qa
        })

        return sorted[0].url
      }

      // API 2
      if(res?.data?.result?.url){
        return res.data.result.url
      }

      // API 3
      if(res?.data?.data?.url){
        return res.data.data.url
      }

    } catch {}

  }

  return null
}

module.exports = {

command: 'فيسبوك',
aliases: ['fb','fbdl'],
category: 'اوامـࢪ الـتـحـمـيـل',
description: 'تحميل فيديو من فيسبوك',

async handler(sock, message, args, context={}) {

  const chatId = context.chatId || message.key.remoteJid

  const url =
  args.join(' ') ||
  message.message?.conversation ||
  message.message?.extendedTextMessage?.text

  if(!url){
    return sock.sendMessage(chatId,{text:"📘 ابعت رابط فيديو فيسبوك"}, {quoted:message})
  }

  if(!/facebook\.com|fb\.watch/i.test(url)){
    return sock.sendMessage(chatId,{text:"❌ الرابط مش من فيسبوك"}, {quoted:message})
  }

  try{

    await sock.sendMessage(chatId,{
      react:{text:"⏳",key:message.key}
    })

    const fixedUrl = await normalizeFacebookUrl(url)

    const videoUrl = await getFacebookVideo(fixedUrl)

    if(!videoUrl){
      throw "No video"
    }

    await sock.sendMessage(chatId,{
      video:{url:videoUrl},
      mimetype:"video/mp4",
      caption:`📘 *Facebook Downloader*

> تم التحميل بنجاح ⚡`
    },{quoted:message})

  }catch(e){

    await sock.sendMessage(chatId,{
      text:"❌ فشل تحميل الفيديو حاول تاني"
    },{quoted:message})

  }

}

}