const fs = require('fs');
const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const PMBLOCKER_PATH = './data/pmblocker.json';

const DEFAULT_MESSAGE = '⚠️ متقدرش تبعتلي رسالة على الخاص! اتواصل معايا بس في الجروبات.';

async function readState() {
    try {
        if (HAS_DB) {
            const data = await store.getSetting('global', 'pmblocker');
            if (!data) return { enabled: false, message: DEFAULT_MESSAGE };
            return {
                enabled: !!data.enabled,
                message: typeof data.message === 'string' && data.message.trim() ? data.message : DEFAULT_MESSAGE
            };
        } else {
            if (!fs.existsSync(PMBLOCKER_PATH)) return { enabled: false, message: DEFAULT_MESSAGE };
            const raw = fs.readFileSync(PMBLOCKER_PATH, 'utf8');
            const data = JSON.parse(raw || '{}');
            return {
                enabled: !!data.enabled,
                message: typeof data.message === 'string' && data.message.trim() ? data.message : DEFAULT_MESSAGE
            };
        }
    } catch {
        return { enabled: false, message: DEFAULT_MESSAGE };
    }
}

async function writeState(enabled, message) {
    try {
        const current = await readState();
        const payload = {
            enabled: !!enabled,
            message: typeof message === 'string' && message.trim() ? message : current.message
        };
        if (HAS_DB) {
            await store.saveSetting('global', 'pmblocker', payload);
        } else {
            if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
            fs.writeFileSync(PMBLOCKER_PATH, JSON.stringify(payload, null, 2));
        }
    } catch (e) {
        console.error('خطأ في حفظ حالة PM Blocker:', e);
    }
}

module.exports = {
    command: 'حظر_رسايل_الخاص',
    aliases: ['pmblock', 'blockpm', 'antipm'],
    category: 'owner',
    description: 'تحكم في الرسائل الخاصة: حظر أو السماح برسائل الخاص',
    usage: '.pmblocker <شغل|وقف|الحالة|غير_رسالة>',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const state = await readState();

        const sub = args[0]?.toLowerCase();
        const rest = args.slice(1);

        if (!sub || !['شغل', 'وقف', 'الحالة', 'غير_رسالة'].includes(sub)) {
            await sock.sendMessage(chatId, {
                text: `📵 *نظام حظر الرسائل الخاصة*\n\n` +
                      `*طريقة الحفظ:* ${HAS_DB ? 'قاعدة بيانات' : 'ملف محلي'}\n\n` +
                      `*الأوامر:*\n` +
                      `• \`.pmblocker شغل\` - تفعيل حظر رسائل الخاص\n` +
                      `• \`.pmblocker وقف\` - تعطيل حظر رسائل الخاص\n` +
                      `• \`.pmblocker الحالة\` - عرض الحالة الحالية\n` +
                      `• \`.pmblocker غير_رسالة <نص>\` - تعديل رسالة التحذير\n\n` +
                      `*الحالة الحالية:* ${state.enabled ? '✅ مفعل' : '❌ معطل'}`
            }, { quoted: message });
            return;
        }

        if (sub === 'الحالة') {
            await sock.sendMessage(chatId, {
                text: `📵 *حالة PM Blocker*\n\n` +
                      `*الحالة:* ${state.enabled ? '✅ مفعل' : '❌ معطل'}\n` +
                      `*طريقة الحفظ:* ${HAS_DB ? 'قاعدة بيانات' : 'ملف محلي'}\n\n` +
                      `*رسالة التحذير الحالية:*\n${state.message}`
            }, { quoted: message });
            return;
        }

        if (sub === 'غير_رسالة') {
            const newMsg = rest.join(' ').trim();
            if (!newMsg) {
                await sock.sendMessage(chatId, {
                    text: '*اكتب رسالة جديدة!* \n\nالاستخدام: `.pmblocker غير_رسالة <نص>`'
                }, { quoted: message });
                return;
            }
            await writeState(state.enabled, newMsg);
            await sock.sendMessage(chatId, {
                text: `✅ *تم تعديل رسالة التحذير!*\n\n*الرسالة الجديدة:*\n${newMsg}`
            }, { quoted: message });
            return;
        }

        const enable = sub === 'شغل';
        await writeState(enable);

        await sock.sendMessage(chatId, {
            text: `📵 *PM Blocker ${enable ? 'مفعل ✅' : 'معطل ❌'}*\n\n` +
                  `${enable ? '⚠️ أي حد يبعث رسالة خاصة هيتحذر ويتحظر.' : 'الرسائل الخاصة بقت مسموحة دلوقتي.'}`
        }, { quoted: message });
    },

    readState,
    writeState
};