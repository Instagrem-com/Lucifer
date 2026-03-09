const axios = require('axios');
const yts = require('yt-search');

const DL_API = 'https://api.qasimdev.dpdns.org/api/loaderto/download';
const API_KEY = 'guru';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const downloadWithRetry = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data } = await axios.get(DL_API, {
        params: { apiKey: API_KEY, format: 'mp3', url },
        timeout: 90000
      });
      if (data?.data?.downloadUrl) return data.data;
      throw new Error('❌ مفيش رابط تحميل متاح');
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`Download failed, retrying in 5s... (Attempt ${i+1})`);
      await wait(5000);
    }
  }
};

module.exports = {
  command: 'اغنيه_2',
  aliases: ['music', 'mp3', 'اغنية'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'تحميل أغنية من YouTube (MP3)',
  usage: '.song <اسم الأغنية أو رابط YouTube>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args.join(' ').trim();

    if (!query) {
      return await sock.sendMessage(chatId, {
        text: `🎵 *Song Downloader*\n\nالاستخدام:\n.song <اسم الأغنية أو رابط YouTube>`,
      }, { quoted: message });
    }

    try {
      let video;
      if (query.includes('youtube.com') || query.includes('youtu.be')) {
        video = { url: query };
      } else {
        const { videos } = await yts(query);
        if (!videos?.length) {
          return await sock.sendMessage(chatId, {
            text: '❌ مفيش نتائج للأغنية دي.',
          }, { quoted: message });
        }
        video = videos[0];
      }

      // إرسال صورة الأغنية لو موجودة
      if (video.thumbnail) {
        await sock.sendMessage(chatId, {
          image: { url: video.thumbnail },
          caption: `🎶 *${video.title || query}*\nمدة الأغنية: ${video.timestamp || 'N/A'}\nتحميل بواسطة: MEGA-MD`,
        }, { quoted: message });
      }

      // تحميل الصوت
      const songData = await downloadWithRetry(video.url);
      await sock.sendMessage(chatId, {
        audio: { url: songData.downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${songData.title || video.title || 'song'}.mp3`,
        ptt: false
      }, { quoted: message });

    } catch (err) {
      console.error('خطأ في أمر الأغنية:', err.message);
      await sock.sendMessage(chatId, {
        text: `❌ فشل تحميل الأغنية.\nالخطأ: ${err.message}`
      }, { quoted: message });
    }
  }
};