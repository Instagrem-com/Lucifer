module.exports = {
    command: 'طرد_الكل',
    aliases: ['kickall', 'برا_الكل'],
    category: 'اوامـࢪ الـجـروبـات',
    description: 'يطرد كل أعضاء الجروب 👀',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants;

            for (const user of participants) {
                if (!user.admin) { // مش طرد الادمن
                    await sock.groupRemove(chatId, [user.id]);
                    await new Promise(r => setTimeout(r, 1000)); // تأخير بسيط
                }
            }

            await sock.sendMessage(chatId, { text: ' تم طرد كل الأعضاء غير الادمنز 👀❤️' }, { quoted: message });
        } catch (err) {
            console.error(err);
            await sock.sendMessage(chatId, { text: '❌ حصل خطأ أثناء الطرد.' }, { quoted: message });
        }
    }
};