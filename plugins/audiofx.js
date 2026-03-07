const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const effectsMenu =
'🎧🔥 *مؤثرات الصوت* 🔥🎧\n\n' +
'🔊 *.بيس* — صوت بيس قوي\n' +
'💥 *.تفجير* — صوت مضغوط\n' +
'🕳 *.عميق* — صوت عميق\n' +
'📢 *.عالي* — صوت عالي جدا\n' +
'⚡ *.سريع* — تسريع الصوت\n' +
'🥁 *.ثقيل* — صوت ثقيل\n' +
'🌙 *.نايتكور* — تأثير نايت كور\n' +
'🔁 *.عكس* — عكس الصوت\n' +
'🤖 *.روبوت* — صوت روبوت\n' +
'🐢 *.بطيء* — تبطيء الصوت\n' +
'🐿 *.سنجاب* — صوت سنجاب\n\n' +
'📌 *طريقة الاستخدام*:\n' +
'رد على رسالة صوتية ثم اكتب الامر\n\n' +
'مثال:\n' +
'*.بيس*';

function getFilter(cmd) {
  if (/bass/i.test(cmd)) return 'equalizer=f=94:width_type=o:width=2:g=30';
  if (/blown/i.test(cmd)) return 'acrusher=.1:1:64:0:log';
  if (/deep/i.test(cmd)) return 'atempo=1,asetrate=44500*2/3';
  if (/earrape/i.test(cmd)) return 'volume=12';
  if (/fast/i.test(cmd)) return 'atempo=1.63';
  if (/fat/i.test(cmd)) return 'atempo=1.6';
  if (/nightcore/i.test(cmd)) return 'atempo=1.06';
  if (/reverse/i.test(cmd)) return 'areverse';
  if (/robot/i.test(cmd))
    return "afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)'";
  if (/slow/i.test(cmd)) return 'atempo=0.7';
  if (/tupai|squirrel|chipmunk/i.test(cmd)) return 'atempo=0.5';
  return null;
}

async function getAudio(message) {
  const m = message.message || {};
  const quoted = m.extendedTextMessage?.contextInfo?.quotedMessage;
  const audio = m.audioMessage || m.voiceMessage || quoted?.audioMessage || quoted?.voiceMessage;
  if (!audio) return null;

  const stream = await downloadContentFromMessage(audio, 'audio');
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  return Buffer.concat(chunks);
}

module.exports = {
  command: 'تغيير_الصوت',
  aliases: [
    'بيس','تفجير','عميق','عالي','سريع','ثقيل',
    'نايتكور','عكس','روبوت','بطيء','سنجاب'
  ],
  category: 'menu',
  description: 'تغييؤ صوت فويس 👀❤️',
  usage: '.روبوت او .عكس (اعمل ربلاي ع ريكورد او اغنيه)',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const cmd = message.body || args.join(' ');
    const filter = getFilter(cmd);

    const audioBuffer = await getAudio(message);
    if (!audioBuffer || !filter) {
      return await sock.sendMessage(
        chatId,
        { text: effectsMenu },
        { quoted: message }
      );
    }

    try {
      const tmp = path.join(__dirname, '../temp');
      if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });

      const input = path.join(tmp, `in_${Date.now()}.ogg`);
      const output = path.join(tmp, `out_${Date.now()}.ogg`);

      fs.writeFileSync(input, audioBuffer);

      exec(
        `ffmpeg -y -i "${input}" -af "${filter},aresample=48000,asetpts=N/SR" -c:a libopus -b:a 64k -ac 1 "${output}"`,
        async () => {
          const out = fs.readFileSync(output);
          await sock.sendMessage(
            chatId,
            { audio: out, mimetype: 'audio/ogg; codecs=opus', ptt: true },
            { quoted: message }
          );
          try { fs.unlinkSync(input); } catch {}
          try { fs.unlinkSync(output); } catch {}
        }
      );
    } catch {
      await sock.sendMessage(chatId, { text: 'ف مشكله وانا بغير الصوت 🙂' }, { quoted: message });
    }}
};
