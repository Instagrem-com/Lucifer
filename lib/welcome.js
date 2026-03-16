const { addWelcome, delWelcome, isWelcomeOn, addGoodbye, delGoodBye, isGoodByeOn } = require('../lib/index');
const { delay } = require('@whiskeysockets/baileys');

async function handleWelcome(sock, chatId, message, match) {
    if (!match) {
        return sock.sendMessage(chatId, {
            text: `📥 *إعدادات الترحيب*\n\n✅ *.رساله_الترحيب تشغيل* — شغّل رسائل الترحيب\n🛠️ *.رساله_الترحيب ضبط رسالتك هنا* — حدد رسالة ترحيب خاصة\n🚫 *.رساله_الترحيب تعطيل* — وقف رسائل الترحيب*`,
            quoted: message
        });
    }

    const [command, ...args] = match.split(' ');
    const lowerCommand = command.toLowerCase();
    const customMessage = args.join(' ');

    if (lowerCommand === 'تشغيل') {
        if (await isWelcomeOn(chatId)) {
            return sock.sendMessage(chatId, { text: 'رساله الترحيب شغال من بدري ياحب 😂❤️', quoted: message });
        }
        await addWelcome(chatId, true, 'مـنـوࢪ يـاحـب {user}\n\n ف {group} البيت بيتك تجول براحتك 😂❤️');
        return sock.sendMessage(chatId, { text: ' رسائل الترحيب اتشغلت ⚡\n. استخدم *.رساله_الترحيب ضبط [رسالتك]* لتغيير الرسالة 👀❤️', quoted: message });
    }

    if (lowerCommand === 'تعطيل') {
        if (!(await isWelcomeOn(chatId))) {
            return sock.sendMessage(chatId, { text: 'رساله الترحيب مقفوله من بدري ياحب 👀❤️', quoted: message });
        }
        await delWelcome(chatId);
        return sock.sendMessage(chatId, { text: 'رسائل الترحيب اتقفلت ياحب ،👀❤️', quoted: message });
    }

    if (lowerCommand === 'ضبط') {
        if (!customMessage) {
            return sock.sendMessage(chatId, { text: ' اكتب رسالة ترحيب 📝\nمثال ⚙️ : *.رساله_الترحيب ضبط أهلا بيك في الجروب 👀*', quoted: message });
        }
        await addWelcome(chatId, true, customMessage);
        return sock.sendMessage(chatId, { text: ' تم ضبط رسالة الترحيب ياحب 👀❤️', quoted: message });
    }

    return sock.sendMessage(chatId, {
        text: ' أمر غير صحيح 👀\nاستخدم 📝 :\n*.رساله_الترحيب تشغيل* - شغّل\n*.رساله_الترحيب ضبط [رسالتك]* - ضبط\n*.رساله_الترحيب تعطيل* - وقف 👀❤️',
        quoted: message
    });
}

async function handleGoodbye(sock, chatId, message, match) {
    const lower = match?.toLowerCase();

    if (!match) {
        return sock.sendMessage(chatId, {
            text: `📤 *إعدادات المغادرة*\n\n✅ *.رساله_الوداع تشغيل* — شغّل رسائل المغادرة\n🛠️ *.رساله_الوداع ضبط رسالتك هنا* — حدد رسالة مغادرة خاصة\n🚫 *.رساله_الوداع تعطيل* — وقف رسائل المغادرة 👀❤️`,
            quoted: message
        });
    }

    if (lower === 'تشغيل') {
        if (await isGoodByeOn(chatId)) {
            return sock.sendMessage(chatId, { text: 'رسائل المغادرة شغالة قبل كده 👀❤️', quoted: message });
        }
        await addGoodbye(chatId, true, 'ف داهيه {user}\n\n الي راح يجي غيرو 😂😂');
        return sock.sendMessage(chatId, { text: 'رسائل المغادرة اتشغلت ⚡\n\n. استخدم *.رساله_الوداع ضبط [رسالتك]* لتغيير الرسالة. 👀❤️', quoted: message });
    }

    if (lower === 'تعطيل') {
        if (!(await isGoodByeOn(chatId))) {
            return sock.sendMessage(chatId, { text: ' رسائل المغادرة متقفلة قبل كده 😎', quoted: message });
        }
        await delGoodBye(chatId);
        return sock.sendMessage(chatId, { text: ' رسائل المغادرة اتقفلت 😎', quoted: message });
    }

    if (lower.startsWith('ضبط')) {
        const customMessage = match.substring(4);
        if (!customMessage) {
            return sock.sendMessage(chatId, { text: ' اكتب رسالة مغادرة 😅\nمثال: *.رساله_الوداع ضبط مع السلامة!*', quoted: message });
        }
        await addGoodbye(chatId, true, customMessage);
        return sock.sendMessage(chatId, { text: 'تم ضبط رسالة المغادرة 😎', quoted: message });
    }

    return sock.sendMessage(chatId, {
        text: '❌ أمر غير صحيح 😅\nاستخدم:\n*.رساله_الوداع تشغيل* - شغّل\n*.رساله_الوداع ضبط [رسالتك]* - ضبط\n*.رساله_الوداع تعطيل* - وقف',
        quoted: message
    });
}

module.exports = { handleWelcome, handleGoodbye };