const { GoogleGenerativeAI } = require("@google/generative-ai")

const API_KEY = "AIzaSyBvGPz3B0SgiV301nNlhWDlWWwA0gbEF-k"

const genAI = new GoogleGenerativeAI(API_KEY)

module.exports = {
command: "جيميناي",
aliases: ["gemini","ai"],
category: "اوامـر الـذكاء",
description: "اسأل Gemini AI",
usage: ".جيميناي <سؤال>",

async handler(sock,message,args,context={}){

const chatId = context.chatId || message.key.remoteJid
const question = args.join(" ")

try{

if(!question){
return sock.sendMessage(chatId,{
text:`اكتب سؤالك كده:

.جيميناي مين اخترع الانترنت`
},{quoted:message})
}

await sock.sendMessage(chatId,{
react:{text:"🤖",key:message.key}
})

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

const result = await model.generateContent(question)

const reply = result.response.text()

await sock.sendMessage(chatId,{
text:`🤖 *Gemini AI*

${reply}

> ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`
},{quoted:message})

}catch(err){

console.log(err)

await sock.sendMessage(chatId,{
text:"❌ حصل خطأ في Gemini"
},{quoted:message})

}

}
}