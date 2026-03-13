const settings = require('../settings');
const commandHandler = require('../lib/commandHandler');
const path = require('path');
const fs = require('fs');

function formatTime() {
  const now = new Date();
  const options = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: settings.timeZone || 'UTC' };
  return now.toLocaleTimeString('en-US', options);
}

const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
const menuSong = path.join(__dirname, '../assets/اغنيه.mp3');

module.exports = {
  command: 'اوامر',
  aliases: ['m', 'y', 'lucifer', 'l'],
  category: 'اوامـࢪ الـبـوت',
  description: 'Show interactive menu with categories',
  usage: '.اوامر',

  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const prefix = settings.prefixes[0];

    // لو المستخدم ضغط على فئة معينة
    if (args.length) {
      const arg = args.join('_').toLowerCase();

      if (arg === 'رجوع') {
        return module.exports.handler(sock, message, [], context); // ارجع للمنيو الرئيسي
      }

      const category = [...commandHandler.categories.keys()].find(c => c.toLowerCase() === arg);
      if (!category) {
        return sock.sendMessage(chatId, { text: `الفئة "${args[0]}" مش موجودة. اختار من الأزرار 👀`, ...channelInfo }, { quoted: message });
      }

      const cmds = commandHandler.categories.get(category);
      const text = `📂 *أوامر فئة: ${category}*\n\n` + cmds.map(c => `• ${prefix}${c}`).join('\n');

      const buttons = [{ buttonId: `${prefix}اوامر رجوع`, buttonText: { displayText: 'رجوع للمنيو' }, type: 1 }];
      return sock.sendMessage(chatId, { text, ...channelInfo, buttons, headerType: 1 }, { quoted: message });
    }

    // إنشاء أزرار لكل فئة
    const buttons = [...commandHandler.categories.keys()].map(cat => ({
      buttonId: `${prefix}اوامر ${cat}`,
      buttonText: { displayText: cat },
      type: 1
    }));

    // إرسال المنيو الرئيسي
    const caption = `✨ *بوت: ${settings.botName}*\n💎 الإصدار: ${settings.version || '5.0.0'}\n⏰ الوقت: ${formatTime()}\n\nاختر الفئة من الزرار تحت 👇`;
    
    if (fs.existsSync(imagePath)) {
      await sock.sendMessage(chatId, {
        image: { url: imagePath },
        caption,
        ...channelInfo,
        buttons,
        headerType: 4
      }, { quoted: message });
    } else {
      await sock.sendMessage(chatId, {
        text: caption,
        ...channelInfo,
        buttons,
        headerType: 1
      }, { quoted: message });
    }

    // إرسال الأغنية بعد المنيو
    if (fs.existsSync(menuSong)) {
      await sock.sendMessage(chatId, { audio: { url: menuSong }, mimetype: "audio/mpeg" }, { quoted: message });
    }
  }
};
