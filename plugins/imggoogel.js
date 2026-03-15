const axios = require("axios")

module.exports = {
command: "صوره",
aliases: ["صور","img"],
category: "اوامـࢪ الاداوات",

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

const res = await axios.get(
`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`,{
headers:{
"User-Agent":"Mozilla/5.0",
"Accept-Language":"en-US,en;q=0.9"
}
})

const html = res.data

const links = [...html.matchAll(/"ou":"(.*?)"/g)]
.map(x=>x[1])

.filter(x=>x.startsWith("http"))

if(!links.length){
return sock.sendMessage(chatId,{
text:"ملقتش صور 😄❤️"
},{quoted:message})
}

const images = links.slice(0,5)

for(let i=0;i<images.length;i++){

await sock.sendMessage(chatId,{
image:{url:images[i]},
caption:`🖼️ صورة ${i+1} لـ "${query}"\n*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`
},{quoted:message})

await new Promise(r=>setTimeout(r,800))

}

}catch(e){

console.log(e)

sock.sendMessage(chatId,{
text:"ف مشكله ياحب 😄"
},{quoted:message})

}

}
}