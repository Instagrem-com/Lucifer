const { addWelcome, delWelcome, isWelcomeOn, addGoodbye, delGoodBye, isGoodByeOn } = require('../lib/index');
const { delay } = require('@whiskeysockets/baileys');

async function handleWelcome(sock, chatId, message, match) {
    if (!match) {
        return sock.sendMessage(chatId, {
            text: `📥 *إعدادات الترحيب*\n\n✅ *.welcome تشغيل* — شغّل رسائل الترحيب\n🛠️ *.welcome ضبط رسالتك هنا* — حدد رسالة ترحيب خاصة\n🚫 *.welcome تعطيل* — وقف رسائل الترحيب\n\n*المتغيرات المتاحة:*\n• {user} - المنشن للعضو الجديد\n• {group} - اسم الجروب\n• {description} - وصف الجروب`,
            quoted: message
        });
    }

    const [command, ...args] = match.split(' ');
    const lowerCommand = command.toLowerCase();
    const customMessage = args.join(' ');

    if (lowerCommand === 'تشغيل') {
        if (await isWelcomeOn(chatId)) {
            return sock.sendMessage(chatId, { text: '⚠️ رسائل الترحيب شغالة قبل كده 😎', quoted: message });
        }
        await addWelcome(chatId, true, 'أهلا بيك {user} في {group}! 🎉');
        return sock.sendMessage(chatId, { text: '✅ رسائل الترحيب اتشغلت 😎. استخدم *.welcome ضبط [رسالتك]* لتغيير الرسالة.', quoted: message });
    }

    if (lowerCommand === 'تعطيل') {
        if (!(await isWelcomeOn(chatId))) {
            return sock.sendMessage(chatId, { text: '⚠️ رسائل الترحيب متقفلة قبل كده 😎', quoted: message });
        }
        await delWelcome(chatId);
        return sock.sendMessage(chatId, { text: '✅ رسائل الترحيب اتقفلت 😎', quoted: message });
    }

    if (lowerCommand === 'ضبط') {
        if (!customMessage) {
            return sock.sendMessage(chatId, { text: '⚠️ اكتب رسالة ترحيب 😅\nمثال: *.welcome ضبط أهلا بيك في الجروب!*', quoted: message });
        }
        await addWelcome(chatId, true, customMessage);
        return sock.sendMessage(chatId, { text: '✅ تم ضبط رسالة الترحيب 😎', quoted: message });
    }

    return sock.sendMessage(chatId, {
        text: '❌ أمر غير صحيح 😅\nاستخدم:\n*.welcome تشغيل* - شغّل\n*.welcome ضبط [رسالتك]* - ضبط\n*.welcome تعطيل* - وقف',
        quoted: message
    });
}

async function handleGoodbye(sock, chatId, message, match) {
    const lower = match?.toLowerCase();

    if (!match) {
        return sock.sendMessage(chatId, {
            text: `📤 *إعدادات المغادرة*\n\n✅ *.goodbye تشغيل* — شغّل رسائل المغادرة\n🛠️ *.goodbye ضبط رسالتك هنا* — حدد رسالة مغادرة خاصة\n🚫 *.goodbye تعطيل* — وقف رسائل المغادرة\n\n*المتغيرات المتاحة:*\n• {user} - المنشن للعضو اللي خارج\n• {group} - اسم الجروب`,
            quoted: message
        });
    }

    if (lower === 'تشغيل') {
        if (await isGoodByeOn(chatId)) {
            return sock.sendMessage(chatId, { text: '⚠️ رسائل المغادرة شغالة قبل كده 😎', quoted: message });
        }
        await addGoodbye(chatId, true, 'مع السلامة {user} 👋');
        return sock.sendMessage(chatId, { text: '✅ رسائل المغادرة اتشغلت 😎. استخدم *.goodbye ضبط [رسالتك]* لتغيير الرسالة.', quoted: message });
    }

    if (lower === 'تعطيل') {
        if (!(await isGoodByeOn(chatId))) {
            return sock.sendMessage(chatId, { text: '⚠️ رسائل المغادرة متقفلة قبل كده 😎', quoted: message });
        }
        await delGoodBye(chatId);
        return sock.sendMessage(chatId, { text: '✅ رسائل المغادرة اتقفلت 😎', quoted: message });
    }

    if (lower.startsWith('ضبط')) {
        const customMessage = match.substring(4);
        if (!customMessage) {
            return sock.sendMessage(chatId, { text: '⚠️ اكتب رسالة مغادرة 😅\nمثال: *.goodbye ضبط مع السلامة!*', quoted: message });
        }
        await addGoodbye(chatId, true, customMessage);
        return sock.sendMessage(chatId, { text: '✅ تم ضبط رسالة المغادرة 😎', quoted: message });
    }

    return sock.sendMessage(chatId, {
        text: '❌ أمر غير صحيح 😅\nاستخدم:\n*.goodbye تشغيل* - شغّل\n*.goodbye ضبط [رسالتك]* - ضبط\n*.goodbye تعطيل* - وقف',
        quoted: message
    });
}

module.exports = { handleWelcome, handleGoodbye };