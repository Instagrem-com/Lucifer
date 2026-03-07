const store = require('../lib/lightweight_store');
const isOwnerOrSudo = require('../lib/isOwner');
const isAdmin = require('../lib/isAdmin');

async function setAntilink(chatId, type, action) {
    try {
        await store.saveSetting(chatId, 'antilink', {
            enabled: true,
            action: action,
            type: type
        });
        return true;
    } catch (error) {
        console.error('Error setting antilink:', error);
        return false;
    }
}

async function getAntilink(chatId, type) {
    try {
        const settings = await store.getSetting(chatId, 'antilink');
        return settings || null;
    } catch (error) {
        console.error('Error getting antilink:', error);
        return null;
    }
}

async function removeAntilink(chatId, type) {
    try {
        await store.saveSetting(chatId, 'antilink', {
            enabled: false,
            action: null,
            type: null
        });
        return true;
    } catch (error) {
        console.error('Error removing antilink:', error);
        return false;
    }
}

async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
    try {
        const config = await getAntilink(chatId, 'تفعيل');
        if (!config?.enabled) return;

        // Check if sender is owner or sudo
        const isOwnerSudo = await isOwnerOrSudo(senderId, sock, chatId);
        if (isOwnerSudo) return;

        // Check if sender is admin
        try {
            const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
            if (isSenderAdmin) return;
        } catch (e) {}

        const action = config.action || 'حذف';
        let shouldAct = false;
        let linkType = '';

        const linkPatterns = {
            whatsappGroup: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/i,
            whatsappChannel: /wa\.me\/channel\/[A-Za-z0-9]{20,}/i,
            telegram: /t\.me\/[A-Za-z0-9_]+/i,
            allLinks: /https?:\/\/\S+|www\.\S+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?/i,
        };

        if (linkPatterns.whatsappGroup.test(userMessage)) {
            shouldAct = true;
            linkType = 'جروب واتساب';
        } else if (linkPatterns.whatsappChannel.test(userMessage)) {
            shouldAct = true;
            linkType = 'قناة واتساب';
        } else if (linkPatterns.telegram.test(userMessage)) {
            shouldAct = true;
            linkType = 'تليجرام';
        } else if (linkPatterns.allLinks.test(userMessage)) {
            shouldAct = true;
            linkType = 'لينك';
        }

        if (!shouldAct) return;

        const messageId = message.key.id;
        const participant = message.key.participant || senderId;

        if (action === 'حذف' || action === 'طرد') {
            try {
                await sock.sendMessage(chatId, {
                    delete: { 
                        remoteJid: chatId, 
                        fromMe: false, 
                        id: messageId, 
                        participant: participant 
                    }
                });
            } catch (error) {
                console.error('Failed to delete message:', error);
            }
        }

        if (action === 'تحذير' || action === 'حذف') {
            await sock.sendMessage(chatId, {
                text: `⚠️ تحذير من مانع اللينكات\n\n@${senderId.split('@')[0]}, متبعتش ${linkType} تاني!`,
                mentions: [senderId]
            });
        }

        if (action === 'طرد') {
            try {
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                await sock.sendMessage(chatId, {
                    text: `🚫 @${senderId.split('@')[0]} اتشال من الجروب علشان بعث ${linkType}!`,
                    mentions: [senderId]
                });
            } catch (error) {
                console.error('Failed to kick user:', error);
                await sock.sendMessage(chatId, {
                    text: '⚠️ فشلنا نشيل المستخدم. اتأكد إن البوت أدمن في الجروب'
                });
            }
        }

    } catch (error) {
        console.error('Error in link detection:', error);
    }
}

