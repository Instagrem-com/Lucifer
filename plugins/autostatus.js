const fs = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const configPath = path.join(__dirname, '../data/autoStatus.json');

if (!HAS_DB && !fs.existsSync(configPath)) {
    if (!fs.existsSync(path.dirname(configPath))) fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify({ enabled: false, reactOn: false }, null, 2));
}

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363425019719202@newsletter',
            newsletterName: '✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪',
            serverMessageId: -1
        }
    }
};

async function readConfig() {
    try {
        if (HAS_DB) {
            const config = await store.getSetting('global', 'autoStatus');
            return config || { enabled: false, reactOn: false };
        } else {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return { enabled: !!config.enabled, reactOn: !!config.reactOn };
        }
    } catch {
        return { enabled: false, reactOn: false };
    }
}

async function writeConfig(config) {
    try {
        if (HAS_DB) await store.saveSetting('global', 'autoStatus', config);
        else fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch {}
}

async function isAutoStatusEnabled() { return (await readConfig()).enabled; }
async function isStatusReactionEnabled() { return (await readConfig()).reactOn; }

async function reactToStatus(sock, statusKey) {
    try {
        const enabled = await isStatusReactionEnabled();
        if (!enabled) return;

        await sock.relayMessage(
            'status@broadcast',
            {
                reactionMessage: {
                    key: {
                        remoteJid: 'status@broadcast',
                        id: statusKey.id,
                        participant: statusKey.participant || statusKey.remoteJid,
                        fromMe: false
                    },
                    text: '💚'
                }
            },
            {
                messageId: statusKey.id,
                statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid]
            }
        );
        console.log('رديت ع الحاله 😉❤️');
    } catch (error) {
        console.error('مش قادر ارد ع الحاله 🙂', error.message);
    }
}

async function handleStatusUpdate(sock, status) {
    try {
        const enabled = await isAutoStatusEnabled();
        if (!enabled) return;
        await new Promise(r => setTimeout(r, 1000));

        const keys = [
            status.messages?.[0]?.key,
            status.key,
            status.reaction?.key
        ].filter(Boolean);

        for (const k of keys) {
            if (k.remoteJid === 'status@broadcast') {
                try {
                    await sock.readMessages([k]);
                    console.log('شوفت الاستوري 👀❤️');
                    await reactToStatus(sock, k);
                } catch (err) {
                    if (err.message?.includes('rate-overlimit')) {
                        await new Promise(r => setTimeout(r, 2000));
                        await sock.readMessages([k]);
                    }
                }
            }
        }
    } catch (error) {
        console.error('حصل مشكلة 🙂', error.message);
    }
}

module.exports = {
    command: 'مشاهده_استيت',
    aliases: ['autoview', 'مشاهده_استوري'],
    category: 'اوامـࢪ الـمـطـوࢪ',
    description: 'يشوف الحالات ويتفاعل معاها لو مفعل',
    usage: '.مشاهده_الحالات تشغيل/تعطيل/تفاعل تشغيل/تفاعل تعطيل',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            let config = await readConfig();
            if (!args || args.length === 0) {
                await sock.sendMessage(chatId, {
                    text: ` ⚙️ إعدادات مشاهدة الحالات دلوقتي ⚙️

مشاهدة الحالات 📝:  ${config.enabled ? 'شغالة ✅' : 'مقفولة ❌'}
تفاعل مع الحالات ⚙️: ${config.reactOn ? 'شغال 💚' : 'مقفول ❌'}
طريقة التخزين 💻 : ${HAS_DB ? 'Database' : 'ملفات النظام 📝'}

الأوامر 💻📝:
.مشاهده_استيت تشغيل 👀❤️
مشاهده_استيت تعطيل 👀 ❤️ 
.مشاهده_استيت تفاعل تشغيل 👀❤️
.مشاهده_استيت تفاعل تعطيل 👀❤️

ملاحظه 📝 : شغل .مشاهده_استيت تشغيل الاول\nوبعدين شغل .مشاهده_استيت تفاعل تشغيل\nعشان الامر يشتغل صح 😄❤️`,
                    ...channelInfo
                }, { quoted: message });
                return;
            }

            const command = args[0].toLowerCase();

            if (command === 'تشغيل') {
                if (config.enabled) {
                    await sock.sendMessage(chatId, { text: 'مشاهدة الحالات شغالة أصلا 😂❤️' }, { quoted: message });
                    return;
                }
                config.enabled = true;
                await writeConfig(config);
                await sock.sendMessage(chatId, { text: 'تم تشغيل مشاهدة الحالات 👀❤️' }, { quoted: message });
            }
            else if (command === 'تعطيل') {
                if (!config.enabled) {
                    await sock.sendMessage(chatId, { text: 'مشاهدة الحالات مقفولة أصلا 😂❤️' }, { quoted: message });
                    return;
                }
                config.enabled = false;
                await writeConfig(config);
                await sock.sendMessage(chatId, { text: 'تم ايقاف مشاهدة الحالات 👀❤️' }, { quoted: message });
            }
            else if (command === 'تفاعل') {
                if (!args[1]) {
                    await sock.sendMessage(chatId, { text: 'حدد تشغيل أو تعطيل للتفاعل 👀❤️\nمثال 📝: \n .مشاهده_الحالات تفاعل تشغيل 👀❤️' }, { quoted: message });
                    return;
                }
                const sub = args[1].toLowerCase();
                if (sub === 'تشغيل') {
                    config.reactOn = true;
                    await writeConfig(config);
                    await sock.sendMessage(chatId, { text: 'تم تفعيل التفاعل مع الحالات 💚' }, { quoted: message });
                } else if (sub === 'تعطيل') {
                    config.reactOn = false;
                    await writeConfig(config);
                    await sock.sendMessage(chatId, { text: 'تم ايقاف التفاعل مع الحالات 👀❤️' }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, { text: 'الأمر ده مش صح 😄\nاستخدم تشغيل أو تعطيل 👀❤️', ...channelInfo }, { quoted: message });
                }
            } else {
                await sock.sendMessage(chatId, { text: 'الأمر ده مش موجود 😄\nجرب الأوامر الصح من قائمة البوت 👀❤️', ...channelInfo }, { quoted: message });
            }
        } catch (error) {
            console.error('حصل خطأ في الأمر 🙂', error);
            await sock.sendMessage(chatId, { text: `حصل خطأ أثناء التعامل مع الأمر 🙂\n${error.message}`, ...channelInfo }, { quoted: message });
        }
    },

    handleStatusUpdate,
    isAutoStatusEnabled,
    isStatusReactionEnabled,
    reactToStatus,
    readConfig,
    writeConfig
};