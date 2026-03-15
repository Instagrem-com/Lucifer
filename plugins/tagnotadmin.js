module.exports = {
command: "منشن_الادمن",
aliases: ["ادمن","admins"],
category: "اوامـࢪ الـجـࢪوبـات",
description: "منشن كل الادمن",

async execute(sock,m,args){

try{

const group = await sock.groupMetadata(m.chat)

const admins = group.participants
.filter(p => p.admin !== null)
.map(p => p.id)

let text = "ࢪدو ع عـمـگـم لـوسـفـر 💀🖤\n\nالـي مـش هـيـࢪد امـو ࢪقـاصـة 😂💃🏼\n\n"

for(let admin of admins){
text += `@${admin.split("@")[0]}\n`
}

await sock.sendMessage(m.chat,{
text,
mentions: admins
},{quoted:m})

}catch(e){

console.log(e)
m.reply("❌ الأمر ده للجروبات بس")

}

}
}