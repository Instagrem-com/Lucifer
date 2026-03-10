const store = require('../lib/lightweight_store');

async function getAntibadwordSettings(chatId) {
    const settings = await store.getSetting(chatId, 'antibadword');
    return settings || { enabled: false, words: [] };
}

async function saveAntibadwordSettings(chatId, settings) {
    await store.saveSetting(chatId, 'antibadword', settings);
}

async function handleAntiBadwordCommand(sock, chatId, message, match) {
    const args = match.trim().toLowerCase().split(/\s+/);
    const action = args[0];

    const settings = await getAntibadwordSettings(chatId);

    if (!action || action === 'عرض') {
        const status = settings.enabled ? '✅ مـفـعـل' : '❌ مـعـطـل';
        const wordCount = settings.words?.length || 0;
        
        await sock.sendMessage(chatId, {
            text: `*📛 نـظـام مـنـع الـشـتـايـم 📛*\n\n` +
                  `الـحـالـة : ${status}\n` +
                  `عـدد الـكـلـمـات الـمـمـنـوعـة : ${wordCount}\n\n` +
                  `الاوامـر :\n` +
                  `• \`.ممنوع_الشتيمه تفعيل\` - تـفـعـيـل\n` +
                  `• \`.ممنوع_الشتيمه تعطيل\` - تـعـطـيـل\n` +
                  `• \`.ممنوع_الشتيمه اضافه <كلمة>\` - اضـافـة كـلـمـة\n` +
                  `• \`.ممنوع_الشتيمه حذف <كلمة>\` - حـذف كـلـمـة\n` +
                  `• \`.ممنوع_الشتيمه عرض\` - عـرض كـل الـكـلـمـات`
        }, { quoted: message });
        return;

    if (action === 'تفعيل') {
        settings.enabled = true;
        await saveAntibadwordSettings(chatId, settings);
        
        await sock.sendMessage(chatId, {
            text: '*تـم تـفـعـيـل نـظـام مـنـع الـشـتـايـم*\n\nالرسـائـل التي تـحـتوي على كـلـمـات مـمـنـوعـة سـتـتـحـذف 👀❤️'
        }, { quoted: message });
        return;
    }

    if (action === 'تعطيل') {
        settings.enabled = false;
        await saveAntibadwordSettings(chatId, settings);
        
        await sock.sendMessage(chatId, {
            text: '*تـم تـعـطـيـل نـظـام مـنـع الـشـتـايـم*\n\nالـفـلـتـر بـقـي غـيـر مـفـعـل حـالـيـا 👀❤️ً.'
        }, { quoted: message });
        return;
    }

    if (action === 'اضافه') {
        const word = args.slice(1).join(' ').toLowerCase().trim();
        
        if (!word) {
            await sock.sendMessage(chatId, {
                text: '*اكـتـب الـكـلـمـة الـي عـايـز تـضـيـفـهـا*\n\nمـثـال : `.ممنوع_الشتيمه اضافه >كلمة< 😉❤️`'
            }, { quoted: message });
            return;
        }

        if (!settings.words) settings.words = [];
        
        if (settings.words.includes(word)) {
            await sock.sendMessage(chatId, {
                text: `*الـكـلـمـة مـوجـودة بـالـفـعـل*\n\n"${word}" مـضـافـة فـي قـائـمـة الـمـنـع 👀📝`
            }, { quoted: message });
            return;
        }

        settings.words.push(word);
        await saveAntibadwordSettings(chatId, settings);
        
        await sock.sendMessage(chatId, {
            text: `✅ *تـم اضـافـة الكـلـمـة*\n\nتم اضـافـة "${word}" فـي قـائـمـة الـمـنـع.\n\nعـدد الـكـلـمـات الـمـمـنـوعـة الآن : ${settings.words.length}`
        }, { quoted: message });
        return;
    }

    if (action === 'حذف' || action === 'ازاله' || action === 'مسح') {
        const word = args.slice(1).join(' ').toLowerCase().trim();
        
        if (!word) {
            await sock.sendMessage(chatId, {
                text: '❌ *اكـتـب الـكـلـمـة الـي عـايـز تـحـذفـهـا*\n\nمـثـال : `.ممنوع_الشتيمه حذف >كلمة< 👀🗑️`'
            }, { quoted: message });
            return;
        }

        if (!settings.words || !settings.words.includes(word)) {
            await sock.sendMessage(chatId, {
                text: ` *الـكـلـمـة مـش مـوجـودة*\n\n"${word}" مـش فـي قـائـمـة الـمـنـع 👀❌ `
            }, { quoted: message });
            return;
        }

        settings.words = settings.words.filter(w => w !== word);
        await saveAntibadwordSettings(chatId, settings);
        
        await sock.sendMessage(chatId, {
            text: `✅ *تـم حـذف الـكـلـمـة*\n\nتم حـذف "${word}" مـن قـائـمـة الـمـنـع.\n\nعـدد الـكـلـمـات الـمـمـنـوعـة الـبـاقـيـة : ${settings.words.length}`
        }, { quoted: message });
        return;
    }

    if (action === 'عرض') {
        if (!settings.words || settings.words.length === 0) {
            await sock.sendMessage(chatId, {
                text: '📝 *قـائـمـة الـكـلـمـات الـمـمـنـوعـة*\n\nمـفيش أي كـلـمـات مـمـنـوعـة دلوقتي.\n\nاسـتـخـدم `.ممنوع_الشتيمه اضافه <كلمة>` لـاضـافـة كـلـمـات.'
            }, { quoted: message });
            return;
        }

        const wordList = settings.words.map((w, i) => `${i + 1}. ${w}`).join('\n');
        
        await sock.sendMessage(chatId, {
            text: ` *قـائـمـة الـكـلـمـات الـمـمـنـوعـة*\n\n${wordList}\n\nالإجـمـالي: ${settings.words.length} كـلـمـة 📝`
        }, { quoted: message });
        return;
    }

    await sock.sendMessage(chatId, {
        text: '❌ *امـر غـيـر صـحـيـح* ❌\n\nالاوامـر :\n' +
              '• `.ممنوع_الشتيمه تفعيل/تعطيل` - تفعيل او تعطيل\n' +
              '• `.ممنوع_الشتيمه اضافه <كلمة>` - اضافة كلمة\n' +
              '• `.ممنوع_الشتيمه حذف <كلمة>` - حذف كلمة\n' +
              '• `.ممنوع_الشتيمه عرض` - عرض الكلمات'
    }, { quoted: message });
}

async function checkAntiBadword(sock, message) {
    const chatId = message.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return false;

    const settings = await getAntibadwordSettings(chatId);
    if (!settings.enabled || !settings.words || settings.words.length === 0) return false;

    const messageText = (
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        message.message?.videoMessage?.caption ||
        ''
    ).toLowerCase();

    if (!messageText) return false;

    for (const word of settings.words) {
        if (messageText.includes(word.toLowerCase())) {
            try {
                await sock.sendMessage(chatId, { delete: message.key });
                
                await sock.sendMessage(chatId, {
                    text: `❌ تـم حـذف الرسـالـة: تـحتوي على الكـلـمـة المـمـنـوعـة "${word}" 😊❤️`
                });
                
                return true;
            } catch (error) {
                console.error('Error deleting badword message:', error);
            }
            break;
        }
    }

    return false;
}

module.exports = {
    command: 'ممنوع_الشتيمه',
    aliases: ['abw', 'حذف_الشتيمه', 'antibad'],
    category: 'admin',
    description: 'ضـبـط نـظـام مـنـع الـشـتـايـم لـحـذف الرسـائـل الـتـي تـحـتوي على كـلـمـات غـيـر مـلائـمـة',
usage: '.ممنوع_الشتيمه <تفعيل|تعطيل|اضافه|حذف|عرض>',

    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const match = args.join(' ');

        try {
            await handleAntiBadwordCommand(sock, chatId, message, match);
        } catch (error) {
            console.error('حـدث خـطـأ فـي أمـر مـنـع الـشـتـايـم 🙂', error);
            await sock.sendMessage(chatId, {
                text: '❌ *حـدث خـطـأ اثـنـاء تـنـفيذ أمـر مـنـع الـشـتـايـم*\n\nجـرب مـرة أخـرى لاحـقـاً.'
            }, { quoted: message });
        }
    }
};

module.exports.handleAntiBadwordCommand = handleAntiBadwordCommand;
module.exports.checkAntiBadword = checkAntiBadword;
