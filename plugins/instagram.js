const { igdl } = require("ruhend-scraper");
const axios = require("axios");

const processed = new Set();

function uniqueMedia(arr = []) {
  const seen = new Set();
  return arr.filter(m => {
    if (!m?.url || seen.has(m.url)) return false;
    seen.add(m.url);
    return true;
  });
}

async function getMediaType(url) {
  try {
    const res = await axios.get(url, { responseType: "stream", headers: { Range: "bytes=0-1024" } });
    const type = res.headers["content-type"] || "";
    if (type.includes("video")) return "video";
    if (type.includes("image")) return "image";
    return null;
  } catch { return null; }
}

module.exports = {
  command: "انستا",
  aliases: ["ig","insta","انستجرام"],
  category: "اوامـࢪ الـتـحـمـيـل",
  description: "تحميل ريلز وصور من إنستجرام 🔥",
  usage: ".انستا <link>",

  async handler(sock,message,args,context={}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = args.join(" ");

    if(!text) return sock.sendMessage(chatId,{text:"اكتب رابط إنستجرام"},{quoted:message});
    if(!/instagram\.com|instagr\.am/i.test(text)) return sock.sendMessage(chatId,{text:"الرابط مش صحيح 👀"},{quoted:message});

    if(processed.has(message.key.id)) return;
    processed.add(message.key.id);
    setTimeout(()=>processed.delete(message.key.id),300000);

    await sock.sendMessage(chatId,{react:{text:"🔄",key:message.key}});

    try {
      const res = await igdl(text);
      let media = (res.data || []).map(m => ({ url: m.url, type: m.type }));
      media = uniqueMedia(media).slice(0,20);

      for(const m of media){
        let actualType = await getMediaType(m.url) || (m.type === "video" ? "video" : "image");
        if(actualType==="video") await sock.sendMessage(chatId,{video:{url:m.url},caption:"🔥 فيديو إنستا 🔥"},{quoted:message});
        else await sock.sendMessage(chatId,{image:{url:m.url},caption:"🔥 صورة إنستا 🔥"},{quoted:message});
        await new Promise(r=>setTimeout(r,1500));
      }

      await sock.sendMessage(chatId,{react:{text:"✅",key:message.key}});
    } catch {
      await sock.sendMessage(chatId,{text:"❌ فشل التحميل، تأكد أن الحساب Public"},{quoted:message});
    }
  }
};