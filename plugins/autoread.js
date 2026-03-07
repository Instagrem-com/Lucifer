const fs = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const configPath = path.join(__dirname, '..', 'data', 'autoread.json');

async function initConfig() {
    if (HAS_DB) {
        const config = await store.getSetting('global', 'autoread');
        return config || { enabled: false };
    } else {
        if (!fs.existsSync(configPath)) {
            const dataDir = path.dirname(configPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath));
    }
}

async function saveConfig(config) {
    if (HAS_DB) {
        await store.saveSetting('global', 'autoread', config);
    } else {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
}

async function isAutoreadEnabled() {
    try {
        const config = await initConfig();
        return config.enabled;
    } catch (error) {
        console.error('حصل مشكلة في معرفة حالة القراءة:', error);
        return false;
    }
}

function isBotMentionedInMessage(message, botNumber) {
    if (!message.message) return false;

    const messageTypes = [
        'extendedTextMessage','imageMessage','videoMessage','stickerMessage',
        'documentMessage','audioMessage','contactMessage','locationMessage'
    ];

    for (const type of messageTypes) {
        if (message.message[type]?.contextInfo?.mentionedJid) {
            const mentionedJid = message.message[type].contextInfo.mentionedJid;
            if (mentionedJid.some(jid => jid === botNumber)) {
                return true;
            }
        }
    }

    return false;
}

async function handleAutoread(sock, message) {

    try {
        const ghostMode = await store.getSetting('global', 'stealthMode');
        if (ghostMode && ghostMode.enabled) {
            console.log('وضع الشبح شغال - مش هيبعت علامة قراءة 👻');
            return false;
        }
    } catch {}

    const enabled = await isAutoreadEnabled();

    if (enabled) {

        try {

            const key = {
                remoteJid: message.key.remoteJid,
                id: message.key.id,
                participant: message.key.participant
            };

            await sock.readMessages([key]);
            return true;

        } catch (error) {

            console.error('حصل خطأ في القراءة:', error);
            return false;

        }

    }

    return false;
}

module.exports = {

command: 'سيين_تلقائي',
aliases: ['قراءه_تلقائيه','قرايه'],
category: 'owner',
description: 'تشغيل او ايقاف القراءة التلقائية',
usage: '.قراءه تشغيل / ايقاف',
ownerOnly: true,

async handler(sock, message, args, context = {}) {

const chatId = context.chatId || message.key.remoteJid;

try {

const config = await initConfig();
const action = args[0]?.toLowerCase();

if (!action) {

await sock.sendMessage(chatId,{
text:
`حالة القراءة التلقائية

الحالة دلوقتي: ${config.enabled ? 'شغالة' : 'مقفولة'} ✅❌

الأوامر:

.قراءه تشغيل
.قراءه ايقاف

لما تشغلها البوت هيقرأ كل الرسائل لوحده ✓✓`
},{quoted:message})

return
}

if (action === 'تشغيل') {

if (config.enabled) {

await sock.sendMessage(chatId,{
text:'القراءة التلقائية شغالة بالفعل ✔️'
},{quoted:message})

return
}

config.enabled = true;
await saveConfig(config);

await sock.sendMessage(chatId,{
text:'تم تشغيل القراءة التلقائية ✔️'
},{quoted:message})

}

else if (action === 'ايقاف') {

if (!config.enabled) {

await sock.sendMessage(chatId,{
text:'القراءة التلقائية مقفولة بالفعل ❌'
},{quoted:message})

return
}

config.enabled = false;
await saveConfig(config);

await sock.sendMessage(chatId,{
text:'تم ايقاف القراءة التلقائية ❌'
},{quoted:message})

}

else {

await sock.sendMessage(chatId,{
text:
`الخيار غلط ❌

استخدم:

.قراءه تشغيل
.قراءه ايقاف`
},{quoted:message})

}

} catch (error) {

console.error('خطأ في امر القراءة:', error)

await sock.sendMessage(chatId,{
text:'حصل خطأ في تنفيذ الأمر ❌'
},{quoted:message})

}

},

isAutoreadEnabled,
isBotMentionedInMessage,
handleAutoread

};