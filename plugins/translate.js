const fetch = require('node-fetch');

module.exports = {
  command: 'ترجمة', // الاسم بالعربي
  aliases: ['trt', 'ترجم'],
  category: 'اوامـࢪ الاداوات',
  description: 'ترجم النص إلى اللغة المطلوبة',
  usage: '.ترجمة <النص> <اللغة> أو رد على رسالة مع .ترجمة <اللغة>',
  
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      // تحديث حالة الكتابة
      await sock.presenceSubscribe(chatId);
      await sock.sendPresenceUpdate('composing', chatId);

      let textToTranslate = '';
      let lang = '';

      // التحقق إذا كان المستخدم رد على رسالة
      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quotedMessage) {
        textToTranslate = quotedMessage.conversation || 
                          quotedMessage.extendedTextMessage?.text || 
                          quotedMessage.imageMessage?.caption || 
                          quotedMessage.videoMessage?.caption || 
                          '';

        lang = args[0]?.trim();
      } else {
        // إذا لم يتم الرد على رسالة، يجب كتابة النص واللغة
        if (args.length < 2) {
          return await sock.sendMessage(chatId, {
            text: `🌐 *مترجم النصوص*\n\nطريقة الاستخدام:\n1. رد على رسالة مع: .ترجمة <كود اللغة>\n2. أو كتابة: .ترجمة <النص> <كود اللغة>\n\nمثال:\n.ترجمة hello fr\n.trt hello fr\n\nأكواد بعض اللغات:\nfr - فرنسي\nes - إسباني\nde - ألماني\nit - إيطالي\npt - برتغالي\nru - روسي\nja - ياباني\nko - كوري\nzh - صيني\nar - عربي\nhi - هندي`,
            quoted: message
          });
        }

        lang = args.pop();
        textToTranslate = args.join(' ');
      }

      if (!textToTranslate) {
        return await sock.sendMessage(chatId, {
          text: '❌ لم يتم العثور على نص للترجمة. الرجاء كتابة نص أو الرد على رسالة.',
          quoted: message
        });
      }

      let translatedText = null;
      let error = null;

      // تجربة Google Translate API
      try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(textToTranslate)}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data[0] && data[0][0] && data[0][0][0]) {
            translatedText = data[0][0][0];
          }
        }
      } catch (e) {
        error = e;
      }

      // تجربة MyMemory API إذا فشل السابق
      if (!translatedText) {
        try {
          const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=auto|${lang}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.responseData && data.responseData.translatedText) {
              translatedText = data.responseData.translatedText;
            }
          }
        } catch (e) {
          error = e;
        }
      }

      // تجربة API إضافية
      if (!translatedText) {
        try {
          const response = await fetch(`https://api.dreaded.site/api/translate?text=${encodeURIComponent(textToTranslate)}&lang=${lang}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.translated) {
              translatedText = data.translated;
            }
          }
        } catch (e) {
          error = e;
        }
      }

      if (!translatedText) {
        throw new Error('فشل جميع واجهات الترجمة');
      }

      await sock.sendMessage(chatId, {
        text: `📝 *الترجمة:*\n\n${translatedText}`,
      }, {
        quoted: message
      });

    } catch (error) {
      console.error('❌ خطأ في أمر الترجمة:', error);
      await sock.sendMessage(chatId, {
        text: '❌ فشل ترجمة النص. الرجاء المحاولة لاحقًا.\n\nطريقة الاستخدام:\n1. رد على رسالة مع: .ترجمة <كود اللغة>\n2. أو كتابة: .ترجمة <النص> <كود اللغة>',
        quoted: message
      });
    }
  }
};