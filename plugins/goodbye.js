const { handleGoodbye } = require('../lib/welcome');
const { isGoodByeOn, getGoodbye } = require('../lib/index');
const fetch = require('node-fetch');

async function handleLeaveEvent(sock, id, participants) {
    const isGoodbyeEnabled = await isGoodByeOn(id);
    if (!isGoodbyeEnabled) return;

    const customMessage = await getGoodbye(id);
    const groupMetadata = await sock.groupMetadata(id);
    const groupName = groupMetadata.subject;
    
    for (const participant of participants) {
        try {
            const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
            const user = participantString.split('@')[0];
            
            let displayName = user;
            try {
                const contact = await sock.getBusinessProfile(participantString);
                if (contact && contact.name) {
                    displayName = contact.name;
                } else {
                    const groupParticipants = groupMetadata.participants;
                    const userParticipant = groupParticipants.find(p => p.id === participantString);
                    if (userParticipant && userParticipant.name) {
                        displayName = userParticipant.name;
                    }
                }
            } catch (nameError) {
                console.log('Could not fetch display name, using phone number');
            }
            
            let finalMessage;
            if (customMessage) {
                finalMessage = customMessage
                    .replace(/{user}/g, `@${displayName}`)
                    .replace(/{group}/g, groupName);
            } else {
                finalMessage = `@${displayName}\n العلق خرج من الروم\n الي غار يجي غيرو 😂❤️`;
            }
            
            try {
                let profilePicUrl = `https://img.pyrocdn.com/dbKUgahg.png`;
                try {
                    const profilePic = await sock.profilePictureUrl(participantString, 'image');
                    if (profilePic) {
                        profilePicUrl = profilePic;
                    }
                } catch (profileError) {
                    console.log('Could not fetch profile picture, using default');
                }
                
                const apiUrl = `https://api.some-random-api.com/welcome/img/2/gaming1?type=leave&textcolor=red&username=${encodeURIComponent(displayName)}&guildName=${encodeURIComponent(groupName)}&memberCount=${groupMetadata.participants.length}&avatar=${encodeURIComponent(profilePicUrl)}`;
                
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const imageBuffer = await response.buffer();
                    
                    await sock.sendMessage(id, {
                        image: imageBuffer,
                        caption:
`${finalMessage}`,
                        mentions: [participantString]
                    });
                    continue;
                }
            } catch (imageError) {
                console.log('Image generation failed, falling back to text');
            }
            
            await sock.sendMessage(id, {
                text:
`${finalMessage}`,
                mentions: [participantString]
            });
        } catch (error) {
            console.error('Error sending goodbye message:', error);
            const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
            const user = participantString.split('@')[0];
            
            let fallbackMessage;
            if (customMessage) {
                fallbackMessage = customMessage
                    .replace(/{user}/g, `@${user}`)
                    .replace(/{group}/g, groupName);
            } else {
                fallbackMessage = `@${user} العلق خرج من الروم\n الي غار يجي غيرو 😂❤️`;
            }
            
            await sock.sendMessage(id, {
                text:
`${fallbackMessage}`,
                mentions: [participantString]
            });
        }
    }
}

module.exports = {
    command: 'رساله_الوداع',
    aliases: ['وداع', 'خروج'],
    category: 'اوامـࢪ الـمـطـوࢪ',
    description: 'إعداد رسالة وداع للأعضاء اللي بيخرجوا من الجروب',
    usage: '.الوداع <تشغيل | تعطيل | تعيين رسالة>',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const matchText = args.join(' ');

        await handleGoodbye(sock, chatId, message, matchText);
    },

    handleLeaveEvent
};