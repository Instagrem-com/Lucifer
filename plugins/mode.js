const store = require('../lib/lightweight_store')

async function modeCommand(sock, message, args, context) {
    const { chatId, channelInfo } = context
    const senderId = message.key.participant || message.key.remoteJid
    const isOwnerOrSudoCheck = message.key.fromMe || context.senderIsOwnerOrSudo || context.isOwnerOrSudoCheck

    if (!isOwnerOrSudoCheck) {
        return await sock.sendMessage(chatId, {
            text: '❌ مسموح بس للمالك أو السوبر مالك يغير وضع البوت!',
            ...channelInfo
        }, { quoted: message })
    }

    const subCommand = args[0]?.toLowerCase()
    const currentMode = await store.getBotMode() || 'public'

    if (!subCommand || subCommand === 'status' || subCommand === 'check') {
        const modeEmojis = {
            public: '🌍',
            private: '🔒',
            groups: '👥',
            inbox: '💬',
            self: '👤'
        }

        const modeDescriptions = {
            public: 'الكل يقدر يستخدم البوت (جروبات وشات خاص)',
            private: 'بس المالك والسوبر مالك يقدروا يستخدموا البوت',
            groups: 'بيشتغل بس في الجروبات (كل الناس في الجروب)',
            inbox: 'بيشتغل بس في الشات الخاص (كل الناس يقدروا يراسلوا البوت)',
            self: 'بس المالك والسوبر مالك (زي الخاص)'
        }

        let statusText = `📊 *حالة وضع البوت*\n\n`
        statusText += `الوضع الحالي: ${modeEmojis[currentMode]} *${currentMode.toUpperCase()}*\n`
        statusText += `الوصف: ${modeDescriptions[currentMode]}\n\n`
        statusText += `━━━━━━━━━━━━━━━━━━━━\n\n`
        statusText += `*الوضعيات المتاحة:*\n\n`
        
        Object.entries(modeDescriptions).forEach(([mode, desc]) => {
            const current = mode === currentMode ? '✓ ' : ''
            statusText += `${current}${modeEmojis[mode]} \`${mode}\`\n${desc}\n\n`
        })

        statusText += `*طريقة الاستخدام:*\n`
        statusText += `• \`.الوضع <mode>\` - لتغيير الوضع\n`
        statusText += `• \`.الوضع status\` - لعرض الوضع الحالي\n\n`
        statusText += `*أمثلة:*\n`
        statusText += `• \`.الوضع public\` - البوت متاح للكل\n`
        statusText += `• \`.الوضع groups\` - البوت للجروبات بس\n`
        statusText += `• \`.الوضع inbox\` - البوت للشات الخاص بس\n`
        statusText += `• \`.الوضع private\` - البوت للمالك والسوبر مالك فقط`

        return await sock.sendMessage(chatId, {
            text: statusText,
            ...channelInfo
        }, { quoted: message })
    }

    const validModes = ['public', 'private', 'groups', 'inbox', 'self']
    
    if (!validModes.includes(subCommand)) {
        return await sock.sendMessage(chatId, {
            text: `❌ الوضع مش صحيح: *${subCommand}*\nالوضعيات الصحيحة: ${validModes.join(', ')}\n\nاستخدم \`.الوضع\` لمشاهدة كل الوضعيات.`,
            ...channelInfo
        }, { quoted: message })
    }

    await store.setBotMode(subCommand)

    const modeEmojis = {
        public: '🌍',
        private: '🔒',
        groups: '👥',
        inbox: '💬',
        self: '👤'
    }

    const modeMessages = {
        public: 'البوت دلوقتي متاح *للجميع* في الجروبات والشات الخاص.',
        private: 'البوت دلوقتي محدود للمالك والسوبر مالك فقط.',
        groups: 'البوت دلوقتي بيشتغل *في الجروبات فقط* (كل أعضاء الجروب يقدروا يستخدموه).',
        inbox: 'البوت دلوقتي بيشتغل *في الشات الخاص فقط* (كل الناس يقدروا يراسلوا البوت).',
        self: 'البوت دلوقتي محدود للمالك والسوبر مالك فقط.'
    }

    await sock.sendMessage(chatId, {
        text: `${modeEmojis[subCommand]} *تم تغيير الوضع إلى ${subCommand.toUpperCase()}*\n\n${modeMessages[subCommand]}\n\n_استخدم \`.الوضع status\` لمراجعة الوضع الحالي._`,
        ...channelInfo
    }, { quoted: message })
}

module.exports = {
    command: 'الوضع',
    aliases: ['وضع_البوت', 'ضبط_الوضع'],
    category: 'مالك',
    description: 'تحكم متقدم في استخدام البوت - من يقدر يستخدم البوت وفين',
    usage: '.الوضع [public|private|groups|inbox|self|status]',
    ownerOnly: true,
    handler: modeCommand
}