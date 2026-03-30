const fs = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const bannedFilePath = './data/banned.json';

async function getBannedUsers() {
    if (HAS_DB) {
        const banned = await store.getSetting('global', 'banned');
        return banned || [];
    } else {
        if (fs.existsSync(bannedFilePath)) {
            return JSON.parse(fs.readFileSync(bannedFilePath));
        }
        return [];
    }
}

async function saveBannedUsers(bannedUsers) {
    if (HAS_DB) {
        await store.saveSetting('global', 'banned', bannedUsers);
    } else {
        if (!fs.existsSync('./data')) {
            fs.mkdirSync('./data', { recursive: true });
        }
        fs.writeFileSync(bannedFilePath, JSON.stringify(bannedUsers, null, 2));
    }
}

module.exports = {
  command: 'رفع_حظر_استخدام_البوت',
  aliases: ['رفع_حظر'],
  category: 'اوامـࢪ الـمـطـوࢪ',
  description: 'Unban a user from using the bot',
  usage: '.unban [@user] or reply to message',
  ownerOnly: false,
  
  async handler(sock, message, args, context) {
    const { chatId, senderId, isGroup, channelInfo, senderIsOwnerOrSudo, isSenderAdmin, isBotAdmin } = context;
    
    if (isGroup) {
      if (!isBotAdmin) {
        await sock.sendMessage(chatId, { 
          text: 'خليني ادمن الاول ياحب 👀❤️', 
          ...channelInfo 
        }, { quoted: message });
        return;
      }
      if (!isSenderAdmin && !message.key.fromMe && !senderIsOwnerOrSudo) {
        await sock.sendMessage(chatId, { 
          text: 'الامر للادمن بس ياحب 👀❤️', 
          ...channelInfo 
        }, { quoted: message });
        return;
      }
    } else {
      if (!message.key.fromMe && !senderIsOwnerOrSudo) {
        await sock.sendMessage(chatId, { 
          text: 'للمطور بس ياعلق 👀❤️', 
          ...channelInfo 
        }, { quoted: message });
        return;
      }
    }
    
    let userToUnban;
    
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
      userToUnban = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
      userToUnban = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToUnban) {
      await sock.sendMessage(chatId, { 
        text: 'اعمل منشن للشخص او اغمل ريبلاي ع رساله بتاعتو 👀❤️', 
        ...channelInfo 
      }, { quoted: message });
      return;
    }

    try {
      const bannedUsers = await getBannedUsers();
      const index = bannedUsers.indexOf(userToUnban);
      
      if (index > -1) {
        bannedUsers.splice(index, 1);
        await saveBannedUsers(bannedUsers);
        
        await sock.sendMessage(chatId, { 
          text: `✅ تم رفع الحظر ✅@${userToUnban.split('@')[0]}!\n\nالتخزين 📝 : ${HAS_DB ? 'Database' : 'ملفات النظام'}`,
          mentions: [userToUnban],
          ...channelInfo 
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { 
          text: `@${userToUnban.split('@')[0]} مش معمول بان للشخص دا اصلا 😂❤️`,
          mentions: [userToUnban],
          ...channelInfo 
        }, { quoted: message });
      }
    } catch (error) {
      console.error('Error in unban command:', error);
      await sock.sendMessage(chatId, { 
        text: 'ف مشكله ياحب 😄❤️', 
        ...channelInfo 
      }, { quoted: message });
    }
  }
};


