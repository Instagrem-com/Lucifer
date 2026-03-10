const { setAntitag, getAntitag, removeAntitag } = require('../lib/index');

async function handleTagDetection(sock, chatId, message, senderId) {
    try {
        const antitagSetting = await getAntitag(chatId, 'تفعيل');
        if (!antitagSetting || !antitagSetting.enabled) return;

        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        const messageText = (
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption ||
            ''
        );

        const textMentions = messageText.match(/@[\d+\s\-()~.]+/g) || [];
        const numericMentions = messageText.match(/@\d{10,}/g) || [];
        const allMentions = [...new Set([...mentionedJids, ...textMentions, ...numericMentions])];
        
        const uniqueNumericMentions = new Set();
        numericMentions.forEach(mention => {
            const numMatch = mention.match(/@(\d+)/);
            if (numMatch) uniqueNumericMentions.add(numMatch[1]);
        });
        
        const mentionedJidCount = mentionedJids.length;
        const numericMentionCount = uniqueNumericMentions.size;
        const totalMentions = Math.max(mentionedJidCount, numericMentionCount);

        if (totalMentions >= 3) {
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants || [];
            const mentionThreshold = Math.ceil(participants.length * 0.5);
            
            const hasManyNumericMentions = numericMentionCount >= 10 || 
                                          (numericMentionCount >= 5 && numericMentionCount >= mentionThreshold);
            
            if (totalMentions >= mentionThreshold || hasManyNumericMentions) {
                const action = antitagSetting.action || 'حذف';
                
                if (action === 'حذف') {
                    await sock.sendMessage(chatId, {
                        delete: {
                            remoteJid: chatId,
                            fromMe: false,
                            id: message.key.id,
                            participant: senderId
                        }
                    });
                    
                    await sock.sendMessage(chatId, {
                        text: `⚠️ *كشف منشن شامل!*\n\n@${senderId.split('@')[0]}, ممنوع منشن كل الناس!`,
                        mentions: [senderId]
                    });
                    
                } else if (action === 'طرد') {
                    await sock.sendMessage(chatId, {
                        delete: {
                            remoteJid: chatId,
                            fromMe: false,
                            id: message.key.id,
                            participant: senderId
                        }
                    });

                    try {
                        await sock.groupParticipantsUpdate(chatId, [senderId], "remove");
                        await sock.sendMessage(chatId, {
                            text: `🚫 *تم طرد المستخدم!*\n\n@${senderId.split('@')[0]} اتشال من الجروب علشان منشن كل الناس.`,
                            mentions: [senderId]
                        });
                    } catch (error) {
                        await sock.sendMessage(chatId, {
                            text: `⚠️ فشلنا نشيل المستخدم. اتأكد إن البوت أدمن.`
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in tag detection:', error);
    }
}

module.exports = {
    command: 'اشـتـرك_ف_الـقـنـاة.❤️',
    aliases: ['ممنوع_المنشنات', 'antiat', 'tagblock'],
    category: '',
    description: 'مانع منشن كل الأعضاء في الجروب',
    usage: '.ممنوع_المنشن <تفعيل|تعطيل|ضبط|عرض>',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const action = args[0]?.toLowerCase();

        if (!action) {
            const config = await getAntitag(chatId, 'تفعيل');
            await sock.sendMessage(chatId, {
                text: `*🏷️ إعداد مانع المنشن*\n\n` +
                      `*الحالة دلوقتي:* ${config?.enabled ? 'شغال ✅' : 'واقف ❌'}\n` +
                      `*الإجراء الحالي:* ${config?.action || 'مفيش حاجة متضبطة'}\n\n` +
                      `*الأوامر:*\n` +
                      `• \`.ممنوع_المنشن تفعيل\` - شغّل المانع ✅\n` +
                      `• \`.ممنوع_المنشن تعطيل\` - وقف المانع ❌\n` +
                      `• \`.ممنوع_المنشن ضبط حذف\` - احذف رسائل منشن شامل 🗑️\n` +
                      `• \`.ممنوع_المنشن ضبط طرد\` - اطرد أي حد يعمل منشن شامل 👢\n\n` +
                      `*كشف:*\n` +
                      `• يكتشف منشن أكتر من 50% من الأعضاء\n` +
                      `• يحمي من سبام المنشن`
            }, { quoted: message });
            return;
        }

        switch (action) {
            case 'تفعيل':
                const existingConfig = await getAntitag(chatId, 'تفعيل');
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, {
                        text: '⚠️ مانع المنشن شغال من قبل 😂❤️'
                    }, { quoted: message });
                    return;
                }
                const result = await setAntitag(chatId, 'تفعيل', 'حذف');
                await sock.sendMessage(chatId, {
                    text: result 
                        ? '✅ مانع المنشن اتفعل 👀❤️\nالإجراء الافتراضي: حذف رسائل منشن شامل 🗑️' 
                        : '❌ في مشكلة ف تفعيل مانع المنشن 🙂'
                }, { quoted: message });
                break;

            case 'تعطيل':
                await removeAntitag(chatId, 'تفعيل');
                await sock.sendMessage(chatId, {
                    text: '❌ مانع المنشن توقف 👀❤️\nدلوقتي الناس تقدر تعمل منشن شامل على راحتهم 😉❤️'
                }, { quoted: message });
                break;

            case 'ضبط':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, {
                        text: '❌ استنى يا معلم، لازم تحدد الإجراء\nطريقة الاستخدام: `.ممنوع_المنشن ضبط حذف|طرد`'
                    }, { quoted: message });
                    return;
                }
                const setAction = args[1].toLowerCase();
                if (!['حذف','طرد'].includes(setAction)) {
                    await sock.sendMessage(chatId, {
                        text: '❌ الإجراء اللي اخترته مش صح 🙂\nاختار واحد من دول: حذف أو طرد 👀❤️'
                    }, { quoted: message });
                    return;
                }
                const setResult = await setAntitag(chatId, 'تفعيل', setAction);
                const actionDescriptions = {
                    حذف: 'احذف رسائل المنشن الشامل وابعث تحذير للمستخدمين',
                    طرد: 'احذف الرسائل واطرد الشخص من الجروب'
                };
                await sock.sendMessage(chatId, {
                    text: setResult 
                        ? `✅ اتظبط الإجراء 👀❤️\n${setAction} - ${actionDescriptions[setAction]}` 
                        : '❌ في مشكلة ف ضبط الإجراء'
                }, { quoted: message });
                break;

            case 'عرض':
                const status = await getAntitag(chatId, 'تفعيل');
                await sock.sendMessage(chatId, {
                    text: `*🏷️ حالة مانع المنشن*\n\n` +
                          `*الحالة دلوقتي:* ${status?.enabled ? 'شغال ✅' : 'واقف ❌'}\n` +
                          `*الإجراء الحالي:* ${status?.action || 'مفيش حاجة متضبطة'}\n\n` +
                          `*اللي بيحصل لو حد عمل منشن شامل:*\n` +
                          `${status?.action === 'حذف' ? '• الرسالة هتمسح 🗑️\n• المستخدم هيتبعتلو تحذير ⚠️' : ''}` +
                          `${status?.action === 'طرد' ? '• الرسالة هتمسح 🗑️\n• المستخدم هيتشال من الجروب 👢' : ''}\n\n` +
                          `*كشف:* 50% من أعضاء الجروب أو 10+ منشن`
                }, { quoted: message });
                break;

            default:
                await sock.sendMessage(chatId, {
                    text: '❌ الأمر اللي كتبته مش صحيح\nاستخدم `.ممنوع_المنشن` عشان تشوف كل الاختيارات 😎'
                }, { quoted: message });
        }
    },

    handleTagDetection
};
