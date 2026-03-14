const axios = require('axios');

module.exports = {
command: 'فيسبوك',
aliases: ['fb','fbdl'],
category: 'اوامـࢪ الـتـحـمـيـل',
description: 'تحميل فيديوهات فيسبوك',
usage: '.فيسبوك <رابط فيديو>',

async handler(sock,message,args,context={}){

const chatId = context.chatId || message.key.remoteJid
const url = args.join(" ")

try{

if(!url){
return sock.sendMessage(chatId,{
text:'اكتب كده:\n.فيسبوك رابط'
},{quoted:message})
}

if(!/facebook\.com|fb\.watch/i.test(url)){
return sock.sendMessage(chatId,{
text:'الرابط مش صحيح 👀'
},{quoted:message})
}

await sock.sendMessage(chatId,{
react:{text:'🔄',key:message.key}
})

/*
API
*/

const api = `https://api.betabotz.eu.org/api/download/fb?url=${encodeURIComponent(url)}`

const res = await axios.get(api)

const video =
res?.data?.result?.HD ||
res?.data?.result?.SD

if(!video){
throw "no video"
}

await sock.sendMessage(chatId,{
video:{url:video},
caption:`🥂 الفيديو يا حب

> BY ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`
},{quoted:message})

await sock.sendMessage(chatId,{
react:{text:'✅',key:message.key}
})

}catch(err){

console.log(err)

await sock.sendMessage(chatId,{
text:'❌ فشل تحميل الفيديو'
},{quoted:message})

}

}
}