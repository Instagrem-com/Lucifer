module.exports = {
  command: 'بنج',
  aliases: ['p', 'pong'],
  category: 'اوامـࢪ الـبـوت',
  description: 'اعرف سرعة استجابة البوت',
  usage: '.بنج',
  isPrefixless: true,
  
  async handler(sock, message, args) {
    const start = Date.now();
    const chatId = message.key.remoteJid;
    
    const sent = await sock.sendMessage(chatId, { 
      text: 'ويـــيــت ⚡' 
    });
    
    const end = Date.now();
    
    await sock.sendMessage(chatId, {
      text: `سرعـه الـبـوت ${end - start}ms\n\n*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`,
      edit: sent.key
    });
  }
};