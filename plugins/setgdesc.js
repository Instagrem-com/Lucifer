module.exports = {
    command: 'غير_وصف_الجروب',
    aliases: ['setdesc', 'groupdesc'],
    category: 'اوامـࢪ الـجـࢪوبـات',
    description: 'غير وصف الجروب',
    usage: '.setgdesc <الوصف الجديد>',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const desc = args.join(' ').trim();

        if (!desc) {
            await sock.sendMessage(chatId, {
                text: ' يا عم  لازم تكتب وصف جديد للجروب 😂😂\n\nالاستخدام 📝:\n `.غير_وصف_الجروب <الوصف>`'
            }, { quoted: message });
            return;
        }

        try {
            await sock.groupUpdateDescription(chatId, desc);
            await sock.sendMessage(chatId, {
                text: 'الوصف اتغير ياحب 😂❤️'
            }, { quoted: message });
        } catch (error) {
            console.error('خطأ في تحديث وصف الجروب:', error);
            await sock.sendMessage(chatId, {
                text: 'ف مشكله اتاكد اني ادمن ياحب 😄❤️'
            }, { quoted: message });
        }
    }
};