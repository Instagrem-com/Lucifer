const isOwnerOrSudo = require('../lib/isOwner');
const store = require('../lib/lightweight_store');
const { cleanJid } = require('../lib/isOwner');

module.exports = {
    command: 'اعدادات_البوت',
    aliases: ['config', 'setting'],
    category: 'اوامـࢪ الـمـطـوࢪ',
    description: 'عرض إعدادات البوت وإعدادات الجروب',
    usage: '.settings',
    
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;

        try {
            const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
            const isMe = message.key.fromMe;

            if (!isMe && !isOwner) {
                return await sock.sendMessage(chatId, { 
                    text: '❌ متاح بس للمالك/المساعد الرئيسي يشوف الإعدادات.' 
                }, { quoted: message });
            }
            
            const isGroup = chatId.endsWith('@g.us');
            const botMode = await store.getBotMode();
            const allSettings = await store.getAllSettings('global');
            
            const autoStatus = allSettings.autoStatus || { enabled: false };
            const autoread = allSettings.autoread || { enabled: false };
            const autotyping = allSettings.autotyping || { enabled: false };
            const pmblocker = allSettings.pmblocker || { enabled: false };
            const anticall = allSettings.anticall || { enabled: false };
            const autoReaction = allSettings.autoReaction || false;

            const getSt = (val) => val ? '✅' : '❌';

            let menuText = `╭━〔 *إعدادات MEGA* 〕━┈\n┃\n`;
            menuText += `┃ 👤 *المستخدم:* @${cleanJid(senderId)}\n`;
            menuText += `┃ 🤖 *وضع البوت:* ${botMode.toUpperCase()}\n`;
            menuText += `┃\n┣━〔 *الإعدادات العامة* 〕━┈\n`;
            menuText += `┃ ${getSt(autoStatus?.enabled)} *حالة تلقائية* 👀❤️\n`;
            menuText += `┃ ${getSt(autoread?.enabled)} *قراءة تلقائية* 👀❤️\n`;
            menuText += `┃ ${getSt(autotyping?.enabled)} *كتابة تلقائية* 👀❤️\n`;
            menuText += `┃ ${getSt(pmblocker?.enabled)} *حظر الرسائل الخاصة* 👀❤️\n`;
            menuText += `┃ ${getSt(anticall?.enabled)} *مكالمات ممنوعة*\n`;
            menuText += `┃ ${getSt(autoReaction)} *رد تلقائي* 👀❤️\n`;
            menuText += `┃\n`;

            if (isGroup) {
                const groupSettings = await store.getAllSettings(chatId);
                
                const groupAntilink = groupSettings.antilink || { enabled: false };
                const groupBadword = groupSettings.antibadword || { enabled: false };
                const groupAntitag = groupSettings.antitag || { enabled: false };
                const groupChatbot = groupSettings.chatbot || false;
                const groupWelcome = groupSettings.welcome || false;
                const groupGoodbye = groupSettings.goodbye || false;

                menuText += `┣━〔 *إعدادات الجروب* 〕━┈\n`;
                menuText += `┃ ${getSt(groupAntilink.enabled)} *حماية الروابط* 👀❤️\n`;
                menuText += `┃ ${getSt(groupBadword.enabled)} *حماية الكلمات الممنوعة* 👀❤️\n`;
                menuText += `┃ ${getSt(groupAntitag.enabled)} *حماية المنشن* 👀❤️\n`;
                menuText += `┃ ${getSt(groupChatbot)} *شات بوت* 👀❤️\n`;
                menuText += `┃ ${getSt(groupWelcome)} *رسائل ترحيب* 👀❤️\n`;
                menuText += `┃ ${getSt(groupGoodbye)} *رسائل وداع* 👀❤️\n`;
            } else {
                menuText += `┃ 💡 *ملاحظة:* _استخدم الأمر داخل الجروب عشان تشوف إعدادات الجروب._\n`;
            }

            menuText += `┃\n╰━━━━━━━━━━━━━━━━┈`;

            await sock.sendMessage(chatId, { 
                text: menuText,
                mentions: [senderId],
                contextInfo: {
                    externalAdReply: {
                        title: "لوحة إعدادات البوت",
                        body: "الحالة الحالية للإعدادات",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: message });

        } catch (error) {
            console.error('خطأ في إعدادات البوت:', error);
            await sock.sendMessage(chatId, { 
                text: '❌ حصل خطأ ومقدرتش أحمل الإعدادات.' 
            }, { quoted: message });
        }
    }
};