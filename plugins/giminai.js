const { GoogleGenerativeAI } = require("@google/generative-ai");

// ضع مفتاح الـ API الخاص بك هنا
const API_KEY = "AIzaSyBvGPz3B0SgiV301nNlhWDlWWwA0gbEF-k"; 
const genAI = new GoogleGenerativeAI(API_KEY);

module.exports = {
  command: 'جيميناي',
  aliases: ['gemini', 'ذكاء', 'ai'],
  category: 'الـذكـاء الاصـطـنـاعـي',
  description: 'التحدث مع الذكاء الاصطناعي Gemini 🤖',
  usage: '.جيميناي <سؤالك>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const prompt = args.join(" ");

    // 1. التأكد أن المستخدم كتب سؤال
    if (!prompt) {
      return sock.sendMessage(chatId, {
        text: 'يا هلا! أنا جيميناي.. اسألني أي سؤال، مثلاً:\n.جيميناي كيف أتعلم البرمجة؟'
      }, { quoted: message });
    }

    try {
      // 2. إظهار رد فعل "جاري الكتابة" أو "تفاعل"
      await sock.sendMessage(chatId, { react: { text: '🤔', key: message.key } });

      // 3. إعداد الموديل (استخدام gemini-1.5-flash لأنه الأسرع)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // 4. إرسال الطلب للذكاء الاصطناعي
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // 5. إرسال الإجابة للمستخدم
      await sock.sendMessage(chatId, {
        text: text.trim() + '\n\n*Powered by Gemini 1.5 Flash ⚡*'
      }, { quoted: message });

      // 6. تفاعل بالنجاح
      await sock.sendMessage(chatId, { react: { text: '✨', key: message.key } });

    } catch (err) {
      console.error("Gemini Error:", err);
      
      // التعامل مع الأخطاء الشائعة (مثل انتهاء الكوتا أو مفتاح غلط)
      let errorMessage = 'للأسف حصل مشكلة في الاتصال بالذكاء الاصطناعي. حاول تاني كمان شوية! 🛠️';
      
      if (err.message.includes('API_KEY_INVALID')) {
        errorMessage = 'خطأ: مفتاح الـ API غير صحيح. يرجى التأكد منه في الكود.';
      }

      await sock.sendMessage(chatId, { text: errorMessage }, { quoted: message });
    }
  }
};