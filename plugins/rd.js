// ملف أمر: رد_تلقائي.js
module.exports = {
    name: 'رد_تلقائي',
    category: 'admin', // ممكن تحطه 'general' لو مش عايز ادمن
    description: 'تشغيل أو إيقاف الردود التلقائية',
    ownerOnly: true,
    
    async handle(client, msg, args) {

        // متغير داخلي لتشغيل/إيقاف الردود
        if (!global.autoReplyEnabled) global.autoReplyEnabled = true;

        // الردود التلقائية محفوظة جوه الكود
        const autoReplies = [
            { keyword: 'سلام عليكم', reply: 'وعليكم السلام ورحمة الله 😎' },
            { keyword: 'مرحبا', reply: 'أهلا بيك 😁' },
            { keyword: 'عامل ايه', reply: 'تمام الحمد لله وانت؟ 😎' }
        ];

        const text = args.join(' ').toLowerCase();

        // أوامر التشغيل والإيقاف
        if (text === 'تشغيل') {
            global.autoReplyEnabled = true;
            await client.sendMessage(msg.from, { text: '✅ الردود التلقائية شغالة دلوقتي' });
            return;
        }
        if (text === 'ايقاف' || text === 'تعطيل') {
            global.autoReplyEnabled = false;
            await client.sendMessage(msg.from, { text: '❌ الردود التلقائية اتقفلت دلوقتي' });
            return;
        }

        // الرد التلقائي على الرسائل الجديدة
        if (!global.autoReplyEnabled) return;

        for (let ar of autoReplies) {
            if (msg.body && msg.body.toLowerCase().includes(ar.keyword.toLowerCase())) {
                await client.sendMessage(msg.from, { text: ar.reply });
                break;
            }
        }
    }
};