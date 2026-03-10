const axios = require('axios')

module.exports = {
  command: 'تطبيق_2',
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

      await sock.sendMessage(chatId,{text:" جاري البحث عن البرنامج..🔎."},{quoted:message})

      const res = await axios.get(`https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(query)}&limit=1`)
      const app = res.data.datalist.list[0]

      if (!app) {
        return sock.sendMessage(chatId,{text:" لم يتم العثور على البرنامج ❌"},{quoted:message})
      }

      const caption =
`📦 الاسم: ${app.name}
👨‍💻 المطور: ${app.store.name}
⭐ التقييم: ${app.stats.rating.avg}

⬇️ التحميل:
${app.file.path}

*BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`

      await sock.sendMessage(chatId,{
        image:{url:app.icon},
        caption:caption
      },{quoted:message})

    } catch (err) {
      console.log(err)
      sock.sendMessage(chatId,{
        text:"❌ حصل خطأ أثناء البحث"
      },{quoted:message})
    }
  }
}