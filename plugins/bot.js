const axios = require("axios");

module.exports = {
command: "بوت",
aliases: ["ai","gpt"],
category: "اوامـࢪ الـAI",
description: "اسأل الذكاء الاصطناعي أي حاجة",

async handler(sock,message,args,context={}){

const chatId = context.chatId || message.key.remoteJid;
const question = args.join(" ");

if(!question){
return sock.sendMessage(chatId,{
text:`🤖 اسألني أي حاجة يا معلم

مثال :
.بوت ازاي اتعلم برمجة
.بوت احكيلي نكتة
.بوت عامل ايه`
},{quoted:message});
}

try{

await sock.sendMessage(chatId,{
text:"🧠 بفكر شوية كده استنى..."
},{quoted:message});

// API قوي
const res = await axios.get(`https://api.siputzx.my.id/api/ai/gpt4?prompt=${encodeURIComponent(question)}`);

let reply = res.data.data;

if(!reply){
reply = "مش عارف أرد دلوقتي جرب تاني 😂";
}

await sock.sendMessage(chatId,{
text:`🤖 الرد :

${reply}`
},{quoted:message});

}catch(err){

console.log(err);

sock.sendMessage(chatId,{
text:`❌ حصل مشكلة في الذكاء الاصطناعي

جرب تاني بعد شوية`
},{quoted:message});

}

}
}