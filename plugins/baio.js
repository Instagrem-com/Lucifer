module.exports = {
  command: 'بايو',
  aliases: ['status','bio'],
  category: 'اوامـࢪ الاداوات',
  description: 'تغيير بايو البوت بالعامية',
  ownerOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId } = context;

    const text = args.join(" ");
    if(!text) {
      return sock.sendMessage(chatId, {
        text: "✏️ ابعت البايو الجديد مع الأمر\nمثال:\n.بايو شغال على الميساج 😎"
      }, { quoted: message });
    }

    try {
      // استخدام الدالة الصحيحة لتغيير البايو
      await sock.updateProfileStatus(text); 
      await sock.sendMessage(chatId, {
        text: `✅ البايو اتغير ياحبيب قلبي 😎\nالآن البايو: "${text}"`
      }, { quoted: message });

    } catch (err) {
      console.log('حصل خطأ في تغيير البايو:', err);
      await sock.sendMessage(chatId, {
        text: '❌ مش قادر اغير البايو دلوقتي، جرب تاني 😅'
      }, { quoted: message });
    }
  }
};
