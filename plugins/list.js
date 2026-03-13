const settings = require('../settings');
const commandHandler = require('../lib/commandHandler');
const path = require('path');
const fs = require('fs');

function formatTime() {
    const now = new Date();
    const options = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false,
        timeZone: settings.timeZone || 'UTC'
    };
    return now.toLocaleTimeString('en-US', options);
}

const menuStyles = [
  {
    render({ title, info, categories, prefix }) {
      let t = `┃━━『 *قـائـمـة الاوامـࢪ* 』━⬣\n`;
      t += `┃ ✨ *بوت: ${info.bot}*\n`;
      t += `┃ 🔧 *بادئة الأوامر: ${info.prefix}*\n`;
      t += `┃ 📦 *الإضافات: ${info.total}*\n`;
      t += `┃ 💎 *الإصدار: ${info.version}*\n`;
      t += `┃ ⏰ *الوقت: ${info.time}*\n`;

      for (const [cat, cmds] of categories) {
        t += `┃━━━ *${cat.toUpperCase()}* ━✦\n`;
        for (const c of cmds)
          t += `┃ ★ ${prefix}${c}\n`;
      }
      t += `━━━━━━━━━━━━━⬣`;
      return t;
    }
  },
  {
    render({ title, info, categories, prefix }) {
      let t = `◈├─❍「 *قـائـمـة الاوامـࢪ* 」❍\n`;
      t += `◈├• 🌟 *بوت: ${info.bot}*\n`;
      t += `◈├• ⚙️ *بادئة الأوامر: ${info.prefix}*\n`;
      t += `◈├• 🍫 *الإضافات: ${info.total}*\n`;
      t += `◈├• 💎 *الإصدار: ${info.version}*\n`;
      t += `◈├• ⏰ *الوقت: ${info.time}*\n`;

      for (const [cat, cmds] of categories) {
        t += `◈├─❍「 *${cat.toUpperCase()}* 」❍\n`;
        for (const c of cmds)
          t += `◈├• ${prefix}${c}\n`;
      }
      t += `────★─☆──♪♪─❍`;
      return t;
    }
  },
  {
    render({ title, info, categories, prefix }) {
      let t = `┃━━━━ *قـائـمـة الاوامـࢪ* ━━━\n`;
      t += `┃• *بوت: ${info.bot}*\n`;
      t += `┃• *بادئات الأوامر: ${info.prefix}*\n`;
      t += `┃• *الإضافات: ${info.total}*\n`;
      t += `┃• *الإصدار: ${info.version}*\n`;
      t += `┃• *الوقت: ${info.time}*\n`;

      for (const [cat, cmds] of categories) {
        t += `┃━━━━ *${cat.toUpperCase()}* ━━◆\n`;
        for (const c of cmds)
          t += `┃ ✌︎ ${prefix}${c}\n`;
      }
      t += `━━━━━━━━━━━━━━━━`;
      return t;
    }
  },
  {
    render({ title, info, categories, prefix }) {
      let t = `✦═══ *قـائـمـة الاوامـࢪ* ═══✦\n`;
      t += `║✦ *بوت: ${info.bot}*\n`;
      t += `║✦ *بادئات الأوامر: ${info.prefix}*\n`;
      t += `║✦ *الإضافات: ${info.total}*\n`;
      t += `║✦ *الإصدار: ${info.version}*\n`;
      t += `║✦ *الوقت: ${info.time}*\n`;

      for (const [cat, cmds] of categories) {
        t += `║══ *${cat.toUpperCase()}* ══✧\n`;
        for (const c of cmds)
          t += `║ ✦ ${prefix}${c}\n`;
      }
      t += `✦══════════════✦`;
      return t;
    }
  },
  {
    render({ title, info, categories, prefix }) {
      let t = `❀━━━ *قـائـمـة الاوامـࢪ* ━━━❀\n`;
      t += `┃❀ *بوت: ${info.bot}*\n`;
      t += `┃❀ *بادئات الأوامر: ${info.prefix}*\n`;
      t += `┃❀ *الإضافات: ${info.total}*\n`;
      t += `┃❀ *الإصدار: ${info.version}*\n`;
      t += `┃❀ *الوقت: ${info.time}*\n`;

      for (const [cat, cmds] of categories) {
        t += `┃━━━〔 *${cat.toUpperCase()}* 〕━❀\n`;
        for (const c of cmds)
          t += `┃❀ ${prefix}${c}\n`;
      }
      t += `❀━━━━━━━━━━━━━━❀`;
      return t;
    }
  },
  {
    render({ title, info, categories, prefix }) {
      let t = `◆━━━ *قـائـمـة الاوامـࢪ* ━━━◆\n`;
      t += `┃ ¤ *بوت: ${info.bot}*\n`;
      t += `┃ ¤ *بادئات الأوامر: ${info.prefix}*\n`;
      t += `┃ ¤ *الإضافات: ${info.total}*\n`;
      t += `┃ ¤ *الإصدار: ${info.version}*\n`;
      t += `┃ ¤ *الوقت: ${info.time}*\n`;
      for (const [cat, cmds] of categories) {
        t += `┃━━ *${cat.toUpperCase()}* ━━◆◆\n`;
        for (const c of cmds)
          t += `┃ ¤ ${prefix}${c}\n`;
      }
      t += `◆━━━━━━━━━━━━━━━━◆`;
      return t;
    }
  },
  {
    render({ title, info, categories, prefix }) {
      let t = `────⬣ *قـائـمـة الاوامـࢪ* ──⬣\n`;
      t += ` | ● *بوت: ${info.bot}*\n`;
      t += ` | ● *بادئات الأوامر: ${info.prefix}*\n`;
      t += ` | ● *الإضافات: ${info.total}*\n`;
      t += ` | ● *الإصدار: ${info.version}*\n`;
      t += ` | ● *الوقت: ${info.time}*\n`;
      for (const [cat, cmds] of categories) {
        t += ` |───⬣ *${cat.toUpperCase()}* ──⬣\n`;
        for (const c of cmds)
          t += ` | ● ${prefix}${c}\n`;
      }
      t += `───────────⬣`;
      return t;
    }
  }
];

