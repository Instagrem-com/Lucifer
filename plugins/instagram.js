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
  description: 'تحميل من إنستجرام',
  usage: '.انستا <رابط>',

  async handler(sock,message,args,context={}){

    const chatId = context.chatId || message.key.remoteJid
    const text = args.join(" ")

    try{

      if(processed.has(message.key.id)) return
      processed.add(message.key.id)
      setTimeout(()=>processed.delete(message.key.id),300000)

      if(!text){
        return sock.sendMessage(chatId,{
          text:'طريقة الاستخدام:\n.انستا <رابط البوست>'
        },{quoted:message})
      }

      if(!/instagram\.com|instagr\.am/i.test(text)){
        return sock.sendMessage(chatId,{
          text:'الرابط مش صحيح 👀'
        },{quoted:message})
      }

      await sock.sendMessage(chatId,{
        react:{text:'🔄',key:message.key}
      })

      let media = []

      /*
      ========================
      METHOD 1 (ruhend)
      ========================
      */

      try{

        const res = await igdl(text)

        if(res?.data?.length){
          media = uniqueMedia(res.data)
        }

      }catch{}

      /*
      ========================
      METHOD 2 (API backup)
      ========================
      */

      if(!media.length){

        try{

          const api = `https://api.vreden.my.id/api/igdl?url=${encodeURIComponent(text)}`

          const r = await axios.get(api)

          const result = r?.data?.result

          if(result){

            if(result.video){
              media.push({url:result.video,type:'video'})
            }

            if(Array.isArray(result.images)){
              result.images.forEach(img=>{
                media.push({url:img,type:'image'})
              })
            }

          }

        }catch{}

      }

      if(!media.length){
        throw new Error("No media found")
      }

      media = media.slice(0,20)

      for(const m of media){

        const isVideo =
        m.type === 'video' ||
        /\.(mp4|mov|webm)$/i.test(m.url)

        if(isVideo){

          await sock.sendMessage(chatId,{
            video:{url:m.url},
            mimetype:'video/mp4',
            caption:'الفيديو اتحمل 👀❤️\n\n*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪'
          },{quoted:message})

        }else{

          await sock.sendMessage(chatId,{
            image:{url:m.url},
            caption:'الصورة اتحملت 👀❤️\n\n*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪'
          },{quoted:message})

        }

        await new Promise(r=>setTimeout(r,700))

      }

    }catch(err){

      console.log("IG error:",err)

      await sock.sendMessage(chatId,{
        text:'ملقتش الميديا ممكن يكون الحساب برايفت 👀'
      },{quoted:message})

    }

  }
}