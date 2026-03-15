const axios = require("axios")

module.exports = {
command: "صوره",
aliases: ["صور","img"],
category: "اوامـࢪ الاداوات",
description: "البحث عن صور",

async handler(sock,message,args,context={}){

const chatId = context.chatId || message.key.remoteJid
const query = args.join(" ")

if(!query){
return sock.sendMessage(chatId,{
text:"📸 اكتب اسم الصورة\nمثال: .صوره قطة"
},{quoted:message})
}

try{

await sock.sendMessage(chatId,{
text:`🔎 بدور على صور "${query}" ...`
},{quoted:message})

const res = await axios.get(`https://api.siputzx.my.id/api/search/image?query=${encodeURIComponent(query)}`)

const images = res.data.data.slice(0,5)

if(!images.length){
return sock.sendMessage(chatId,{
text:"ملقتش صور 😄❤️"
},{quoted:message})
}

for(let i=0;i<images.length;i++){

await sock.sendMessage(chatId,{
image:{url:images[i]},
caption:`🖼️ صورة ${i+1} لـ "${query}"\n\n*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`
},{quoted:message})

await new Promise(r=>setTimeout(r,700))

}

}catch(e){

console.log(e)

sock.sendMessage(chatId,{
text:"❌ حصل مشكلة في جلب الصور"
},{quoted:message})

}

}
}