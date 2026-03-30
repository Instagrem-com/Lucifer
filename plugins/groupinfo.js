module.exports = {
  command: 'معلومات_الجروب',
  aliases: ['معلومات', 'معلومات_القروب', 'جروب_انفو'],
  category: 'اوامـࢪ الـجـࢪوبـات',
  description: 'عرض معلومات الجروب بالكامل',
  usage: '.معلومات_الجروب',
  groupOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    try {
      const groupMetadata = await sock.groupMetadata(chatId);
      
      let pp;
      try {
        pp = await sock.profilePictureUrl(chatId, 'image');
      } catch {
        pp = 'https://i.imgur.com/2wzGhpF.jpeg';
      }
      
      const participants = groupMetadata.participants;
      const groupAdmins = participants.filter(p => p.admin);
      const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
      
      const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || chatId.split('-')[0] + '@s.whatsapp.net';
      
      const text = `
🏷️معلومات الجروب 🏷️

ايدي الجروب 🆔 :
${groupMetadata.id} 

اسم الجروب 👀 :
${groupMetadata.subject} 

عدد الاعضاء 👥 :
${participants.length} 

صاحب الجروب 👑 :
@${owner.split('@')[0]} 

المشرفين 🛡️:
${listAdmin} 

وصف الجروب 📝:
${groupMetadata.desc?.toString() || 'مفيش وصف للجروب'} 📌
`.trim();

      await sock.sendMessage(chatId, {
        image: { url: pp },
        caption: text,
        mentions: [...groupAdmins.map(v => v.id), owner],
        ...channelInfo
      });

    } catch (error) {
      console.error('Error in groupinfo command:', error);
      await sock.sendMessage(chatId, { 
        text: 'معرفتش اجيب معلومات الجروب دلوقتي حاول تاني ❌',
        ...channelInfo
      }, { quoted: message });
    }
  }
};