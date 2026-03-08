const { isAdmin } = require('../lib/isAdmin');

async function handlePromotionEvent(sock, groupId, participants, author) {
  try {
    if (!Array.isArray(participants) || participants.length === 0) return;

    const promotedUsernames = await Promise.all(participants.map(async jid => {
      const jidString = typeof jid === 'string' ? jid : (jid.id || jid.toString());
      return `@${jidString.split('@')[0]} `;
    }));

    let promotedBy;
    let mentionList = participants.map(jid => {
      return typeof jid === 'string' ? jid : (jid.id || jid.toString());
    });

    if (author && author.length > 0) {
      const authorJid = typeof author === 'string' ? author : (author.id || author.toString());
      promotedBy = `@${authorJid.split('@')[0]}`;
      mentionList.push(authorJid);
    } else {
      promotedBy = 'النظام';
    }

    const promotionMessage = `*『 ترقية أعضاء الجروب 』*\n\n` +
      `👥 *العضو${participants.length > 1 ? 'ين' : ''} اللي اترفعت:*\n` +
      `${promotedUsernames.map(name => `• ${name}`).join('\n')}\n\n` +
      `👑 *اللي رفعهم:* ${promotedBy}\n\n` +
      `📅 *التاريخ:* ${new Date().toLocaleString()}`;
    
    await sock.sendMessage(groupId, {
      text: promotionMessage,
      mentions: mentionList
    });
  } catch (error) {
    console.error('خطأ أثناء التعامل مع حدث الترقيه:', error);
  }
}

module.exports = {
  command: 'ترقية',
  aliases: ['admin', 'رفع'],
  category: 'admin',
  description: 'ارفع عضو/أعضاء أدمن في الجروب',
  usage: '.ترقية [@العضو] أو رد على رسالته',
  groupOnly: true,
  adminOnly: true,

  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;

    let userToPromote = [];
    const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;

    if (mentionedJids && mentionedJids.length > 0) {
      userToPromote = mentionedJids;
    }
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
      userToPromote = [message.message.extendedTextMessage.contextInfo.participant];
    }

    if (userToPromote.length === 0) {
      await sock.sendMessage(chatId, { 
        text: '⚠️ من فضلك اعمل منشن للعضو أو رد على رسالته عشان ارفعه!',
        ...channelInfo
      }, { quoted: message });
      return;
    }

    try {
      await sock.groupParticipantsUpdate(chatId, userToPromote, "promote");

      const usernames = await Promise.all(userToPromote.map(async jid => {
        return `@${jid.split('@')[0]}`;
      }));

      const promoterJid = sock.user.id;

      const promotionMessage = `*『 ترقية أعضاء الجروب 』*\n\n` +
        `👥 *العضو${userToPromote.length > 1 ? 'ين' : ''} اللي اترفعت:*\n` +
        `${usernames.map(name => `• ${name}`).join('\n')}\n\n` +
        `👑 *اللي رفعهم:* @${promoterJid.split('@')[0]}\n\n` +
        `📅 *التاريخ:* ${new Date().toLocaleString()}`;

      await sock.sendMessage(chatId, { 
        text: promotionMessage,
        mentions: [...userToPromote, promoterJid],
        ...channelInfo
      });
    } catch (error) {
      console.error('خطأ في أمر الترقيه:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ فشل في ترقية العضو/الأعضاء!',
        ...channelInfo
      }, { quoted: message });
    }
  },

  handlePromotionEvent
};