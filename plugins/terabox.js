const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'تيرا_بوكس',
  aliases: ['tera', 'tbox', 'tbdl'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'تحميل الملفات من تيرابوكس',
  usage: '.terabox <رابط تيرابوكس>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const apiCallWithRetry = async (url, maxRetries = 3, baseDelay = 2000) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await wait(1000);
          const response = await axios.get(url, { 
            timeout: 60000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          return response;
        } catch (error) {
          const isRateLimited = error.response?.status === 429 || 
                               error.code === 'ECONNABORTED' ||
                               error.code === 'ETIMEDOUT';
          
          if (attempt === maxRetries) throw error;

          if (isRateLimited) {
            const delay = baseDelay * Math.pow(2, attempt - 1);
            console.log(`إعادة المحاولة بعد ${delay}ms... (${attempt}/${maxRetries})`);
            await wait(delay);
          } else {
            throw error;
          }
        }
      }
    };

    const downloadFileWithProgress = async (url, filepath, maxRetries = 3) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer',
            timeout: 600000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            headers: { 
              'User-Agent': 'Mozilla/5.0',
              'Referer': 'https://1024terabox.com/',
              'Accept': '*/*',
              'Connection': 'keep-alive'
            }
          });

          fs.writeFileSync(filepath, response.data);
          return true;
        } catch (error) {
          console.error(`فشل التحميل في المحاولة ${attempt}:`, error.message);
          
          if (attempt === maxRetries) {
            throw error;
          }
          
          const delay = 2000 * attempt;
          console.log(`إعادة المحاولة في ${delay}ms...`);
          await wait(delay);
        }
      }
    };

    const isValidTeraBoxUrl = (url) => {
      return url.includes('terabox.com') || 
             url.includes('1024terabox.com') || 
             url.includes('teraboxapp.com') ||
             url.includes('terabox.app');
    };

    try {
      const url = args.join(' ').trim();

      if (!url) {
        return await sock.sendMessage(
          chatId,
          { text: '📦 *محمل تيرابوكس*\n\nالاستخدام:\n.terabox <رابط>\n\nمثال:\n.terabox https://1024terabox.com/s/xxxxx' },
          { quoted: message }
        );
      }

      if (!isValidTeraBoxUrl(url)) {
        return await sock.sendMessage(
          chatId,
          { text: '❌ *رابط تيرابوكس غير صالح!*\n\nمن فضلك أرسل رابط صحيح.' },
          { quoted: message }
        );
      }

      await sock.sendMessage(
        chatId,
        { text: '⏳ *جاري معالجة الرابط...*\n\nيرجى الانتظار، جاري جلب معلومات الملف...' },
        { quoted: message }
      );

      const apiUrl = `https://api.qasimdev.dpdns.org/api/terabox/download?apiKey=qasim-dev&url=${encodeURIComponent(url)}`;
      const apiResponse = await apiCallWithRetry(apiUrl, 3, 3000);

      if (!apiResponse.data?.success || !apiResponse.data?.data?.files || apiResponse.data.data.files.length === 0) {
        return await sock.sendMessage(
          chatId,
          { text: '❌ *فشل التحميل!*\n\nلم يتم العثور على ملفات أو الرابط غير صحيح.' },
          { quoted: message }
        );
      }

      const fileData = apiResponse.data.data;
      const files = fileData.files;
      const totalFiles = fileData.totalFiles;

      const file = files[0];
      const title = file.title;
      const size = file.size;
      const downloadUrl = file.downloadUrl;
      const fileType = file.type;

      await sock.sendMessage(
        chatId,
        { text: `📦 *ملف تيرابوكس*\n\n📄 *الاسم:* ${title}\n📊 *الحجم:* ${size}\n📁 *النوع:* ${fileType}\n📂 *عدد الملفات:* ${totalFiles}\n\n⏳ *جاري التحميل...*\nقد يستغرق بعض الوقت إذا كان الملف كبير.` },
        { quoted: message }
      );

      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const sanitizedTitle = title.replace(/[^a-z0-9.]/gi, '_').substring(0, 100);
      const filename = `${Date.now()}_${sanitizedTitle}`;
      const filePath = path.join(tempDir, filename);

      await downloadFileWithProgress(downloadUrl, filePath);

      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      if (fileSizeInMB > 100) {
        fs.unlinkSync(filePath);
        return await sock.sendMessage(
          chatId,
          { text: `❌ *الملف كبير جداً!*\n\n📄 *الملف:* ${title}\n📊 *الحجم:* ${size}\n\n⚠️ واتساب يسمح بحد أقصى 100MB.` },
          { quoted: message }
        );
      }

      const fileExtension = title.split('.').pop().toLowerCase();
      const videoExtensions = ['mp4','mkv','avi','mov','wmv','flv','webm','3gp'];
      const audioExtensions = ['mp3','wav','aac','flac','m4a','ogg','opus'];
      const imageExtensions = ['jpg','jpeg','png','gif','bmp','webp'];

      const fileBuffer = fs.readFileSync(filePath);

      if (videoExtensions.includes(fileExtension)) {
        await sock.sendMessage(
          chatId,
          {
            video: fileBuffer,
            mimetype: 'video/mp4',
            fileName: title,
            caption: `✅ *تم التحميل بنجاح!*\n\n📄 *الملف:* ${title}\n📊 *الحجم:* ${size}`
          },
          { quoted: message }
        );
      } else if (audioExtensions.includes(fileExtension)) {
        await sock.sendMessage(
          chatId,
          {
            audio: fileBuffer,
            mimetype: 'audio/mpeg',
            fileName: title,
            ptt: false
          },
          { quoted: message }
        );

        await sock.sendMessage(
          chatId,
          { text: `✅ *تم التحميل بنجاح!*\n\n📄 *الملف:* ${title}\n📊 *الحجم:* ${size}` },
          { quoted: message }
        );
      } else if (imageExtensions.includes(fileExtension)) {
        await sock.sendMessage(
          chatId,
          {
            image: fileBuffer,
            caption: `✅ *تم التحميل بنجاح!*\n\n📄 *الملف:* ${title}\n📊 *الحجم:* ${size}`
          },
          { quoted: message }
        );
      } else {
        await sock.sendMessage(
          chatId,
          {
            document: fileBuffer,
            mimetype: 'application/octet-stream',
            fileName: title,
            caption: `✅ *تم التحميل بنجاح!*\n\n📄 *الملف:* ${title}\n📊 *الحجم:* ${size}`
          },
          { quoted: message }
        );
      }

      fs.unlinkSync(filePath);

      if (totalFiles > 1) {
        await sock.sendMessage(
          chatId,
          { text: `ℹ️ *ملاحظة:* هذا الرابط يحتوي على ${totalFiles} ملفات.\nتم تحميل أول ملف فقط.` },
          { quoted: message }
        );
      }

    } catch (error) {
      console.error('[TERABOX] Command Error:', error);
      
      let errorMsg = "❌ *فشل التحميل!*\n\n";
      
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        errorMsg += "*السبب:* انتهت مهلة الاتصال، ربما الملف كبير.";
      } else if (error.code === 'ECONNRESET') {
        errorMsg += "*السبب:* انقطع الاتصال أثناء التحميل.";
      } else if (error.response?.status === 429) {
        errorMsg += "*السبب:* تم تجاوز الحد المسموح للطلبات.";
      } else if (error.response?.status === 403) {
        errorMsg += "*السبب:* الرابط خاص أو منتهي.";
      } else if (error.response?.status === 404) {
        errorMsg += "*السبب:* الملف غير موجود.";
      } else {
        errorMsg += `*خطأ:* ${error.message || 'خطأ غير معروف'}`;
      }

      errorMsg += "\n\n💡 *نصائح:*\n- تأكد أن الرابط عام\n- تأكد أن الرابط لم ينته\n- جرب ملفات أصغر\n- انتظر قليلاً بين كل طلب";

      await sock.sendMessage(
        chatId,
        { text: errorMsg },
        { quoted: message }
      );
    }
  }
};