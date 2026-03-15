module.exports = {
  command: 'منشن_الادمن',
  aliases: ['ادمن','admins'],
  category: 'اوامـࢪ الـجـࢪوبـات',
  description: 'منشن كل الأدمن في الجروب',

  async handler(sock, message, args, context) {
    const { chatId } = context;
    
    try {
      const groupMetadata = await sock.groupMetadata(chatId);
      const participants = groupMetadata.participants || [];

      // ناخد كل الادمنين
      const admins = participants.filter(p => p.admin !== null).map(p => p.id);
      
      if (admins.length === 0) {
        await sock.sendMessage(chatId, { 
          text: '💀 مفيش أدمنين في الجروب 😅'
        }, { quoted: message });
        return;
      }

      let text = '🔥 يلا يا كووول 👑\nمنشن لكل الأدمنين: \n\n';

      admins.forEach(jid => {
        text += `@${jid.split('@')[0]} 😎\n`;
      });

      text += '\n💀 اللي مش هيجاوب يبقا معمول له بلوك 😂';

      await sock.sendMessage(chatId, { 
        text, 
        mentions: admins
      }, { quoted: message });
      
    } catch (error) {
      console.log('حصل خطأ في منشن الأدمن:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ يا معلم حصل خطأ، جرب تاني'
      }, { quoted: message });
    }
  }
};