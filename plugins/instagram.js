const axios = require("axios")

module.exports = {
command: "انستا",
aliases: ["ig","insta","igdl"],
category: "اوامـࢪ الـتـحـمـيـل",
description: "تحميل من انستجرام",
usage: ".انستا <رابط>",

async handler(sock,message,args,context={}){

const chatId = context.chatId || message.key.remoteJid
const url = args.join(" ")

if(!url){
return sock.sendMessage(chatId,{
text:"📥 ابعت رابط انستجرام"
},{quoted:message})
}

if(!/instagram\.com/i.test(url)){
return sock.sendMessage(chatId,{
text:"❌ ده مش رابط انستجرام"
},{quoted:message})
}

await sock.sendMessage(chatId,{react:{text:"⏳",key:message.key}})

let media = null

const apis = [

`https://vihangayt.me/download/instagram?url=${encodeURIComponent(url)}`,

`https://api.akuari.my.id/downloader/ig?link=${encodeURIComponent(url)}`,

`https://api.betabotz.eu.org/api/download/ig?url=${encodeURIComponent(url)}`

]

for(const api of apis){

try{

const res = await axios.get(api,{timeout:20000})

media =
res?.data?.data ||
res?.data?.result ||
res?.data?.url

if(media) break

}catch{}

}

if(!media){

return sock.sendMessage(chatId,{
text:"❌ مقدرتش أحمل من انستجرام"
},{quoted:message})

}

if(Array.isArray(media)){

for(const m of media){

if(m.includes(".mp4")){
await sock.sendMessage(chatId,{video:{url:m}},{quoted:message})
}else{
await sock.sendMessage(chatId,{image:{url:m}},{quoted:message})
}

}

}else{

if(media.includes(".mp4")){
await sock.sendMessage(chatId,{video:{url:media}},{quoted:message})
}else{
await sock.sendMessage(chatId,{image:{url:media}},{quoted:message})
}

}

await sock.sendMessage(chatId,{react:{text:"✅",key:message.key}})

}
}