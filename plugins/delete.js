const store = require('../lib/lightweight_store');

module.exports = {
    command: 'مسح',
    aliases: ['delreact', 'rmreact'],
    category: 'اوامـࢪ الـجـࢪوبـات',
    description: 'يمسح أي رسالة عملت عليها ربلاي 👀❤️',
    usage: '.مسح (رد على الرسالة)',
    adminOnly: true,

    async handler(sock, message, args, context = {}) {

        const chatId = context.chatId || message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const isBotAdmin = context.isBotAdmin;

        // لو جروب والبوت مش ادمن
        if (isGroup && !isBotAdmin) {
            await sock.sendMessage(chatId,{
                text:'*البوت لازم يكون أدمن عشان يمسح الرسائل* 😊❤️'
            },{quoted:message})
            return
        }

        // التأكد إن المستخدم رد على رسالة
        const ctxInfo = message.message?.extendedTextMessage?.contextInfo || {};
        const repliedMsgId = ctxInfo.stanzaId;
        const repliedParticipant = ctxInfo.participant;

        if (!repliedMsgId) {
            await sock.sendMessage(chatId,{
                text:'*رد على الرسالة اللي عايز تمسحها يـاجـب* 😄❤️'
            },{quoted:message})
            return
        }

        try {

            await sock.sendMessage(chatId,{
                delete:{
                    remoteJid: chatId,
                    fromMe:false,
                    id: repliedMsgId,
                    participant: repliedParticipant || chatId
                }
            })

        } catch (e) {

            console.error('Error deleting message:', e)

            await sock.sendMessage(chatId,{
                text:'*فشل مسح الرسالة* 😄'
            },{quoted:message})

        }
    }
};