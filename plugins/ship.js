module.exports = {
  command: 'جواز',
  aliases: ['couple', 'شيب'],
  category: 'اوامـࢪ الـجـࢪوبـات',
  description: 'يختار عضوين من الجروب ويربطهم بشكل عشوائي 💖',
  usage: '.ship',
  groupOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    try {
      const groupData = await sock.groupMetadata(chatId);
      const participants = groupData.participants.map(v => v.id);
      
      if (participants.length < 2) {
        return await sock.sendMessage(chatId, {
          text: 'مفيش ناس ف الروم ياعم 😂😂',
          ...channelInfo
        }, { quoted: message });
      }

      let firstUser = participants[Math.floor(Math.random() * participants.length)];
      let secondUser;

      do {
        secondUser = participants[Math.floor(Math.random() * participants.length)];
      } while (secondUser === firstUser);

      const mention = id => '@' + id.split('@')[0];

      await sock.sendMessage(chatId, {
        text: ` *اليوم في اتنين اتجوزو جديد* 😂😂❤️\n\n${mention(firstUser)} ❤️ ${mention(secondUser)}\nمبروك على 😂🍻💖`,
        mentions: [firstUser, secondUser],
        ...channelInfo
      });

    } catch (error) {
      console.error('خطأ في أمر ship:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ فشل في عمل شِيب! اتأكد ان ده جروب.',
        ...channelInfo
      }, { quoted: message });
    }
  }
};