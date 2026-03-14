const { default: getFBInfo } = require("@xaviabot/fb-downloader")

module.exports = {

command: "فيسبوك",
aliases: ["fb","fbdl"],
category: "اوامـࢪ الـتـحـمـيـل",

async handler(sock,message,args,context={}){

const chatId = context.chatId || message.key.remoteJid

const url =
args.join(" ") ||
message.message?.conversation ||
message.message?.extendedTextMessage?.text

if(!url){
return sock.sendMessage(chatId,{
text:"📘 ابعت رابط فيديو فيسبوك"
},{quoted:message})
}

if(!/facebook\.com|fb\.watch/i.test(url)){
return sock.sendMessage(chatId,{
text:"الرابط مش من فيسبوك ❌"
},{quoted:message})
}

try{

await sock.sendMessage(chatId,{
react:{text:"⏳",key:message.key}
})

const data = await getFBInfo(url)

let video = data?.hd || data?.sd

if(!video){
throw "no video"
}

await sock.sendMessage(chatId,{
video:{url:video},
mimetype:"video/mp4",
caption:`📘 Facebook Downloader

العنوان: ${data.title || "فيديو"}`
},{quoted:message})

}catch(err){

console.log("FB ERROR:",err)

await sock.sendMessage(chatId,{
text:"❌ مقدرتش احمل الفيديو"
},{quoted:message})

}

}

}