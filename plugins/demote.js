async function handleDemotionEvent(sock, groupId, participants, author) {
    try {
        if (!Array.isArray(participants) || participants.length === 0) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));

        const demotedUsernames = await Promise.all(participants.map(async jid => {
            const jidString = typeof jid === 'string' ? jid : (jid.id || jid.toString());
            return `@${jidString.split('@')[0]}`;
        }));

        let demotedBy;
        let mentionList = participants.map(jid => {
            return typeof jid === 'string' ? jid : (jid.id || jid.toString());
        });

        if (author && author.length > 0) {
            const authorJid = typeof author === 'string' ? author : (author.id || author.toString());
            demotedBy = `@${authorJid.split('@')[0]}`;
            mentionList.push(authorJid);
        } else {
            demotedBy = 'النظام';
        }
        await new Promise(resolve => setTimeout(resolve, 1000));

        const demotionMessage = `*⎝⎝⛥ 𝐋𝐔𝐂𝐈𝐅𝐄𝐑 ⛥⎠⎠*\n\n` +
            `*الاعضاء اللي اتشال منهم الادمن:*\n` +
            `${demotedUsernames.map(name => `• ${name}`).join('\n')} 😈\n\n` +
            `*بواسطة:* ${demotedBy} 👑\n\n` +
            `*التاريخ:* ${new Date().toLocaleString()} 📅`;
        
        await sock.sendMessage(groupId, {
            text: demotionMessage,
            mentions: mentionList
        });
    } catch (error) {
        console.error('Error handling demotion event:', error);
        if (error.data === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

module.exports = {
    command: 'تنزيل',
    aliases: ['نزل', 'شيل_ادمن'],
    category: 'admin',
    description: 'تنزيل عضو من ادمن لعضو عادي',
    usage: '.تنزيل @الشخص او رد على رسالته',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const isBotAdmin = context.isBotAdmin;

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: '*ارفع البوت ادمن الاول يا صاحبي* ❌'
            }, { quoted: message });
            return;
        }

        let userToDemote = [];
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        
        if (mentionedJids && mentionedJids.length > 0) {
            userToDemote = mentionedJids;
        }
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToDemote = [message.message.extendedTextMessage.contextInfo.participant];
        }
        
        if (userToDemote.length === 0) {
            await sock.sendMessage(chatId, { 
                text: '*منشن الشخص الاول او اعمل رد على رسالته عشان اعرف انزله*\n\nالاستخدام: `.تنزيل @الشخص` ❌'
            }, { quoted: message });
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await sock.groupParticipantsUpdate(chatId, userToDemote, "demote");
            
            const usernames = await Promise.all(userToDemote.map(async jid => {
                return `@${jid.split('@')[0]}`;
            }));
            
            await new Promise(resolve => setTimeout(resolve, 1000));

            const demotionMessage = `*⎝⎝⛥ 𝐋𝐔𝐂𝐈𝐅𝐄𝐑 ⛥⎠⎠*\n\n` +
                `*العضو اللي اتشال من الادمن:*\n` +
                `${usernames.map(name => `• ${name}`).join('\n')} 😈\n\n` +
                `*بواسطة:* @${message.key.participant ? message.key.participant.split('@')[0] : message.key.remoteJid.split('@')[0]} 👑\n\n` +
                `*التاريخ:* ${new Date().toLocaleString()} 📅`;
            
            await sock.sendMessage(chatId, { 
                text: demotionMessage,
                mentions: [...userToDemote, message.key.participant || message.key.remoteJid]
            }, { quoted: message });
        } catch (error) {
            console.error('Error in demote command:', error);
            if (error.data === 429) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                try {
                    await sock.sendMessage(chatId, { 
                        text: '*البوت مضغوط شوية دلوقتي جرب كمان شوية* ⏳'
                    }, { quoted: message });
                } catch (retryError) {
                    console.error('Error sending retry message:', retryError);
                }
            } else {
                try {
                    await sock.sendMessage(chatId, { 
                        text: '*معرفتش انزله من الادمن يمكن البوت مش اعلى منه* ❌'
                    }, { quoted: message });
                } catch (sendError) {
                    console.error('Error sending error message:', sendError);
                }
            }
        }
    },

    handleDemotionEvent
};