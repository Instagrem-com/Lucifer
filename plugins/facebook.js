const axios = require("axios");

module.exports = {
  command: "فيسبوك",
  aliases: ["fb","fbdl"],
  category: "اوامـࢪ الـتـحـمـيـل",
  description: "تحميل فيديوهات فيسبوك",
  usage: ".فيسبوك <رابط>",

  async handler(sock,message,args,context={}) {
    const chatId = context.chatId || message.key.remoteJid;
    const url = args.join(" ");

    if(!url) return sock.sendMessage(chatId,{text:"اكتب رابط فيديو فيسبوك"},{quoted:message});
    if(!/facebook\.com|fb\.watch/i.test(url)) return sock.sendMessage(chatId,{text:"الرابط مش صحيح 👀"},{quoted:message});

    await sock.sendMessage(chatId,{react:{text:"🔄",key:message.key}});

    try {
      const api = `https://api.betabotz.eu.org/api/download/fb?url=${encodeURIComponent(url)}`;
      const res = await axios.get(api);
      const video = res?.data?.result?.HD || res?.data?.result?.SD;
      if(!video) throw "no video";

      await sock.sendMessage(chatId,{video:{url:video},caption:"🔥 فيديو فيسبوك 🔥"},{quoted:message});
      await sock.sendMessage(chatId,{react:{text:"✅",key:message.key}});
    } catch {
      await sock.sendMessage(chatId,{text:"❌ فشل تحميل الفيديو"} ,{quoted:message});
    }
  }
};