const axios = require('axios')
const { igdl } = require('ruhend-scraper')
const processed = new Set()

function uniqueMedia(arr = []) {
  const seen = new Set()
  return arr.filter(m=>{
    if(!m?.url || seen.has(m.url)) return false
    seen.add(m.url)
    return true
  })
}

module.exports = {
  command: 'انستا',
  aliases: ['ig','انستجرام','insta'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'تحميل من إنستجرام 🔥 Reels | Posts | Stories',
  usage: '.انستا <رابط>',
  
  async handler(sock,message,args,context={}){
    const chatId = context.chatId || message.key.remoteJid
    const text = args.join(" ")

    try {
      if(processed.has(message.key.id)) return
      processed.add(message.key.id)
      setTimeout(()=>processed.delete(message.key.id),300000)

      if(!text) return sock.sendMessage(chatId,{
        text:'طريقة الاستخدام:\n.انستا <رابط البوست أو الريلز أو الستوري>'
      },{quoted:message})

      if(!/instagram\.com|instagr\.am/i.test(text)) return sock.sendMessage(chatId,{
        text:'الرابط مش صحيح 👀'
      },{quoted:message})

      await sock.sendMessage(chatId,{ react:{ text:'🔄', key:message.key } })

      let media = []

      // =======================
      // METHOD 1: ruhend-scraper
      // =======================
      try{
        const res = await igdl(text)
        if(res?.data?.length) media = uniqueMedia(res.data)
      }catch{}

      // =======================
      // METHOD 2: vreden API
      // =======================
      if(!media.length){
        try{
          const api = `https://api.vreden.my.id/api/igdl?url=${encodeURIComponent(text)}`
          const r = await axios.get(api)
          const result = r?.data?.result
          if(result){
            if(result.video) media.push({url:result.video,type:'video'})
            if(Array.isArray(result.images)) result.images.forEach(img=>{
              media.push({url:img,type:'image'})
            })
          }
        }catch{}
      }

      // =======================
      // METHOD 3: Neoxr API
      // =======================
      if(!media.length){
        try{
          const api = `https://api.neoxr.eu/api/ig?url=${encodeURIComponent(text)}`
          const r = await axios.get(api)
          const result = r?.data?.data
          if(Array.isArray(result)){
            result.forEach(m=>{
              media.push({url:m.url,type:m.type})
            })
          }
        }catch{}
      }

      // =======================
      // فحص نهائي
      // =======================
      media = uniqueMedia(media).filter(m=>m.url)
      if(!media.length) throw new Error("No media found")

      media = media.slice(0,20)

      for(const m of media){
        const isVideo = m.type==='video' || /\.(mp4|mov|webm)$/i.test(m.url)

        if(isVideo){
          await sock.sendMessage(chatId,{
            video:{url:m.url},
            mimetype:'video/mp4',
            caption:'الفيديو اتحمل 🔥💀\n*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪'
          },{quoted:message})
        }else{
          await sock.sendMessage(chatId,{
            image:{url:m.url},
            caption:'الصورة اتحملت 🔥💀\n*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪'
          },{quoted:message})
        }

        await new Promise(r=>setTimeout(r,700))
      }

    }catch(err){
      console.log("IG error:",err)
      await sock.sendMessage(chatId,{
        text:'ملقتش الميديا ممكن يكون الحساب برايفت أو الرابط غلط 👀'
      },{quoted:message})
    }
  }
        }
