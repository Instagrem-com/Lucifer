const { spawn } = require('child_process');
const fs = require('fs');
const { writeExifVid } = require('../lib/exif');

module.exports = {
  command: 'تحويل_نص_لاستيكر',
  aliases: ['استيكر_نص', 'تحويل_نص_استيكر', 'attp'],
  category: 'stickers',
  description: 'يحول النص إلى استيكر متحرك',
  usage: '.نص_استيكر <النص>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = args.join(' ');

    if (!text) {
      return await sock.sendMessage(chatId, { 
        text: '✏️ اكتب النص بعد الأمر.\n\nمثال 📝 :\n.نص_استيكر >النص< 👀❤️'
      }, { quoted: message });
    }

    try {
      const mp4Buffer = await renderBlinkingVideoWithFfmpeg(text);
      const webpPath = await writeExifVid(mp4Buffer, { packname: '✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪' });

      const webpBuffer = fs.readFileSync(webpPath);
      try { fs.unlinkSync(webpPath); } catch {}

      await sock.sendMessage(chatId, { sticker: webpBuffer }, { quoted: message });

    } catch {
      await sock.sendMessage(chatId, { 
        text: 'حصل مشكله وانا بعمل الاستيكر 🙂' 
      }, { quoted: message });
    }
  }
};

function renderBlinkingVideoWithFfmpeg(text) {
    return new Promise((resolve, reject) => {

        const fontPath = process.platform === 'win32'
            ? 'C:/Windows/Fonts/arialbd.ttf'
            : '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

        const escapeDrawtextText = (s) => s
            .replace(/\\/g, '\\\\')
            .replace(/:/g, '\\:')
            .replace(/,/g, '\\,')
            .replace(/'/g, "\\'")
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]')
            .replace(/%/g, '\\%');

        const safeText = escapeDrawtextText(text);

        const safeFontPath = process.platform === 'win32'
            ? fontPath.replace(/\\/g, '/').replace(':', '\\:')
            : fontPath;

        const cycle = 0.3;
        const dur = 1.8;

        const drawRed = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=red:borderw=2:bordercolor=black@0.6:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='lt(mod(t\\,${cycle})\\,0.1)'`;

        const drawBlue = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=blue:borderw=2:bordercolor=black@0.6:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(mod(t\\,${cycle})\\,0.1\\,0.2)'`;

        const drawGreen = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=green:borderw=2:bordercolor=black@0.6:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='gte(mod(t\\,${cycle})\\,0.2)'`;

        const filter = `${drawRed},${drawBlue},${drawGreen}`;

        const args = [
            '-y',
            '-f','lavfi',
            '-i',`color=c=black:s=512x512:d=${dur}:r=20`,
            '-vf',filter,
            '-c:v','libx264',
            '-pix_fmt','yuv420p',
            '-movflags','+faststart+frag_keyframe+empty_moov',
            '-t',String(dur),
            '-f','mp4',
            'pipe:1'
        ];

        const ff = spawn('ffmpeg', args);
        const chunks = [];
        const errors = [];

        ff.stdout.on('data', d => chunks.push(d));
        ff.stderr.on('data', e => errors.push(e));

        ff.on('error', reject);

        ff.on('close', code => {
            if (code === 0) return resolve(Buffer.concat(chunks));
            reject(new Error(Buffer.concat(errors).toString()));
        });
    });
}