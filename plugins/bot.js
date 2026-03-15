const axios = require("axios");

module.exports = {
command: "بوت",
aliases: ["ai","gpt"],
category: "اوامـࢪ الـAI",
description: "اسأل الذكاء الاصطناعي أي حاجة بالعربي والمصري",

async handler(sock,message,args,context={}){

const chatId = context.chatId || message.key.remoteJid;
const question = args.join(" ");

if(!question){
return sock.sendMessage(chatId,{
text:"🤖 اسألني أي حاجة 🤖 \nمثال 📝 :\n.بوت عامل ايه"
},{quoted:message});
}

try{

await sock.sendMessage(chatId,{
text:" بفكر شوية...🧠😂"
},{quoted:message});

// استخدم API مجاني شغال (ChatGPT lite بالعربي)
const res = await axios.post("https://api.akuari.my.id/ai", {
prompt: question
});

// الرد من الذكاء الاصطناعي
const reply = res.data.result || " معرفتش أرد دلوقتي 😄";

await sock.sendMessage(chatId,{
text:`🤖 ${reply}`
},{quoted:message});

}catch(e){

console.log(e);

sock.sendMessage(chatId,{
text:"حصل خطأ في الذكاء الاصطناعي، جرب تاني 👀"
},{quoted:message});

}

}
}