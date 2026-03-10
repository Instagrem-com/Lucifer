module.exports = {
    command: 'اضافه',
    aliases: ['دخلو', 'ادد', 'ضيف'],
    category: 'اوامـࢪ الـجـࢪوبـات',
    description: 'إضافة عضو للجروب',
    usage: '.اضافه <رقم> ',
    groupOnly: 'true',
    adminOnly: 'true',

    async handler(sock, message, args, context = {}) {
        const { chatId, channelInfo } = context;

        let targetNumber = null;

        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage;
            const quotedParticipant = message.message.extendedTextMessage.contextInfo.participant;

            if (quotedMsg.contactMessage) {
                const vcard = quotedMsg.contactMessage.vcard;
                const phoneMatch = vcard.match(/waid=(\d+)/);
                if (phoneMatch) {
                    targetNumber = phoneMatch[1];
                } else {
                    const telMatch = vcard.match(/TEL.*?:(\+?\d+)/);
                    if (telMatch) {
                        targetNumber = telMatch[1].replace(/\D/g, '');
                    }
                }
            }
            else if (quotedMsg.conversation || quotedMsg.extendedTextMessage?.text) {
                const text = quotedMsg.conversation || quotedMsg.extendedTextMessage.text;
                const numberMatch = text.match(/(\+?\d{10,15})/);
                if (numberMatch) {
                    targetNumber = numberMatch[1].replace(/\D/g, '');
                }
            }
            else if (quotedParticipant) {
                targetNumber = quotedParticipant.split('@')[0];
            }
        }

        if (!targetNumber && args.length > 0) {
            const input = args.join(' ');
            const cleaned = input.replace(/[^\d+]/g, '');
            targetNumber = cleaned.replace(/^\+/, '');
        }

        if (!targetNumber) {
            return await sock.sendMessage(chatId, {
                text: ` 📝 *اكتب رقم للإضافة* 📝

 💻 *طريقة الاستخدام* 💻 
 
• \`.اضافه 201501728150\`
• \`.اضافه +201501728150\`
• \`.اضافه +20 1501728150\``,
                ...channelInfo
            }, { quoted: message });
        }

        if (!targetNumber.startsWith('1') && !targetNumber.startsWith('2') && !targetNumber.startsWith('3') && 
            !targetNumber.startsWith('4') && !targetNumber.startsWith('5') && !targetNumber.startsWith('6') && 
            !targetNumber.startsWith('7') && !targetNumber.startsWith('8') && !targetNumber.startsWith('9')) {
            return await sock.sendMessage(chatId, {
                text: '*الرقم مش صح 😄*\n\nيرجى إضافة كود الدولة 👀❤️.\nمثال 📝 : 201501728150',
                ...channelInfo
            }, { quoted: message });
        }

        const targetJid = `${targetNumber}@s.whatsapp.net`;

        try {
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants.map(p => p.id);
            
            if (participants.includes(targetJid)) {
                return await sock.sendMessage(chatId, {
                    text: `*المستخدم موجود بالفعل في الجروب 👀❤️*\n\n${targetNumber}`,
                    ...channelInfo
                }, { quoted: message });
            }

            const result = await sock.groupParticipantsUpdate(
                chatId,
                [targetJid],
                'add'
            );

            if (result[0].status === '200') {
                await sock.sendMessage(chatId, {
                    text: `*تم الإضافة بنجاح* 👀❤️\n\n@${targetNumber}`,
                    mentions: [targetJid],
                    ...channelInfo
                }, { quoted: message });
            } else if (result[0].status === '403') {
                await sock.sendMessage(chatId, {
                    text: `*فشل في إضافة المستخدم 🙃*\n\n*السبب 👇🏼*\n إعدادات الخصوصية تمنع إضافته للجروبات 😄❤️\n\n*الحل 👀❤️*\n ابعت له رابط دعوة الجروب 😊❤️`,
                    ...channelInfo
                }, { quoted: message });
            } else if (result[0].status === '408') {
                await sock.sendMessage(chatId, {
                    text: ` *تم إرسال الدعوة 👀❤️*\n\nالمستخدم بحاجة لقبول الدعوة للانضمام 😁👀`,
                    ...channelInfo
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: `*فشل في إضافة المستخدم 🙃*\n\n*الحالة 📝 :${result[0].status}\n\nربما المستخدم قام بحظر أو غير إعدادات الخصوصية 👀❤️`,
                    ...channelInfo
                }, { quoted: message });
            }

        } catch (error) {
            console.error('Add command error:', error);
            await sock.sendMessage(chatId, {
                text: ` *حدث خطأ أثناء إضافة المستخدم* 🙃\n\n${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};