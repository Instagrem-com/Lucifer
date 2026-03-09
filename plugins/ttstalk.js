const axios = require('axios');

module.exports = {
  command: 'معلومات_تيكتوك', // الاسم بالعربي
  aliases: ['تيكستالك', 'ttprofile', 'ttستالك'],
  category: 'اوامـࢪ الاداوات',
  description: 'عرض معلومات حساب مستخدم تيكتوك',
  usage: '.تيكتوك_ستالك <اسم المستخدم>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: '❌ الرجاء كتابة اسم مستخدم تيكتوك.\nمثال: .تيكتوك_ستالك truepakistanofficial'
      }, { quoted: message });
    }

    const username = args[0];

    try {
      const { data } = await axios.get('https://discardapi.dpdns.org/api/stalk/tiktok', {
        params: { apikey: 'guru', username: username }
      });

      if (!data?.result?.user) {
        return await sock.sendMessage(chatId, { text: '❌ لم يتم العثور على مستخدم تيكتوك.' }, { quoted: message });
      }

      const user = data.result.user;
      const stats = data.result.statsV2 || data.result.stats;
      const profileImage = user.avatarLarger || user.avatarMedium || user.avatarThumb;
      const verifiedMark = user.verified ? '✅ حساب موثق' : '';

      const caption = `🎵 *معلومات حساب تيكتوك*\n\n` +
                      `👤 الاسم: ${user.nickname || 'غير متوفر'} ${verifiedMark}\n` +
                      `🆔 اسم المستخدم: @${user.uniqueId || 'غير متوفر'}\n` +
                      `📝 البايو: ${user.signature || 'غير متوفر'}\n` +
                      `🔒 حساب خاص: ${user.privateAccount ? 'نعم' : 'لا'}\n\n` +
                      `👥 المتابعون: ${stats?.followerCount || 0}\n` +
                      `➡ المتابعين: ${stats?.followingCount || 0}\n` +
                      `❤️ الإعجابات: ${stats?.heartCount || 0}\n` +
                      `🎥 عدد الفيديوهات: ${stats?.videoCount || 0}\n\n` +
                      `🔗 رابط الحساب: https://www.tiktok.com/@${user.uniqueId}`;

      if (profileImage) {
        await sock.sendMessage(chatId, { image: { url: profileImage }, caption: caption }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: caption }, { quoted: message });
      }

    } catch (err) {
      console.error('❌ خطأ في أمر ستالك تيكتوك:', err);
      await sock.sendMessage(chatId, { text: '❌ فشل جلب معلومات حساب تيكتوك.' }, { quoted: message });
    }
  }
};