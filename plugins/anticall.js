const store = require('../lib/lightweight_store');
const fs = require('fs');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const ANTICALL_PATH = './data/anticall.json';

async function readState() {
  try {
    if (HAS_DB) {
      const settings = await store.getSetting('global', 'anticall');
      return settings || { enabled: false };
    } else {
      if (!fs.existsSync(ANTICALL_PATH)) return { enabled: false };
      const raw = fs.readFileSync(ANTICALL_PATH, 'utf8');
      const data = JSON.parse(raw || '{}');
      return { enabled: !!data.enabled };
    }
  } catch {
    return { enabled: false };
  }
}

async function writeState(enabled) {
  try {
    if (HAS_DB) {
      await store.saveSetting('global', 'anticall', { enabled: !!enabled });
    } else {
      if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
      fs.writeFileSync(ANTICALL_PATH, JSON.stringify({ enabled: !!enabled }, null, 2));
    }
  } catch (e) {
    console.error('Error writing anticall state:', e);
  }
}

module.exports = {
  command: 'ممنوع_المكالمات',
  aliases: ['ممنوع_الكول', 'callblock'],
  category: 'owner',
  description: 'تـفـعـيـل أو تـعـطـيـل حـجـب الـمـكـالـمـات الـواردة تلقائياً',
usage: '.ممنوع_المكالمات <تفعيل|تعطيل|عرض>',
ownerOnly: true,
  
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const state = await readState();
    const sub = args.join(' ').trim().toLowerCase();

    if (!sub || !['تفعيل', 'تعطيل', 'الوضع'].includes(sub)) {
      return await sock.sendMessage(
        chatId,
        {
          text: '*⚡ إعدادات مانع المكالمات ⚡*\n\n' +
                '📵 حـجـب الـمـكـالـمـات الـواردة تلقائياً 📵\n\n' +
                '*الاوامـر :*\n' +
                '• `.ممنوع_المكالمات تفعيل` - تفعيل\n' +
                '• `.ممنوع_المكالمات تعطيل` - تعطيل\n' +
                '• `.ممنوع_المكالمات عرض` - عرض الحالة الحالية\n\n' +
                `*الـحـالـة الحالية:* ${state.enabled ? '✅ مـفـعـل' : '❌ مـعـطـل'}\n` +
                `*التخـزيـن:* ${HAS_DB ? 'Database' : 'نظام الملفات'}`
        },
        { quoted: message }
      );
    }
    if (sub === 'عرض') {
      return await sock.sendMessage(
        chatId,
        { 
          text: `📵 *حـالـة مانع المكالمات* 📵\n\n` +
                `الـحـالـة الحالية: ${state.enabled ? '✅ *مـفـعـل*' : '❌ *مـعـطـل*'}\n` +
                `نـظـام الـتـخـزيـن: ${HAS_DB ? 'Database' : 'نظام الملفات'}\n\n` +
                `${state.enabled ? 'كـل الـمـكـالـمـات الـواردة سـتـتـم رفـضـهـا وحـجـبـهـا.' : 'الـمـكـالـمـات الـواردة مسـموح بها.'}`
        },
        { quoted: message }
      );
    }

    const enable = sub === 'تفعيل';
    await writeState(enable);

    await sock.sendMessage(
      chatId,
      { 
        text: `📵 *حـالـة مانع المكالمات 📵${enable ? 'مـفـعـل' : 'مـعـطـل'}*\n\n` +
              `${enable ? '✅ الـمـكـالـمـات الـواردة سـتـتـم رفـضـهـا وحـجـبـهـا تلقائياً.' : '❌ الـمـكـالـمـات الـواردة مـسـموح بـهـا الآن.'}`
      },
      { quoted: message }
    );
  },
  
  readState,
  writeState
};