module.exports = {
    command: 'ممنوع_اللينكات',
    aliases: ['ممنوع_اللينك'],
    category: 'admin',
    description: 'مانع اللينكات في الجروب',
    usage: '.ممنوع_اللينكات <تفعيل|تعطيل|ضبط|عرض>',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const action = args[0]?.toLowerCase();

        if (!action) {
            const config = await getAntilink(chatId, 'تفعيل');
            await sock.sendMessage(chatId, {
                text: `*إعداد مانع اللينكات*\n\n` +
      `*الحالة دلوقتي:* ${config?.enabled ? 'شغال ✅' : 'واقف ❌'}\n` +
      `*الإجراء الحالي:* ${config?.action || 'مفيش حاجة متضبطة'}\n\n` +
      `*الأوامر:*\n` +
      `• \`.ممنوع_اللينكات تفعيل\` - شغّل مانع اللينكات ✅\n` +
      `• \`.ممنوع_اللينكات تعطيل\` - وقف مانع اللينكات ❌\n` +
      `• \`.ممنوع_اللينكات ضبط حذف\` - امسح أي رسالة فيها لينك 🗑️\n` +
      `• \`.ممنوع_اللينكات ضبط طرد\` - اطرد أي حد يبعث لينك 👢\n` +
      `• \`.ممنوع_اللينكات ضبط تحذير\` - حبّر اللي يبعث لينك ⚠️\n\n` +
      `*اللينكات اللي متأمّنة:*\n` +
      `• جروبات واتساب 🌐\n` +
      `• قنوات واتساب 📢\n` +
      `• تليجرام ✈️\n` +
      `• أي لينكات تانية 🔗\n\n` +
      `*ملاحظة:* الأدمن، صاحب الجروب والمطورين على مهلكم 😉`
            }, { quoted: message });
            return;
        }

        switch (action) {
            case 'تفعيل':
                const existingConfig = await getAntilink(chatId, 'تفعيل');
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, {
                        text: '⚠️ مانع اللينكات شغال من قبل 😂❤️'
                    }, { quoted: message });
                    return;
                }
                const result = await setAntilink(chatId, 'تفعيل', 'حذف');
                await sock.sendMessage(chatId, {
                    text: result 
      ? 'مانع اللينكات اتفعل 👀❤️\nالإجراء الافتراضي: حذف الرسائل 🗑️\nالمعفيين: الأدمن صاحب الجروب والمطور 😉❤️' 
      : 'في مشكلة ف تفعيل مانع اللينكات 🙂'
                }, { quoted: message });
                break;

            case 'تعطيل':
                await removeAntilink(chatId, 'تفعيل');
                await sock.sendMessage(chatId, {
                    text: 'مانع اللينكات توقف 👀❤️\nدلوقتي الناس تقدر تبعت لينكات على راحتهم 😉❤️'
                }, { quoted: message });
                break;

            case 'ضبط':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, {
                        text: 'استنى يا معلم، لازم تحدد الإجراء ❌\nطريقة الاستخدام: `.ممنوع_اللينكات ضبط حذف|طرد|تحذير`'
                    }, { quoted: message });
                    return;
                }
                const setAction = args[1].toLowerCase();
                if (!['حذف','طرد','تحذير'].includes(setAction)) {
                    await sock.sendMessage(chatId, {
                        text: 'الإجراء اللي اخترته مش صح 🙂\nاختار واحد من دول: حذف, طرد, أو تحذير 👀❤️'
                    }, { quoted: message });
                    return;
                }
                const setResult = await setAntilink(chatId, 'تفعيل', setAction);
                const actionDescriptions = {
                    حذف: 'امسح الرسائل وابعث تحذير للمستخدمين',
                    طرد: 'امسح الرسائل واطرد الشخص من الجروب',
                    تحذير: 'ابعت تحذير للمستخدم بس'
                };
                await sock.sendMessage(chatId, {
                    text: setResult 
      ? `خلاص اتظبط الإجراء 👀❤️\n${setAction} - ${actionDescriptions[setAction]}\nالمعفيين: الأدمن صاحب الجروب والمطور 😉❤️` 
      : 'في مشكلة ف ضبط الإجراء ❌'
                }, { quoted: message });
                break;

            case 'عرض':
                const status = await getAntilink(chatId, 'تفعيل');
                await sock.sendMessage(chatId, {
                    text: `*حالة مانع اللينكات*\n\n` +
      `*الحالة دلوقتي:* ${status?.enabled ? 'شغال ✅' : 'واقف ❌'}\n` +
      `*الإجراء الحالي:* ${status?.action || 'مفيش حاجة متضبطة'}\n\n` +
      `*اللي بيحصل لو حد بعث لينك:*\n` +
      `${status?.action === 'حذف' ? '• الرسالة هتمسح 🗑️\n• المستخدم هيتبعتلو تحذير ⚠️' : ''}` +
      `${status?.action === 'طرد' ? '• الرسالة هتمسح 🗑️\n• المستخدم هيتشال من الجروب 👢' : ''}` +
      `${status?.action === 'تحذير' ? '• المستخدم هيتبعتلو تحذير ⚠️\n• الرسالة هتفضل موجودة 📌' : ''}\n\n` +
      `*المعفيين:* الأدمن، صاحب الجروب والمطور 😉❤️`
                }, { quoted: message });
                break;

            default:
                await sock.sendMessage(chatId, {
                    text: 'الأمر اللي كتبته مش صحيح ❌\nاستخدم `.ممنوع_اللينكات` عشان تشوف كل الاختيارات 😎'
                }, { quoted: message });
        }
    },

    handleLinkDetection,
    setAntilink,
    getAntilink,
    removeAntilink
};
