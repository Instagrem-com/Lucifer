const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const mentionFilePath = path.join(__dirname, '..', 'data', 'mention.json');

async function loadState() {
    try {
        if (HAS_DB) {
            const state = await store.getSetting('global', 'mention');
            if (state && typeof state.assetPath === 'string' && state.assetPath.endsWith('assets/mention_default.webp')) {
                return { enabled: !!state.enabled, assetPath: '', type: 'text' };
            }
            return state || { enabled: false, assetPath: '', type: 'text' };
        } else {
            const raw = fs.readFileSync(mentionFilePath, 'utf8');
            const state = JSON.parse(raw);
            if (state && typeof state.assetPath === 'string' && state.assetPath.endsWith('assets/mention_default.webp')) {
                return { enabled: !!state.enabled, assetPath: '', type: 'text' };
            }
            return state;
        }
    } catch {
        return { enabled: false, assetPath: '', type: 'text' };
    }
}

async function saveState(state) {
    if (HAS_DB) {
        await store.saveSetting('global', 'mention', state);
    } else {
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        fs.writeFileSync(mentionFilePath, JSON.stringify(state, null, 2));
    }
}

async function ensureDefaultSticker(state) {
    try {
        const assetPath = path.join(__dirname, '..', state.assetPath);
        if (state.assetPath.endsWith('mention_default.webp') && !fs.existsSync(assetPath)) {
            const defaultStickerPath = path.join(__dirname, '..', 'assets', 'stickintro.webp');
            if (fs.existsSync(defaultStickerPath)) fs.copyFileSync(defaultStickerPath, assetPath);
            else {
                const assetsDir = path.dirname(assetPath);
                if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
                fs.writeFileSync(assetPath.replace('.webp', '.txt'), 'ملف منشن افتراضي مش موجود');
            }
        }
    } catch (e) {
        console.warn('ensureDefaultSticker failed:', e?.message || e);
    }
}

async function handleMentionDetection(sock, chatId, message) {
    try {
        if (message.key?.fromMe) return;

        const state = await loadState();
        await ensureDefaultSticker(state);
        if (!state.enabled) return;

        const rawId = sock.user?.id || sock.user?.jid || '';
        if (!rawId) return;
        const botNum = rawId.split('@')[0].split(':')[0];
        const botJids = [`${botNum}@s.whatsapp.net`, `${botNum}@whatsapp.net`, rawId];
        const msg = message.message || {};
        const contexts = [
            msg.extendedTextMessage?.contextInfo,
            msg.imageMessage?.contextInfo,
            msg.videoMessage?.contextInfo,
            msg.documentMessage?.contextInfo,
            msg.stickerMessage?.contextInfo,
            msg.buttonsResponseMessage?.contextInfo,
            msg.listResponseMessage?.contextInfo
        ].filter(Boolean);

        let mentioned = [];
        for (const c of contexts) if (Array.isArray(c.mentionedJid)) mentioned = mentioned.concat(c.mentionedJid);

        const directMentionLists = [msg.extendedTextMessage?.mentionedJid, msg.mentionedJid].filter(Array.isArray);
        for (const arr of directMentionLists) mentioned = mentioned.concat(arr);

        if (!mentioned.length) {
            const rawText = (msg.conversation || msg.extendedTextMessage?.text || msg.imageMessage?.caption || msg.videoMessage?.caption || '').toString();
            if (rawText) {
                const safeBot = botNum.replace(/[-\s]/g, '');
                const re = new RegExp(`@?${safeBot}\\b`);
                if (!re.test(rawText.replace(/\s+/g, ''))) return;
            } else return;
        }

        const isBotMentioned = mentioned.some(j => botJids.includes(j));
        if (!isBotMentioned) return;
        
        if (!state.assetPath) return await sock.sendMessage(chatId, { text: 'هلا 😎' }, { quoted: message });
        const assetPath = path.join(__dirname, '..', state.assetPath);
        if (!fs.existsSync(assetPath)) return await sock.sendMessage(chatId, { text: 'هلا 😎' }, { quoted: message });

        try {
            if (state.type === 'sticker') await sock.sendMessage(chatId, { sticker: fs.readFileSync(assetPath) }, { quoted: message });
            else {
                const payload = {};
                if (state.type === 'image') payload.image = fs.readFileSync(assetPath);
                else if (state.type === 'video') { payload.video = fs.readFileSync(assetPath); if (state.gifPlayback) payload.gifPlayback = true; }
                else if (state.type === 'audio') { payload.audio = fs.readFileSync(assetPath); payload.mimetype = state.mimetype || 'audio/mpeg'; if (state.ptt) payload.ptt = true; }
                else if (state.type === 'text') payload.text = fs.readFileSync(assetPath, 'utf8');
                else payload.text = 'هلا 😎';
                await sock.sendMessage(chatId, payload, { quoted: message });
            }
        } catch {
            await sock.sendMessage(chatId, { text: 'هلا 😎' }, { quoted: message });
        }
    } catch (err) {
        console.error('handleMentionDetection error:', err);
    }
}

