module.exports = {
  command: 'قفل',
  aliases: ['صمت', 'اسكتو'],
  category: 'اوامـࢪ الـجـࢪوبـات',
  description: 'كتم الجروب لمدة معينة أو تشغيل كتم دائم',
  usage: '.كتم [المدة بالدقايق]',
  groupOnly: true,
  adminOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    const durationInMinutes = args[0] ? parseInt(args[0]) : undefined;

    try {
      // كتم الجروب
      await sock.groupSettingUpdate(chatId, 'announcement');
      
      if (durationInMinutes !== undefined && durationInMinutes > 0) {
        const durationInMilliseconds = durationInMinutes * 60 * 1000;
        await sock.sendMessage(chatId, { 
          text: `الروم اتقفل ياشوباب لمدة ${durationInMinutes} دقيقه 👀❤️.`,
          ...channelInfo 
        }, { quoted: message });
        
        // رفع الكتم بعد انتهاء الوقت
        setTimeout(async () => {
          try {
            await sock.groupSettingUpdate(chatId, 'not_announcement');
            await sock.sendMessage(chatId, { 
              text: 'الروم اتفتح يا شوباب 👀❤️.',
              ...channelInfo 
            });
          } catch (unmuteError) {
            console.error('ف مشكله ياحب 😄❤️', unmuteError);
          }
        }, durationInMilliseconds);
      } else {
        await sock.sendMessage(chatId, { 
          text: 'الروم اتقفل يا شوباب 👀❤️',
          ...channelInfo 
        }, { quoted: message });
      }
    } catch (error) {
      console.error('خطأ أثناء كتم/فتح الجروب:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ حصل خطأ أثناء محاولة كتم أو فتح الجروب. جرب مرة تانية.',
        ...channelInfo 
      }, { quoted: message });
    }
  }
};