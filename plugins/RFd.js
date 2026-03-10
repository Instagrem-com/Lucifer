module.exports = {
    command: 'رفض_الكل',
    aliases: ['rejectall', 'رفض'],
    category: 'اوامـࢪ الـجـروبـات',
    description: 'يرفض كل طلبات الانضمام في الجروب ❌',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const participants = await sock.groupPendingParticipants(chatId);
            if (!participants?.length) {
                return sock.sendMessage(chatId, { text: 'مفيش طلبات انضمام دلوقتي. 👀❤️' }, { quoted: message });
            }
            for (const user of participants) {
                await sock.groupDenyInvite(chatId, user.id); // رفض كل واحد
            }
            await sock.sendMessage(chatId, { text: ` مسحت كل طلبات الانضام ${participants.length} 👀❤️` }, { quoted: message });
        } catch (err) {
            console.error(err);
            await sock.sendMessage(chatId, { text: 'حصل غلطة في رفض الطلبات ❌.' }, { quoted: message });
        }
    }
};