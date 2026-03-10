module.exports = {
  command: 'فتح',
  aliases: ['unsilence'],
  category: 'اوامـࢪ الـجـࢪوبـات',
  description: 'Unmute the group',
  usage: '.unmute',
  groupOnly: true,
  adminOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    try {
      await sock.groupSettingUpdate(chatId, 'not_announcement');
      await sock.sendMessage(chatId, { 
        text: 'الجروب اتفتح يا شوباب 👀❤️',
        ...channelInfo
      }, { quoted: message });
    } catch (error) {
      console.error('Error unmuting group:', error);
      await sock.sendMessage(chatId, { 
        text: 'Failed to unmute the group.',
        ...channelInfo
      }, { quoted: message });
    }
  }
};
