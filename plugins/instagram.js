const axios = require("axios")

module.exports = {
command: "انستا",
aliases: ["ig","instagram","insta"],
category: "اوامـࢪ الـتـحـمـيـل",
description: "تحميل من انستجرام",
usage: ".انستا <الرابط>",

async handler(sock,message,args,context={}){

const chatId = context.chatId || message.key.remoteJid

const url =
args.join(" ") ||
message.message?.conversation ||
message.message?.extendedTextMessage?.text

if(!url){
return sock.sendMessage(chatId,{
text:"⚠️ ابعت رابط بوست من انستجرام"
},{quoted:message})
}

if(!/instagram\.com/i.test(url)){
return sock.sendMessage(chatId,{
text:"❌ الرابط لازم يكون من انستجرام"
},{quoted:message})
}

try{

await sock.sendMessage(chatId,{
react:{text:"⏳",key:message.key}
})

const api = `https://api.davidcyriltech.my.id/instagram?url=${encodeURIComponent(url)}`

const {data} = await axios.get(api)

if(!data?.success || !data?.downloadUrl){
throw "no media"
}

await sock.sendMessage(chatId,{
video:{url:data.downloadUrl},
mimetype:"video/mp4",
caption:"📥 *Powered by Lucifer Bot*"
},{quoted:message})

await sock.sendMessage(chatId,{
react:{text:"✅",key:message.key}
})

}catch(err){

console.log("Instagram Downloader Error:",err)

await sock.sendMessage(chatId,{
text:"❌ حصل خطأ أثناء تحميل الفيديو"
},{quoted:message})

}

}
}