const songPath = path.join(__dirname, '../assets/اغنيه.mp3'); // المسار المحلي للأغنية

module.exports = {
  command: 'اوامر',
  aliases: ['m', 'y', 'lucifer', 'l'],
  category: 'اوامـࢪ الـبـوت',
  description: 'Show all commands',
  usage: '.اوامر ',

  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const prefix = settings.prefixes[0];
    const imagePath = path.join(__dirname, '../assets/bot_image.jpg');

    if (args.length) {
      const searchTerm = args[0].toLowerCase();
      let cmd = commandHandler.commands.get(searchTerm);
      if (!cmd && commandHandler.aliases.has(searchTerm)) {
        const mainCommand = commandHandler.aliases.get(searchTerm);
        cmd = commandHandler.commands.get(mainCommand);
      }
      if (!cmd) {
        return sock.sendMessage(chatId, { 
          text: `الامر دا "${args[0]}" مش موجود ف الاوامر.\n\n ${prefix} شوف الاوامر تاني 👀❤️`,
          ...channelInfo
        }, { quoted: message });
      }

      const text = 
`━━━━━━━━━━━━━━⬣
┃ 📌 *معلومات الأمر*
┃
┃ ⚡ *الأمر:* ${prefix}${cmd.command}
┃ 📝 *الوصف:* ${cmd.description || 'لا يوجد وصف'}
┃ 📖 *طريقة الاستخدام:* ${cmd.usage || `${prefix}${cmd.command}`}
┃ 🏷️ *الفئة:* ${cmd.category || 'عام'}
┃ 🔖 *الأسماء المستعارة:* ${cmd.aliases?.length ? cmd.aliases.map(a => prefix + a).join(', ') : 'لا يوجد'}
┃
━━━━━━━━━━━━━━⬣`;

      if (fs.existsSync(imagePath)) {
        await sock.sendMessage(chatId, {
          image: { url: imagePath },
          caption: text,
          ...channelInfo
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
      }

      // 🔹 إرسال الأغنية بعد تفاصيل الأمر
      await sock.sendMessage(chatId, {
  document: { url: menuSong },
  mimetype: "audio/mpeg",
  fileName: "اغنية.mp3"
}, { quoted: message });

      return;
    }

    const style = pick(menuStyles);

    const text = style.render({
      title: settings.botName,
      prefix,
      info: {
        bot: settings.botName,
        prefix: settings.prefixes.join(', '),
        total: commandHandler.commands.size,
        version: settings.version || "5.0.0",
        time: formatTime()
      },
      categories: commandHandler.categories
    });

    if (fs.existsSync(imagePath)) {
      await sock.sendMessage(chatId, {
        image: { url: imagePath },
        caption: text,
        ...channelInfo
      }, { quoted: message });
    } else {
      await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
    }

    // 🔹 إرسال الأغنية بعد القائمة
    await sock.sendMessage(chatId, {
      audio: { url: menuSong },
      mimetype: "audio/mp4",
      ptt: true
    }, { quoted: message });
  }
};
