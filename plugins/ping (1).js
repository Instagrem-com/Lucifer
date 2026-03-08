module.exports = {
  command: 'يوسف',
  aliases: ['p', 'pong'],
  category: '',
  description: 'Check bot response time',
  usage: '.يوسف',
  isPrefixless: true,
  
  async handler(sock, message, args) {
    const start = Date.now();
    const chatId = message.key.remoteJid;
    
    const sent = await sock.sendMessage(chatId, { 
      text: 'اسم المطور لوسيفر ياعلق' 
    });