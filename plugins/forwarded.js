module.exports = {
  command: 'رساله_معاد_توجيها',
  aliases: ['viral', 'fakeforward'],
  category: 'tools',
  description: 'إرسال رسالة بعلامة "تم إعادة توجيهها كثيرًا" مزيفة',
  usage: '.رساله_معاد_توجيها <نص> أو الرد على رسالة',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    
    try {
      let txt = "";
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (quoted) {
        txt = quoted.conversation || 
              quoted.extendedTextMessage?.text || 
              quoted.imageMessage?.caption || 
              quoted.videoMessage?.caption || 
              "";
      } 
      
      if (!txt || txt.trim() === "") {
        txt = args?.join(' ') || "";
      }

      if (!txt || txt.trim() === "") {
        return await sock.sendMessage(chatId, { 
          text: 'من فضلك اكتب نص أو قم بالرد على رسالة لإعادة توجيهها 👀❤️' 
        }, { quoted: message });
      }

      await sock.sendMessage(chatId, { 
        text: txt,
        contextInfo: { 
          isForwarded: true, 
          forwardingScore: 999 
        } 
      });

    } catch (err) {
      console.error('Forwarding Spoof Error:', err);
      await sock.sendMessage(chatId, { text: ' فشل في تزوير إعادة التوجيه 😄' });
    }
  }
};