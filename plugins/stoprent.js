const store = require('../lib/lightweight_store');
const fs = require('fs');
const path = require('path');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

async function deleteCloneSession(authId) {
    if (HAS_DB) {
        await store.saveSetting('clones', authId, null);
    } else {
        const sessionPath = path.join(process.cwd(), 'session', 'clones', authId);
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
        }
    }
}

async function getAllCloneAuthIds() {
    if (HAS_DB) {
        const settings = await store.getAllSettings('clones') || {};
        return Object.entries(settings)
            .filter(([key, value]) => value && value.status)
            .map(([authId]) => authId);
    } else {
        const clonesDir = path.join(process.cwd(), 'session', 'clones');
        if (!fs.existsSync(clonesDir)) return [];
        return fs.readdirSync(clonesDir);
    }
}

async function deleteAllCloneSessions() {
    const authIds = await getAllCloneAuthIds();
    for (const authId of authIds) {
        await deleteCloneSession(authId);
    }
}

module.exports = {
    command: 'ايقاف_ربط',
    aliases: ['stoprent', 'حذف_بوت', 'ايقاف_بوت'],
    category: 'اوامـࢪ الـمـطـوࢪ',
    description: 'إيقاف بوت فرعي معين أو إيقاف كل البوتات الفرعية',
    usage: '.ايقاف_تأجير [رقم/الكل]',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const { chatId } = context;

        if (!global.conns || global.conns.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: "❌ لا يوجد أي بوتات فرعية تعمل حالياً." 
            }, { quoted: message });
        }

        if (!args[0]) {
            return await sock.sendMessage(chatId, { 
                text: `❌ اكتب رقم البوت من القائمة أو كلمة "الكل".\nمثال:\n.ايقاف_تأجير 1` 
            }, { quoted: message });
        }

        if (args[0].toLowerCase() === 'all' || args[0] === 'الكل') {

            let stoppedCount = 0;

            for (let conn of global.conns) {
                try {
                    await conn.logout();
                    conn.end();
                    stoppedCount++;
                } catch (e) {
                    console.error('خطأ أثناء إيقاف البوت:', e.message);
                }
            }

            global.conns = [];

            if (HAS_DB) {
                try {
                    await deleteAllCloneSessions();
                } catch (e) {
                    console.error('خطأ أثناء حذف الجلسات:', e.message);
                }
            } else {
                const clonesDir = path.join(process.cwd(), 'session', 'clones');
                if (fs.existsSync(clonesDir)) {
                    fs.rmSync(clonesDir, { recursive: true, force: true });
                    fs.mkdirSync(clonesDir, { recursive: true });
                }
            }

            return await sock.sendMessage(chatId, { 
                text: `✅ تم إيقاف وحذف كل البوتات الفرعية.\n\n` +
                      `عدد البوتات التي توقفت: ${stoppedCount}\n` +
                      `التخزين: ${HAS_DB ? 'تم تنظيف قاعدة البيانات' : 'تم حذف الملفات'}` 
            }, { quoted: message });
        }

        const index = parseInt(args[0]) - 1;

        if (isNaN(index) || !global.conns[index]) {
            return await sock.sendMessage(chatId, { 
                text: "❌ رقم غير صحيح. استخدم أمر `.listrent` أولاً." 
            }, { quoted: message });
        }

        try {
            const target = global.conns[index];
            const targetJid = target.user.id;
            const targetNumber = targetJid.split(':')[0];

            await target.logout();
            global.conns.splice(index, 1);

            if (HAS_DB) {
                const allSettings = await store.getAllSettings('clones') || {};
                for (const [authId, data] of Object.entries(allSettings)) {
                    if (data && data.userNumber === targetNumber) {
                        await deleteCloneSession(authId);
                        break;
                    }
                }
            } else {
                const clonesDir = path.join(process.cwd(), 'session', 'clones');
                if (fs.existsSync(clonesDir)) {
                    const dirs = fs.readdirSync(clonesDir);
                    for (const dir of dirs) {
                        const sessionPath = path.join(clonesDir, dir, 'session.json');
                        if (fs.existsSync(sessionPath)) {
                            try {
                                const data = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
                                if (data.userNumber === targetNumber) {
                                    fs.rmSync(path.join(clonesDir, dir), { recursive: true, force: true });
                                    break;
                                }
                            } catch (e) {
                                continue;
                            }
                        }
                    }
                }
            }

            await sock.sendMessage(chatId, { 
                text: `✅ تم إيقاف وحذف البوت الفرعي: @${targetNumber}\n\n` +
                      `التخزين: ${HAS_DB ? 'تم تنظيف قاعدة البيانات' : 'تم حذف الملفات'}`, 
                mentions: [targetJid] 
            }, { quoted: message });

        } catch (err) {
            console.error(err);

            await sock.sendMessage(chatId, { 
                text: "❌ حدث خطأ أثناء إيقاف البوت الفرعي." 
            }, { quoted: message });
        }
    }
};