async function setMentionCommand(sock, chatId, message, isOwner) {
    if (!isOwner) return sock.sendMessage(chatId, { text: '❌ *مسموح بس للمالك أو السوبر مالك*' }, { quoted: message });
    const ctx = message.message?.extendedTextMessage?.contextInfo;
    const qMsg = ctx?.quotedMessage;
    if (!qMsg) return sock.sendMessage(chatId, { text: '❌ *رد على رسالة نصية أو ميديا*\n\nالمسموح: نص، ستكر، صورة، فيديو، صوت' }, { quoted: message });

    let type = 'sticker', buf, dataType;
    if (qMsg.stickerMessage) dataType = 'stickerMessage', type = 'sticker';
    else if (qMsg.imageMessage) dataType = 'imageMessage', type = 'image';
    else if (qMsg.videoMessage) dataType = 'videoMessage', type = 'video';
    else if (qMsg.audioMessage) dataType = 'audioMessage', type = 'audio';
    else if (qMsg.documentMessage) dataType = 'documentMessage', type = 'file';
    else if (qMsg.conversation || qMsg.extendedTextMessage?.text) type = 'text';
    else return sock.sendMessage(chatId, { text: '❌ *نوع الميديا مش مدعوم*\nرد على: نص، ستكر، صورة، فيديو، صوت' }, { quoted: message });

    if (type === 'text') buf = Buffer.from(qMsg.conversation || qMsg.extendedTextMessage?.text || '', 'utf8');
    else {
        try {
            const media = qMsg[dataType];
            const kind = type === 'sticker' ? 'sticker' : type;
            const stream = await downloadContentFromMessage(media, kind);
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            buf = Buffer.concat(chunks);
        } catch {
            return sock.sendMessage(chatId, { text: '❌ *فشل تحميل الميديا*' }, { quoted: message });
        }
    }

    if (buf.length > 1024 * 1024) return sock.sendMessage(chatId, { text: '❌ *الملف كبير جداً*\nالحد الأقصى: 1 MB' }, { quoted: message });

    let mimetype = qMsg[dataType]?.mimetype || '';
    let ptt = !!qMsg.audioMessage?.ptt;
    let gifPlayback = !!qMsg.videoMessage?.gifPlayback;
    let ext = type === 'sticker' ? 'webp' : type === 'image' ? mimetype.includes('png') ? 'png' : 'jpg' : type === 'video' ? 'mp4' : type === 'audio' ? 'mp3' : 'txt';

    try {
        const assetsDir = path.join(__dirname, '..', 'assets');
        if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
        const outName = `mention_custom.${ext}`;
        const outPath = path.join(assetsDir, outName);
        fs.writeFileSync(outPath, buf);

        const state = await loadState();
        state.assetPath = path.join('assets', outName);
        state.type = type;
        if (type === 'audio') state.mimetype = mimetype, state.ptt = ptt;
        if (type === 'video') state.gifPlayback = gifPlayback;
        await saveState(state);
        return sock.sendMessage(chatId, { text: `✅ *تم تحديث رد المنشن!*\nنوع الرد: ${type}\nمكان التخزين: ${HAS_DB ? 'قاعدة بيانات' : 'ملفات'}` }, { quoted: message });
    } catch (e) {
        return sock.sendMessage(chatId, { text: '❌ *فشل حفظ الملف*' }, { quoted: message });
    }
}

module.exports = {
    command: 'عـمـگ لـوسـيـفـر بـحـبـگ.💀🖤',
    aliases: ['اضبط_منشن', 'رد_منشن'],
    category: '✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪',
    description: 'تشغيل أو ضبط رد المنشن المخصص',
    usage: '.منشن <on|off> أو .اضبط_منشن (رد على رسالة)',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const onoff = args[0]?.toLowerCase();
        if (!onoff || !['on','off'].includes(onoff)) return sock.sendMessage(chatId, { text: '❌ *الاستخدام غلط*\n\nمثال: `.منشن on|off`' }, { quoted: message });
        const state = await loadState();
        state.enabled = onoff === 'on';
        await saveState(state);
        return sock.sendMessage(chatId, { text: `✅ *رد المنشن ات${state.enabled ? 'فعل' : 'عطل'}*\nمكان التخزين: ${HAS_DB ? 'قاعدة بيانات' : 'ملفات'}` }, { quoted: message });
    },

    handleMentionDetection,
    setMentionCommand
};