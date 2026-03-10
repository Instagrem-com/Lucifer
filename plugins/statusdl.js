const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'تحميل_حالة',
  aliases: ['dlstatus', 'حالة', 'تنزيل_حالة'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'تحميل حالة واتساب بالرد عليها',
  usage: 'رد على الحالة واكتب .تحميل_حالة',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    const m = message.message;
    const type = Object.keys(m)[0];
    const contextInfo = m[type]?.contextInfo;

    if (!contextInfo || contextInfo.remoteJid !== 'status@broadcast') {
      return await sock.sendMessage(chatId, { 
        text: "⚠️ لازم ترد على الحالة علشان أقدر أحملها." 
      }, { quoted: message });
    }

    const quotedMsg = contextInfo.quotedMessage;
    if (!quotedMsg) return;

    try {
      const quotedType = Object.keys(quotedMsg)[0];
      const mediaData = quotedMsg[quotedType];

      if (quotedType === 'conversation' || quotedType === 'extendedTextMessage') {
        const text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
        return await sock.sendMessage(chatId, { 
          text: `📝 *نص الحالة:*\n\n${text}` 
        }, { quoted: message });
      }

      const stream = await downloadContentFromMessage(
        mediaData, 
        quotedType.replace('Message', '')
      );

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (quotedType === 'imageMessage') {
        await sock.sendMessage(chatId, { 
          image: buffer, 
          caption: mediaData.caption || '' 
        }, { quoted: message });

      } else if (quotedType === 'videoMessage') {
        await sock.sendMessage(chatId, { 
          video: buffer, 
          caption: mediaData.caption || '' 
        }, { quoted: message });
      }

    } catch (e) {
      console.error('خطأ تحميل الحالة:', e);
      await sock.sendMessage(chatId, { 
        text: "❌ فشل في تحميل الحالة." 
      }, { quoted: message });
    }
  }
};