const { igdl } = require("@xct007/frieren-scraper")

const processed = new Set()

module.exports = {
command: "انستا",
aliases: ["ig","insta","انستجرام"],
category: "اوامـࢪ الـتـحـمـيـل",
description: "تحميل ريلز وصور من إنستجرام 🔥",
usage: ".انستا <link>",

async handler(sock, message, args, context = {}) {

const chatId = context.chatId || message.key.remoteJid
const text = args.join(" ")

try {

if(processed.has(message.key.id)) return
processed.add(message.key.id)
setTimeout(()=>processed.delete(message.key.id),300000)

if(!text){
return sock.sendMessage(chatId,{
text:`اكتب كده:\n\n.انستا رابط`
},{quoted:message})
}

if(!/instagram\.com|instagr\.am/i.test(text)){
return sock.sendMessage(chatId,{
text:"الرابط مش بتاع إنستجرام يا علـق 👀"
},{quoted:message})
}

await sock.sendMessage(chatId,{react:{text:"🔄",key:message.key}})

const data = await igdl(text)

if(!data?.data?.length){
throw "no media"
}

for(const media of data.data){

// فيديو
if(media.type === "video"){

await sock.sendMessage(chatId,{
video:{url:media.url},
caption:`تم تحميل الفيديو 🔥💀

✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`
},{quoted:message})

}

// صورة
else{

await sock.sendMessage(chatId,{
image:{url:media.url},
caption:`تم تحميل الصورة 🔥💀

✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`
},{quoted:message})

}

await new Promise(r=>setTimeout(r,1500))

}

await sock.sendMessage(chatId,{react:{text:"✅",key:message.key}})

}catch(err){

console.log("IG ERROR:",err)

await sock.sendMessage(chatId,{
text:`فشل التحميل ❌

تأكد إن:
• الحساب Public
• الرابط صحيح`
},{quoted:message})

}

}
}