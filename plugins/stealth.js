const store = require('../lib/lightweight_store');

module.exports = {
    command: 'وضع_التخفي',
    aliases: ['stealth', 'وضع_التخفي'],
    category: 'اوامـࢪ الـمـطـوࢪ',
    description: 'تشغيل أو إيقاف وضع التخفي للبوت',
    usage: '.التخفي <تشغيل|ايقاف>',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const { chatId } = context;
        
        const action = args[0]?.toLowerCase();
        
        if (!action || !['تشغيل','ايقاف','on','off'].includes(action)) {
            const currentState = await store.getSetting('global', 'stealthMode');
            const status = currentState?.enabled ? 'مفعل ✅' : 'متوقف ❌';
            
            let autotypingWarning = '';
            try {
                const autotypingState = await store.getSetting('global', 'autotyping');
                if (autotypingState?.enabled && currentState?.enabled) {
                    autotypingWarning = '\n\n⚠️ *الكتابة التلقائية مفعلة* لكنها لن تعمل مع وضع التخفي.';
                }
            } catch (e) {}

            let autoreadWarning = '';
            try {
                const autoreadState = await store.getSetting('global', 'autoread');
                if (autoreadState?.enabled && currentState?.enabled) {
                    autoreadWarning = '\n⚠️ *القراءة التلقائية مفعلة* لكنها لن تعمل مع وضع التخفي.';
                }
            } catch (e) {}
            
            return await sock.sendMessage(chatId, { 
                text: `👻 *حالة وضع التخفي:* ${status}

*طريقة الاستخدام:*  
.التخفي تشغيل  
.التخفي ايقاف

*ماذا يفعل؟*
• يمنع حالة الكتابة
• يمنع ظهور البوت أونلاين
• يخفي آخر ظهور للبوت

*عند التفعيل:*
✓ لا يظهر "يكتب..."
✓ لا يظهر "متصل"
✓ البوت يعمل في وضع التخفي الكامل${autotypingWarning}${autoreadWarning}` 
            }, { quoted: message });
        }

        const enabled = action === 'تشغيل' || action === 'on';
        await store.saveSetting('global', 'stealthMode', { enabled });

        let warnings = '';
        if (enabled) {
            try {
                const autotypingState = await store.getSetting('global', 'autotyping');
                const autoreadState = await store.getSetting('global', 'autoread');
                
                if (autotypingState?.enabled || autoreadState?.enabled) {
                    warnings = '\n\n*⚠️ ملاحظة:*\n';
                    if (autotypingState?.enabled) warnings += '• الكتابة التلقائية مفعلة لكنها لن تعمل\n';
                    if (autoreadState?.enabled) warnings += '• القراءة التلقائية مفعلة لكنها لن تعمل\n';
                }
            } catch (e) {}
        }

        await sock.sendMessage(chatId, { 
            text: `👻 تم ${enabled ? 'تفعيل' : 'إيقاف'} *وضع التخفي*

${enabled 
? '✓ البوت الآن في وضع التخفي الكامل\n✓ لا يظهر متصل\n✓ لا يظهر يكتب...' 
: '✓ تم تفعيل حالة الظهور\n✓ سيظهر يكتب إذا كانت الكتابة التلقائية مفعلة'}${warnings}` 
        }, { quoted: message });
    }
};