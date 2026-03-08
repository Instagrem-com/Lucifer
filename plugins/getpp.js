module.exports = {
  command: 'الصوره',
  aliases: ['صورة', 'بروفايل', 'جيب_الصوره'],
  category: 'general',
  description: 'جلب صورة بروفايل المستخدم',
  usage: '.الصوره @الشخص او رد على رسالته او الرقم',

  async handler(sock, message, args, context = {}) {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');

    let target;
    let displayName = 'غير معروف';
    let displayNumber = '';

    const quoted = message.message?.extendedTextMessage?.contextInfo;
    
    if (quoted?.mentionedJid?.[0]) {
      target = quoted.mentionedJid[0];
    } else if (quoted?.participant) {
      target = quoted.participant;
      if (quoted.pushName) displayName = quoted.pushName;
    } else if (args[0]) {
      const input = args[0].replace(/[^0-9]/g, '');
      if (input.length >= 10) {
        target = input + '@s.whatsapp.net';
      } else {
        return await sock.sendMessage(chatId, { 
          text: '*الرقم اللي كتبته مش صحيح اكتب الرقم كامل* ❌' 
        }, { quoted: message });
      }
    } else {
      target = message.key.participant || message.key.remoteJid;
    }

    try {
      let realJid = target;

      if (target.endsWith('@lid') && isGroup) {
        const metadata = await sock.groupMetadata(chatId);
        const participant = metadata.participants.find(p => p.lid === target || p.id === target);
        if (participant?.id) {
           realJid = participant.id;
        }
      }

      const cleanNumber = realJid.replace(/@s\.whatsapp\.net|@lid/g, '').split(':')[0];
      displayNumber = `+${cleanNumber}`;

      if (displayName === 'غير معروف') {
        try {
          const name = await sock.getName(realJid);
          if (name && !name.startsWith('+')) displayName = name;
        } catch (e) {}
      }

      let ppUrl = null;
      try {
        ppUrl = await sock.profilePictureUrl(realJid, 'image');
      } catch (e) {
        return await sock.sendMessage(chatId, { 
          text: `*مفيش صورة بروفايل للشخص دا* (${displayNumber}) ❌` 
        }, { quoted: message });
      }

      if (ppUrl) {
        await sock.sendMessage(chatId, { 
          image: { url: ppUrl },
          caption:
`⎝⎝⛥ 𝐋𝐔𝐂𝐈𝐅𝐄𝐑 ⛥⎠⎠

اسم الشخص:
${displayName} 👤

رقم الشخص:
${displayNumber} 📱`
        }, { quoted: message });
      }

    } catch (error) {
      console.error('GetPP Error:', error);
      await sock.sendMessage(chatId, { 
        text: '*حصل مشكلة و معرفتش اجيب صورة البروفايل* ❌' 
      }, { quoted: message });
    }
  }
};