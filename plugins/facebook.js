const axios = require("axios")

module.exports = {
command: "فيسبوك",
aliases: ["fb","fbdl"],
category: "اوامـࢪ الـتـحـمـيـل",
description: "تحميل فيديوهات فيسبوك",
usage: ".فيسبوك <رابط>",

async handler(sock,message,args,context={}){

let chatId = context.chatId || message.key.remoteJid
let url = args.join(" ")

if(!url){
return sock.sendMessage(chatId,{
text:"📥 ابعت رابط فيديو فيسبوك"
},{quoted:message})
}

if(!/facebook\.com|fb\.watch/i.test(url)){
return sock.sendMessage(chatId,{
text:"❌ ده مش رابط فيسبوك"
},{quoted:message})
}

await sock.sendMessage(chatId,{react:{text:"⏳",key:message.key}})

/*
تحويل share link
*/

try{
if(url.includes("facebook.com/share")){
const r = await axios.get(url)
url = r.request.res.responseUrl || url
}
}catch{}

/*
قائمة APIs
*/

const apis = [

`https://vihangayt.me/download/facebook?url=${encodeURIComponent(url)}`,

`https://api.akuari.my.id/downloader/fb?link=${encodeURIComponent(url)}`,

`https://api.betabotz.eu.org/api/download/fb?url=${encodeURIComponent(url)}`

]

let video = null

for(const api of apis){

try{

const res = await axios.get(api,{timeout:20000})

video =
res?.data?.data?.hd ||
res?.data?.data?.sd ||
res?.data?.result?.HD ||
res?.data?.result?.SD ||
res?.data?.respon?.url

if(video) break

}catch{}

}

if(!video){

return sock.sendMessage(chatId,{
text:"❌ مقدرتش أحمل الفيديو\nجرب فيديو تاني"
},{quoted:message})

}

await sock.sendMessage(chatId,{
video:{url:video},
caption:`🔥 الفيديو وصل يا كبير

✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`
},{quoted:message})

await sock.sendMessage(chatId,{react:{text:"✅",key:message.key}})

}
}