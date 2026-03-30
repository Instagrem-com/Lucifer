const axios = require('axios')

module.exports = {
  command: 'تطبيق',
  aliases: ['apk','برنامج'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'تنزيل برنامج اندرويد',
  usage: '.تطبيق <اسم البرنامج>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid
    const query = args.join(" ")

    if (!query) {
      return sock.sendMessage(chatId,{
        text: "📱 اكتب اسم البرنامج بالإنجليزي 📱\nمثال 📝 :\n.تطبيق whatsapp"
      },{quoted:message})
    }

    try {

      await sock.sendMessage(chatId,{
        text:"🔎 جاري البحث عن البرنامج..."
      },{quoted:message})

      const res = await axios.get(`https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(query)}&limit=1`)
      const app = res.data.datalist.list[0]

      if (!app) {
        return sock.sendMessage(chatId,{
          text:"❌ لم يتم العثور على البرنامج"
        },{quoted:message})
      }

      const apkUrl = app.file.path

      await sock.sendMessage(chatId,{
        text:`⬇️ جاري رفع التطبيق على الواتساب...\n📦 ${app.name}`
      },{quoted:message})

      await sock.sendMessage(chatId,{
        document: { url: apkUrl },
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${app.name}.apk`,
        caption:
`📦 الاسم: ${app.name}
👨‍💻 المطور: ${app.store.name}
⭐ التقييم: ${app.stats.rating.avg}

*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`
      },{quoted:message})

    } catch (err) {
      console.log(err)
      sock.sendMessage(chatId,{
        text:"❌ حصل خطأ أثناء تحميل التطبيق"
      },{quoted:message})
    }
  }
}