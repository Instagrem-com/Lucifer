module.exports = {
    command: 'رفض_الطلبات',
    aliases: ['مسحالطلبات'],
    category: 'اوامـࢪ الـجـࢪوبـات',
    description: 'رفض كل طلبات الانضمام',
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
                "reject"
            );

            await sock.sendMessage(chatId,{
                text:`تم رفض ${users.length} طلب انضمام ❌`
            },{quoted:message})

        } catch(err){
            console.log(err)

            await sock.sendMessage(chatId,{
                text:"حصل خطأ في رفض الطلبات 🙂"
            },{quoted:message})
        }

    }
};
