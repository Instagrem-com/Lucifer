module.exports = {
    command: 'غير_اسم_الجروب',
    aliases: ['setname', 'groupname'],
    category: 'اوامـࢪ الـجـࢪوبـات',
    description: 'غير اسم الجروب',
    usage: '.setgname <الاسم الجديد>',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const name = args.join(' ').trim();

        if (!name) {
            await sock.sendMessage(chatId, {
                text: '❌ يا عم 😅 لازم تحط اسم جديد للجروب!\n\nUsage: `.setgname <الاسم>`'
            }, { quoted: message });
            return;
        }

        try {
            await sock.groupUpdateSubject(chatId, name);
            await sock.sendMessage(chatId, {
                text: `✅ تمام! اسم الجروب اتغير لـ:\n${name} 😎`
            }, { quoted: message });
        } catch (error) {
            console.error('خطأ في تغيير اسم الجروب:', error);
            await sock.sendMessage(chatId, {
                text: '❌ معلش 😔 مقدرتش أغير اسم الجروب\n\nاتأكد إن البوت مشرف في الجروب.'
            }, { quoted: message });
        }
    }
};