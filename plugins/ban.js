const fs = require('fs');
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
        if (fs.existsSync(bannedFilePath)) return JSON.parse(fs.readFileSync(bannedFilePath));
        return [];
    }
}

async function saveBannedUsers(bannedUsers) {
    if (HAS_DB) {
        await store.saveSetting('global', 'banned', bannedUsers);
    } else {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        fs.writeFileSync(bannedFilePath, JSON.stringify(bannedUsers, null, 2));
    }
}

async function isUserBanned(userId) {
    const bannedUsers = await getBannedUsers();
    return bannedUsers.includes(userId);
}

module.exports = {
    command: 'حظر_استخدام_البوت',
    aliases: ['ban', 'block', 'حظر_شخص'],
    category: 'اوامـࢪ الـجـࢪوبـات',
    description: 'تحظر شخص من استخدام البوت',
    usage: '.حظر @اليوزر او الرد على رسالته',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const isGroup = context.isGroup;

        let userToBan;
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            userToBan = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToBan = message.message.extendedTextMessage.contextInfo.participant;
        }

        if (!userToBan) {
            await sock.sendMessage(chatId, {
                text: ' لازم تذكر الشخص أو ترد على رسالته 😊❤️\n\nالاستخدام 📝: `.حظر_استخدام_البوت @user` أو ربلاي ع رساله ب `.حظر_استخدام_البوت` 👀❤️',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        try {
            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            if (userToBan === botId) {
                await sock.sendMessage(chatId, {
                    text: ' مستحيل تحظر البوت 😊❤️',
                    ...channelInfo
                }, { quoted: message });
                return;
            }
        } catch (e) {}

        try {
            let bannedUsers = await getBannedUsers();

            if (!bannedUsers.includes(userToBan)) {
                bannedUsers.push(userToBan);
                await saveBannedUsers(bannedUsers);

                await sock.sendMessage(chatId, {
                    text: ` تم حظر الشخص بنجاح 👀❤️\n\n@${userToBan.split('@')[0]} اتحظر من استخدام البوت 😄❤️\n\nالتخزين 📝: ${HAS_DB ? 'Database' : 'ملغات النظام 💻'}`,
                    mentions: [userToBan],
                    ...channelInfo
                }, { quoted: message });

            } else {
                await sock.sendMessage(chatId, {
                    text: ` الشخص ده اتحظر قبل كده 👀\n\n@${userToBan.split('@')[0]} أصلاً محظور 🙂`,
                    mentions: [userToBan],
                    ...channelInfo
                }, { quoted: message });
            }

        } catch (error) {
            console.error('حصل خطأ في أمر الحظر 😄', error);
            await sock.sendMessage(chatId, {
                text: ' فشل في حظر الشخص، جرب تاني ❌',
                ...channelInfo
            }, { quoted: message });
        }
    }
};

module.exports.getBannedUsers = getBannedUsers;
module.exports.saveBannedUsers = saveBannedUsers;
module.exports.isUserBanned = isUserBanned;