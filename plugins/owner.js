const settings = require('../settings');

module.exports = {
  command: 'المطور',
  aliases: ['صاحب_البوت', 'owner', 'creator'],
  category: 'اوامـࢪ الـبـوت',
  description: 'جيبلك رقم واتساب صاحب البوت',
  usage: '.المطور',
  async handler(sock, message, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${settings.botOwner}
TEL;waid=${settings.ownerNumber}:${settings.ownerNumber}
END:VCARD
      `.trim();

      await sock.sendMessage(chatId, {
        contacts: { 
          displayName: `${settings.botOwner}`, 
          contacts: [{ vcard }] 
        },
        caption: ``
      }, { quoted: message });

    } catch (error) {
      console.error('Owner Command Error:', error);
      await sock.sendMessage(chatId, {
        text: 'حصل مشكلة في جلب رقم صاحب البوت 😄❤️'
      }, { quoted: message });
    }
  }
};