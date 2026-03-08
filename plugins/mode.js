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
    const currentMode = await store.getBotMode() || 'عام'

    if (!subCommand || subCommand === 'عرض' || subCommand === 'الحاله') {
        const modeEmojis = {
            عام: '🌍',
            خاص: '🔒',
            جروب: '👥',
            شات: '💬',
            نفسي: '👤'
        }

        const modeDescriptions = {
            عام: 'الكل يقدر يستخدم البوت (جروبات وشات خاص) 👀❤️',
            خاص: 'بس المالك والسوبر مالك يقدروا يستخدموا البوت 👀❤️',
            جروب: 'بيشتغل بس في الجروبات (كل الناس في الجروب) 👀❤️',
            شات: 'بيشتغل بس في الشات الخاص (كل الناس يقدروا يراسلوا البوت) 👀❤️',
            نفسي: 'بس المالك والسوبر مالك (زي الخاص) 👀❤️'
        }

        let statusText = `📊 *حالة وضع البوت* 📊\n\n`
        statusText += `الوضع الحالي ⚙️ ${modeEmojis[currentMode]} *${currentMode.toUpperCase()}*\n`
        statusText += `الوصف 📝 ${modeDescriptions[currentMode]}\n\n`
        statusText += `━━━━━━━━━━━━━━━━━━━━\n\n`
        statusText += `*الوضعيات المتاحة 👀❤️*\n\n`
        
        Object.entries(modeDescriptions).forEach(([mode, desc]) => {
            const current = mode === currentMode ? '✓ ' : ''
            statusText += `${current}${modeEmojis[mode]} \`${mode}\`\n${desc}\n\n`
        })

        statusText += ` 📝 *طريقة الاستخدام* : 📝\n`
        statusText += `• \`.الوضع <mode>\` - لتغيير الوضع ❤️✨\n`
        statusText += `• \`.الوضع عرض\` - لعرض الوضع الحالي ❤️✨\n\n`
        statusText += `*أمثلة* : 📝\n`
        statusText += `• \`.الوضع عام\` - البوت متاح للكل ❤️✨\n`
        statusText += `• \`.الوضع جروب\` - البوت للجروبات بس ❤️✨\n`
        statusText += `• \`.الوضع شات\` - البوت للشات الخاص بس ❤️✨\n`
        statusText += `• \`.الوضع خاص\` - البوت للمالك والسوبر مالك فقط ❤️✨`

        return await sock.sendMessage(chatId, {
            text: statusText,
            ...channelInfo
        }, { quoted: message })
    }

    const validModes = ['عام', 'خاص', 'جروب', 'شات', 'نفسي']
    
    if (!validModes.includes(subCommand)) {
        return await sock.sendMessage(chatId, {
            text: ` الوضع مش صحيح 👀❤️ *${subCommand}*\nالوضعيات الصحيحة 📝: ${validModes.join(', ')}\n\nاستخدم \`.الوضع\` لمشاهدة كل الوضعيات. ❤️✨`,
            ...channelInfo
        }, { quoted: message })
    }

    await store.setBotMode(subCommand)

    const modeEmojis = {
        عام: '🌍',
        خاص: '🔒',
        جروب: '👥',
        شات: '💬',
        نفسي: '👤'
    }

    const modeMessages = {
        عام: 'الكل يقدر يستخدم البوت (جروبات وشات خاص) 👀❤️',
            خاص: 'بس المالك والسوبر مالك يقدروا يستخدموا البوت 👀❤️',
            جروب: 'بيشتغل بس في الجروبات (كل الناس في الجروب) 👀❤️',
            شات: 'بيشتغل بس في الشات الخاص (كل الناس يقدروا يراسلوا البوت) 👀❤️',
            نفسي: 'بس المالك والسوبر مالك (زي الخاص) 👀❤️'
        }

    await sock.sendMessage(chatId, {
        text: `${modeEmojis[subCommand]} *تم تغيير الوضع إلى 👀❤️\n ${subCommand.toUpperCase()}*\n\n${modeMessages[subCommand]}\n\n_استخدم \`.الوضع عرض\` لمراجعة الوضع الحالي 😊❤️`,
        ...channelInfo
    }, { quoted: message })
}

module.exports = {
    command: 'الوضع',
    aliases: ['وضع', 'mode'],
    category: 'اوامـࢪ الـمـطـوࢪ',
    description: 'تحكم متقدم في استخدام البوت - من يقدر يستخدم البوت وفين',
    usage: '.الوضع [عام|خاص|جروب|شات|نفسي|عرض]',
    ownerOnly: true,
    handler: modeCommand
}