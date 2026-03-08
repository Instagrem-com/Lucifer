module.exports = {
  command: 'بنج',
  aliases: ['p', 'pong'],
  category: 'عام',
  description: 'اعرف سرعة استجابة البوت',
  usage: '.بنغ',
  isPrefixless: true,
  
  async handler(sock, message, args) {
    const start = Date.now();
    const chatId = message.key.remoteJid;
    
    const sent = await sock.sendMessage(chatId, { 
      text: '⌛ بستنى البوت...' 
    });
    
    const end = Date.now();
    
    await sock.sendMessage(chatId, {
      text: `🏓 بنغ!\nسرعة الاستجابة: ${end - start}ms`,
      edit: sent.key
    });
  }
};