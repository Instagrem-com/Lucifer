const axios = require('axios');

module.exports = {
  command: 'جيت_هاب',
  aliases: ['git', 'clone2'],
  category: 'اوامـࢪ الـتـحـمـيـل',
  description: 'Download a GitHub repository as a ZIP file',
  usage: '.gitclone2 <github-link>',

  async handler(sock, message, args, context = {}) {
    const { chatId } = context;
    const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;

    try {
      const link = args[0];

      if (!link) {
        return await sock.sendMessage(chatId, { 
          text: `يعم ابعت لينك عشان انزلو ومتتعبناش 😂❤️` 
        }, { quoted: message });
      }

      if (!regex.test(link)) {
        return await sock.sendMessage(chatId, { text: 'ابعت لينك جيت هاب ياعم 👀' }, { quoted: message });
      }

      let [_, user, repo] = link.match(regex) || [];
      repo = repo.replace(/.git$/, '');
      
      const url = `https://api.github.com/repos/${user}/${repo}/zipball`;

      const response = require('axios').head;
      const headRes = await axios.head(url);
      const contentDisposition = headRes.headers['content-disposition'];
      
      let filename = `${repo}.zip`;
      if (contentDisposition) {
        const match = contentDisposition.match(/attachment; filename=(.*)/);
        if (match) filename = match[1];
      }

      await sock.sendMessage(chatId, { text: `✳️ *Wait, sending repository...*` }, { quoted: message });

      await sock.sendMessage(chatId, {
        document: { url: url },
        fileName: filename,
        mimetype: 'application/zip',
        caption: `*الملف 📦 :* ${user}/${repo}\n *BY* ✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪`
      }, { quoted: message });

    } catch (err) {
      console.error('Gitclone Error:', err);
      await sock.sendMessage(chatId, { text: 'ف مشكله او اللينك معمول خاص 👀' }, { quoted: message });
    }
  }
};
