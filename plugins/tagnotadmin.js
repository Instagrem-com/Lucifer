const tagNonAdmins = {
    command: 'منشن_الادمن',
    aliases: ['tagmembers', 'tagnon'],
    category: 'اوامـࢪ الـجـࢪوبـات',
    description: 'Tag all non-admin members in the group',
    usage: '.tagnotadmin',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants || [];
            const nonAdmins = participants.filter(p => !p.admin).map(p => p.id);

            if (nonAdmins.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: 'No non-admin members to tag.'
                }, { quoted: message });
            }

            let text = '🔊 *Hello Everyone:*\n\n';
            nonAdmins.forEach(jid => {
                text += `@${jid.split('@')[0]}\n`;
            });

            await sock.sendMessage(chatId, {
                text,
                mentions: nonAdmins
            }, { quoted: message });

        } catch (error) {
            console.error('Error in tagnotadmin command:', error);
            await sock.sendMessage(chatId, {
                text: 'Failed to tag non-admin members.'
            }, { quoted: message });
        }
    }
};

module.exports = tagNonAdmins;