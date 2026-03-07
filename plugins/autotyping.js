const fs = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const configPath = path.join(__dirname, '../data/autotyping.json');

async function initConfig() {
    if (HAS_DB) {
        const config = await store.getSetting('global', 'autotyping');
        return config || { enabled: false };
    } else {
        if (!fs.existsSync(configPath)) {
            if (!fs.existsSync(path.dirname(configPath))) fs.mkdirSync(path.dirname(configPath), { recursive: true });
            fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath));
    }
}

async function saveConfig(config) {
    if (HAS_DB) await store.saveSetting('global', 'autotyping', config);
    else fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

async function isAutotypingEnabled() { return (await initConfig()).enabled; }

async function isGhostModeActive() {
    try {
        const ghostMode = await store.getSetting('global', 'stealthMode');
        return ghostMode && ghostMode.enabled;
    } catch { return false; }
}

async function handleAutotypingForMessage(sock, chatId, userMessage) {
    if (await isGhostModeActive()) return false;
    if (await isAutotypingEnabled()) {
        try {
            await sock.presenceSubscribe(chatId);
            await sock.sendPresenceUpdate('available', chatId);
            await new Promise(r => setTimeout(r, 500));

            await sock.sendPresenceUpdate('composing', chatId);
            const typingDelay = Math.max(3000, Math.min(8000, userMessage.length * 150));
            await new Promise(r => setTimeout(r, typingDelay));

            await sock.sendPresenceUpdate('composing', chatId);
            await new Promise(r => setTimeout(r, 1500));
            await sock.sendPresenceUpdate('paused', chatId);
            return true;
        } catch (err) {
            console.error('ف مشكله 🙂', err);
            return false;
        }
    }
    return false;
}

async function handleAutotypingForCommand(sock, chatId) {
    if (await isGhostModeActive()) return false;
    if (await isAutotypingEnabled()) {
        try {
            await sock.presenceSubscribe(chatId);
            await sock.sendPresenceUpdate('available', chatId);
            await new Promise(r => setTimeout(r, 500));

            await sock.sendPresenceUpdate('composing', chatId);
            await new Promise(r => setTimeout(r, 3000));

            await sock.sendPresenceUpdate('composing', chatId);
            await new Promise(r => setTimeout(r, 1500));
            await sock.sendPresenceUpdate('paused', chatId);
            return true;
        } catch (err) {
            console.error('ف مشكله 🙂', err);
            return false;
        }
    }
    return false;
}

async function showTypingAfterCommand(sock, chatId) {
    if (await isGhostModeActive()) return false;
    if (await isAutotypingEnabled()) {
        try {
            await sock.presenceSubscribe(chatId);
            await sock.sendPresenceUpdate('composing', chatId);
            await new Promise(r => setTimeout(r, 1000));
            await sock.sendPresenceUpdate('paused', chatId);
            return true;
        } catch (err) {
            console.error('ف مشكله ياحب 🙂', err);
            return false;
        }
    }
    return false;
}

module.exports = {
    command: 'الكتابه_التلقائي',
    aliases: ['typing', 'autotype'],
    category: 'owner',
    description: 'يشغل مؤشر الكتابة التلقائي للبوت',
    usage: '.الكتابه_التلقائيه تشغيل/تعطيل',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const config = await initConfig();
            const action = args[0]?.toLowerCase();

            if (!action) {
                const ghostActive = await isGhostModeActive();
                await sock.sendMessage(chatId, {
                    text: ` ⚙️ إعدادات الكتابة التلقائية دلوقتي ⚙️

حالة الكتابة 📝: ${config.enabled ? 'شغالة ✅' : 'مقفولة ❌'}
حالة وضع التخفي 👀❤️: ${ghostActive ? 'شغال 👻 (بيمنع الكتابة)' : 'مقفول ❌'}
طريقة التخزين 📝: ${HAS_DB ? 'Database' : 'ملفات النظام 💻'}

الأوامر 💻📝:
.الكتابه_التلقائيه تشغيل 👀❤️
.الكتابه_التلقائيه تعطيل 👀❤️`,
                }, { quoted: message });
                return;
            }

            if (action === 'تشغيل') {
                if (config.enabled) return await sock.sendMessage(chatId, { text: 'الكتابة التلقائية شغالة أصلا 😂❤️' }, { quoted: message });
                config.enabled = true;
                await saveConfig(config);
                await sock.sendMessage(chatId, { text: 'تم تشغيل الكتابة التلقائية 👀❤️' }, { quoted: message });

            } else if (action === 'تعطيل') {
                if (!config.enabled) return await sock.sendMessage(chatId, { text: 'الكتابة التلقائية مقفولة أصلا 😂❤️' }, { quoted: message });
                config.enabled = false;
                await saveConfig(config);
                await sock.sendMessage(chatId, { text: 'تم ايقاف الكتابة التلقائية 👀❤️' }, { quoted: message });

            } else {
                await sock.sendMessage(chatId, { text: 'الأمر ده مش صح 😄\nاستخدم تشغيل أو تعطيل 👀❤️' }, { quoted: message });
            }

        } catch (error) {
            console.error('حصل مشكله في الكتابة التلقائية 🙂 ', error);
            await sock.sendMessage(chatId, { text: `حصل مشكلة أثناء تشغيل الأمر 😄\n${error.message}` }, { quoted: message });
        }
    },

    isAutotypingEnabled,
    handleAutotypingForMessage,
    handleAutotypingForCommand,
    showTypingAfterCommand
};