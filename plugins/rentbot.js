const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");

const NodeCache = require("node-cache");
const pino = require("pino");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const store = require('../lib/lightweight_store');

if (!global.conns) global.conns = [];

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

async function saveCloneSession(authId, data) {
    if (HAS_DB) {
        await store.saveSetting('clones', authId, data);
    } else {
        const sessionPath = path.join(process.cwd(), 'session', 'clones', authId);
        if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });
        fs.writeFileSync(path.join(sessionPath, 'session.json'), JSON.stringify(data));
    }
}

async function getCloneSession(authId) {
    if (HAS_DB) return await store.getSetting('clones', authId);
    const sessionPath = path.join(process.cwd(), 'session', 'clones', authId, 'session.json');
    return fs.existsSync(sessionPath) ? JSON.parse(fs.readFileSync(sessionPath, 'utf-8')) : null;
}

async function deleteCloneSession(authId) {
    if (HAS_DB) await store.saveSetting('clones', authId, null);
    else {
        const sessionPath = path.join(process.cwd(), 'session', 'clones', authId);
        if (fs.existsSync(sessionPath)) fs.rmSync(sessionPath, { recursive: true, force: true });
    }
}

module.exports = {
    command: 'ربط', // بدل rentbot
    aliases: ['بوت_نسخة', 'clonebot'],
    category: 'اوامـࢪ الـمـطـوࢪ',
    description: 'ابدأ نسخة بوت فرعية عن طريق كود الربط',
    usage: '.ربط 201501728150',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const { chatId } = context;

        if (!args[0]) {
            return await sock.sendMessage(chatId, { 
                text: '*استخدام الأمر* 📝👇🏼. :\n `.ربط 201501728150`' 
            }, { quoted: message });
        }

        const userNumber = args[0].replace(/[^0-9]/g, '');
        const authId = crypto.randomBytes(4).toString('hex');
        const sessionPath = path.join(process.cwd(), 'session', 'clones', authId);
        if (!HAS_DB && !fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

        async function startClone() {
            const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
            const { version } = await fetchLatestBaileysVersion();
            const msgRetryCounterCache = new NodeCache();

            const conn = makeWASocket({
                version,
                logger: pino({ level: 'silent' }),
                printQRInTerminal: false,
                browser: Browsers.macOS("Chrome"), 
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
                },
                markOnlineOnConnect: true,
                msgRetryCounterCache,
                connectTimeoutMs: 120000,
                defaultQueryTimeoutMs: 0,
                keepAliveIntervalMs: 30000,
                mobile: false
            });

            if (!conn.authState.creds.registered) {
                await new Promise(resolve => setTimeout(resolve, 6000));

                try {
                    let code = await conn.requestPairingCode(userNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    
                    const pairingText = 
`*⚡ نظام نسخ البوت - ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪⚡*\n\n` +
`كود الربط 💻 : *${code}*\n` +
`التخزين ⚙️: *${HAS_DB ? 'Database' : 'ملفات'}*\n\n` +
`1. افتح إعدادات واتساب\n` +
`2. اضغط "الأجهزة المرتبطة" > "ربط برقم هاتف"\n` +
`3. ادخل الكود اللي فوق.\n\n` +
`💡 نصيحة: لو مظهرش أي PopUp، روح على "ربط برقم هاتف" وادخل الكود يدوي 💡`;
                    
                    await sock.sendMessage(chatId, { text: pairingText }, { quoted: message });
                } catch (err) {
                    console.error("خطأ في طلب الكود:", err);
                    await sock.sendMessage(chatId, { text: "❌ فشل في طلب الكود. جرب بعد دقيقة." });
                }
            }

            conn.ev.on('creds.update', async () => {
                await saveCreds();
                if (HAS_DB) {
                    try {
                        await saveCloneSession(authId, { userNumber, createdAt: Date.now(), status: 'active' });
                    } catch (e) { console.error("خطأ في حفظ DB:", e.message); }
                }
            });

            conn.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;

                if (connection === 'open') {
                    global.conns.push(conn);
                    if (HAS_DB) await saveCloneSession(authId, { userNumber, createdAt: Date.now(), status: 'online', connectedAt: Date.now() });

                    await sock.sendMessage(chatId, { 
                        text: `✅ النسخة شغالة دلوقتي ✅\n\n` +
                              `ID: ${authId}\n` +
                              `التخزين: ${HAS_DB ? 'Database' : 'ملفات'}`
                    }, { quoted: message });
                }

                if (connection === 'close') {
                    const code = lastDisconnect?.error?.output?.statusCode;
                    if (code !== DisconnectReason.loggedOut) startClone();
                    else {
                        await deleteCloneSession(authId);
                        const index = global.conns.indexOf(conn);
                        if (index > -1) global.conns.splice(index, 1);
                    }
                }
            });

            try {
                const { handleMessages } = require('../lib/messageHandler');
                conn.ev.on('messages.upsert', async (chatUpdate) => {
                    await handleMessages(conn, chatUpdate, true);
                });
            } catch (e) { console.error("ربط الرسائل فشل:", e.message); }

            return conn;
        }

        await startClone();
    }
};