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
                text: 'ياعم اكتب اسم الجروب 😂😂\n\nالاستخدام 📝 :\n `.غير_اسم_الجروب <الاسم>`'
            }, { quoted: message });
            return;
        }

        try {
            await sock.groupUpdateSubject(chatId, name);
            await sock.sendMessage(chatId, {
                text: `اسم الجروب اتغير ياحب ل\n${name} 👀❤️`
            }, { quoted: message });
        } catch (error) {
            console.error('خطأ في تغيير اسم الجروب:', error);
            await sock.sendMessage(chatId, {
                text: 'اتاكد اني ادمن ياحب 😄❤️.'
            }, { quoted: message });
        }
    }
};