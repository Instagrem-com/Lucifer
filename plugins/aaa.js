module.exports = {
    command: 'قبول_الطلبات',
    aliases: ['قبولالكل'],
    category: 'اوامـࢪ الـجـࢪوبـات',
    description: 'قبول كل طلبات الانضمام للجروب',
    groupOnly: true,
    adminOnly: true,
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {

        const chatId = context.chatId || message.key.remoteJid;

        try {

            const requests = await sock.groupRequestParticipantsList(chatId);

            if (!requests || requests.length === 0) {
                await sock.sendMessage(chatId,{
                    text:"مفيش طلبات انضمام حاليا 👀"
                },{quoted:message})
                return;
            }

            const users = requests.map(r => r.jid);

            await sock.groupRequestParticipantsUpdate(
                chatId,
                users,
                "approve"
            );

            await sock.sendMessage(chatId,{
                text:`تم قبول ${users.length} طلب انضمام ✅`
            },{quoted:message})

        } catch(err){
            console.log(err)

            await sock.sendMessage(chatId,{
                text:"حصل خطأ في قبول الطلبات 🙂"
            },{quoted:message})
        }

    }
};
