const fetch = require('node-fetch');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

module.exports = {
  command: 'مزج_الإيموجي',
  aliases: ['mixemoji', 'emix'],
  category: 'اوامـࢪ الاسـتـيـكـࢪ',
  description: 'يمزج إيموجيين ويبعتهم على شكل ستكر',
  usage: '.مزج_الإيموجي 😎+🥰',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      if (!args[0]) {
        await sock.sendMessage(chatId, {
          text: 'مثال 📝 :\n .مزج_الإيموجي 😎+🥰'
        }, { quoted: message });
        return;
      }

      if (!args[0].includes('+')) {
        await sock.sendMessage(chatId, {
          text: '✳️ افصل بين الإيموجيين بعلامة *+* ✳️\n\n مثال 📝 :\n.مزج_الإيموجي 😎+🥰'
        }, { quoted: message });
        return;
      }

      let [emoji1, emoji2] = args[0].split('+').map(e => e.trim());

      const url =
        `https://tenor.googleapis.com/v2/featured?` +
        `key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ` +
        `&contentfilter=high&media_filter=png_transparent` +
        `&component=proactive&collection=emoji_kitchen_v5` +
        `&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        await sock.sendMessage(chatId, {
          text: ' مش قادر يمزج الإيموجيين دول جرب إيموجيين تانيين 😄❤️'
        }, { quoted: message });
        return;
      }

      const imageUrl = data.results[0].url;
      const tmpDir = path.join(process.cwd(), 'tmp');

      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      const tempFile = path.join(tmpDir, `temp_${Date.now()}.png`).replace(/\\/g, '/');
      const outputFile = path.join(tmpDir, `sticker_${Date.now()}.webp`).replace(/\\/g, '/');

      const imageResponse = await fetch(imageUrl);
      const buffer = await imageResponse.buffer();
      fs.writeFileSync(tempFile, buffer);

      const ffmpegCommand =
        `ffmpeg -i "${tempFile}" ` +
        `-vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,` +
        `pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" ` +
        `"${outputFile}"`;

      await new Promise((resolve, reject) => {
        exec(ffmpegCommand, (error) => {
          if (error) {
            console.error('FFmpeg error:', error);
            reject(error);
          } else {
            resolve();
          }
        });
      });

      if (!fs.existsSync(outputFile)) {
        throw new Error('فشل إنشاء الستكر');
      }

      const stickerBuffer = fs.readFileSync(outputFile);

      await sock.sendMessage(chatId, {
        sticker: stickerBuffer
      }, { quoted: message });

      // تنظيف الملفات المؤقتة
      try {
        fs.unlinkSync(tempFile);
        fs.unlinkSync(outputFile);
      } catch (err) {
        console.error('خطأ أثناء تنظيف الملفات المؤقتة 😄', err);
      }

    } catch (error) {
      console.error('خطأ في أمر مزج الإيموجي 🙂', error);
      await sock.sendMessage(chatId, {
        text:
          ' فشل في مزج الإيموجيين 😄\n\n' +
          ' مثال 📝 :\n.مزج_الإيموجي 😎+🥰'
      }, { quoted: message });
    }
  }
};