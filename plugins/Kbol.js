module.exports = {
    command: 'قبول_الكل',
    aliases: ['acceptall', 'قبول'],
    category: 'اوامـࢪ الـجـروبـات',
    description: 'يقبل كل طلبات الانضمام في الجروب 👥',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const participants = await sock.groupPendingParticipants(chatId); // جميع الطلبات المعلقة
            if (!participants?.length) {
                return sock.sendMessage(chatId, { text: ' مفيش طلبات انضمام دلوقتي. 👀❤️' }, { quoted: message });
            }
            for (const user of participants) {
                await sock.groupAcceptInvite(chatId, user.id); // قبول كل واحد
            }
            await sock.sendMessage(chatId, { text: `قبلت كل طلبات الانضام ${participants.length} 👀❤️` }, { quoted: message });
        } catch (err) {
            console.error(err);
            await sock.sendMessage(chatId, { text: ' حصل غلطة في قبول الطلبات ❌.' }, { quoted: message });
        }
    }
};