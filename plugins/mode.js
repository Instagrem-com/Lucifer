const store = require('../lib/lightweight_store')

/**
 * نظام التحكم في وضع البوت المتقدم
 * الأوضاع:
 * - عام: الكل يقدر يستخدم البوت (جروبات و خاص)
 * - خاص: المطور والمساعدين فقط
 * - جروبات: يعمل في الجروبات فقط
 * - رسائل_خاصة: يعمل في الخاص فقط
 * - انا: المطور فقط (نفس الخاص)
 */
async function modeCommand(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid
    const senderId = message.key.participant || message.key.remoteJid
    const isOwner = message.key.fromMe || context.senderIsOwnerOrSudo || context.isOwnerOrSudoCheck

    if (!isOwner) {
        return await sock.sendMessage(chatId, {
            text: '❌ الأمر دا مخصوص للمطور أو مساعد البوت بس!',
        }, { quoted: message })
    }

    const subCommand = args[0]?.toLowerCase()
    const currentMode = await store.getBotMode() || 'عام'

    const modesMap = {
        'عام': 'public',
        'خاص': 'private',
        'جروبات': 'groups',
        'رسائل_خاصة': 'inbox',
        'انا': 'self'
    }

    const modeEmojis = {
        'عام': '🌍',
        'خاص': '🔒',
        'جروبات': '👥',
        'رسائل_خاصة': '💬',
        'انا': '👤'
    }

    const modeDescriptions = {
        'عام': 'الكل يقدر يستخدم البوت في الجروبات والخاص',
        'خاص': 'المطور والمساعدين فقط يقدروا يستخدموا البوت',
        'جروبات': 'البوت يعمل في الجروبات فقط (كل الأعضاء في الجروب يقدروا يستخدموه)',
        'رسائل_خاصة': 'البوت يعمل في الخاص فقط (الكل يقدر يرسل رسائل للبوت)',
        'انا': 'المطور فقط يقدر يستخدم البوت'
    }

    if (!subCommand || subCommand === 'الحالة' || subCommand === 'status' || subCommand === 'check') {
        let statusText = `📊 *حالة وضع البوت الحالي*\n\n`
        statusText += `الوضع الحالي: ${modeEmojis[currentMode] || '❔'} *${currentMode.toUpperCase()}*\n`
        statusText += `الوصف: ${modeDescriptions[currentMode] || ''}\n\n`
        statusText += `━━━━━━━━━━━━━━━━━━━━\n\n`
        statusText += `*الأوضاع المتاحة:*\n\n`
        Object.entries(modeDescriptions).forEach(([mode, desc]) => {
            const current = mode === currentMode ? '✓ ' : ''
            statusText += `${current}${modeEmojis[mode]} \`${mode}\`\n${desc}\n\n`
        })
        statusText += `*الاستخدام:*\n`
        statusText += `• \`.الوضع <عام|خاص|جروبات|رسائل_خاصة|انا>\` - لتغيير الوضع\n`
        statusText += `• \`.الوضع حالة\` - لعرض الوضع الحالي\n`
        return await sock.sendMessage(chatId, {
            text: statusText
        }, { quoted: message })
    }

    if (!modesMap[subCommand]) {
        return await sock.sendMessage(chatId, {
            text: `❌ الوضع غير صحيح: *${subCommand}*\n\nالأوضاع المتاحة: ${Object.keys(modesMap).join(', ')}\n\nاستخدم \`.الوضع\` لرؤية كل الأوضاع.`,
        }, { quoted: message })
    }

    await store.setBotMode(modesMap[subCommand])

    const modeMessages = {
        'عام': 'البوت دلوقتي متاح *لكل الناس* في الجروبات والخاص.',
        'خاص': 'البوت دلوقتي متاح *للمطور والمساعدين فقط*.',
        'جروبات': 'البوت دلوقتي يشتغل *في الجروبات فقط* (كل الأعضاء يقدروا يستخدموه).',
        'رسائل_خاصة': 'البوت دلوقتي يشتغل *في الخاص فقط* (الكل يقدر يبعث رسائل للبوت).',
        'انا': 'البوت دلوقتي متاح *للمطور فقط*.'
    }

    await sock.sendMessage(chatId, {
        text: `${modeEmojis[subCommand]} *تم تغيير وضع البوت إلى ${subCommand}*\n\n${modeMessages[subCommand]}\n\n_استخدم \`.الوضع حالة\` لمعرفة الوضع الحالي._`
    }, { quoted: message })
}

module.exports = {
    command: 'الوضع',
    aliases: ['botmode', 'setmode'],
    category: 'اوامـࢪ الـمـطـوࢪ',
    description: 'تحكم في من يقدر يستخدم البوت وأين',
    usage: '.الوضع [عام|خاص|جروبات|رسائل_خاصة|انا|حالة]',
    ownerOnly: true,
    handler: modeCommand
}