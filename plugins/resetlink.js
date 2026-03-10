module.exports = {
  command: 'تعيين_رابط_الجروب', // بدل resetlink
  aliases: ['رابط', 'رابط_جديد'],
  category: 'اوامـࢪ الـجـࢪوبـات',
  description: 'إعادة إنشاء رابط الدعوة للجروب',
  usage: '.اعادة_رابط',
  groupOnly: true,
  adminOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    try {
      const newCode = await sock.groupRevokeInvite(chatId);
      
      await sock.sendMessage(chatId, { 
        text: ` تم إعادة إنشاء رابط الجروب بنجاح 👀❤️\n\n🔗 الرابط الجديد:\nhttps://chat.whatsapp.com/${newCode}`,
        ...channelInfo
      }, { quoted: message });

    } catch (error) {
      console.error('خطأ في أمر إعادة الرابط:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ فشل في إعادة رابط الجروب!',
        ...channelInfo
      }, { quoted: message });
    }
  }
};