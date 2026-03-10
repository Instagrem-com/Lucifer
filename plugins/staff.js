module.exports = {
  command: 'المشرفين',
  aliases: ['الادمن', 'admins', 'staff'],
  category: 'اوامـࢪ الـجـࢪوبـات',
  description: 'عرض قائمة مشرفين الجروب',
  usage: '.المشرفين',
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
      const listAdmin = groupAdmins
        .map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`)
        .join('\n▢ ');

      const owner =
        groupMetadata.owner ||
        groupAdmins.find(p => p.admin === 'superadmin')?.id ||
        chatId.split('-')[0] + '@s.whatsapp.net';

      const text = `
≡ *مشرفين الجروب* _${groupMetadata.subject}_

┌─⊷ *الادمن*
▢ ${listAdmin}
└───────────

*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪'
`.trim();

      await sock.sendMessage(chatId, {
        image: { url: pp },
        caption: text,
        mentions: [...groupAdmins.map(v => v.id), owner],
        ...channelInfo
      });

    } catch (error) {
      console.error('خطأ في أمر المشرفين:', error);
      await sock.sendMessage(chatId, { 
        text: '✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪',
        ...channelInfo
      }, { quoted: message });
    }
  }
};
