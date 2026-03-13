module.exports = {
    command: 'طرد_الكل',
    aliases: ['خرج_الكل'],
    category: 'اوامـࢪ الـجـࢪوبـات',
    description: 'يطرد كل أعضاء الجروب',
    groupOnly: true,
    adminOnly: true,
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {

        const chatId = context.chatId || message.key.remoteJid;

        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata.participants || [];

        // استخراج رقم البوت الحقيقي
        const botNumber = sock.user.id.split('@')[0].split(':')[0];

        // فلترة الأعضاء (عدم طرد البوت)
        const users = participants
        .filter(p => {
            const memberNumber = p.id.split('@')[0].split(':')[0];
            return memberNumber !== botNumber;
        })
        .map(p => p.id);

        if (users.length === 0) {
            await sock.sendMessage(chatId,{
                text:"مفيش أعضاء أقدر أطردهم 👀"
            },{quoted:message})
            return;
        }

        await sock.sendMessage(chatId,{
            text:`بدأ تنظيف الجروب 🧹\nعدد الأعضاء: ${users.length}`
        },{quoted:message})

        const batchSize = 5;

        for (let i = 0; i < users.length; i += batchSize) {

            const batch = users.slice(i, i + batchSize);

            try {
                await sock.groupParticipantsUpdate(chatId, batch, "remove");
            } catch(e) {
                console.log('Kick error:', e);
            }

            await new Promise(r => setTimeout(r, 1500));
        }

        await sock.sendMessage(chatId,{
            text:"تم تنظيف الجروب بالكامل 🗑️😂"
        })

    }
};
