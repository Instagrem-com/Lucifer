require('dotenv').config();

const settings = {
  // Array fallback: splits string by comma, or uses default array
  prefixes: process.env.PREFIXES ? process.env.PREFIXES.split(',') : ['.', '،', ',', '⚡'],
  
  packname: process.env.PACKNAME || '✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪',
  author: process.env.AUTHOR || '✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪',
  timeZone: process.env.TIMEZONE || 'Africa/Cairo',
  botName: process.env.BOT_NAME || "✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪",
  botOwner: process.env.BOT_OWNER || '✪『𝙇𝙐𝘾𝙄𝙁𝙀𝙍』✪',
  ownerNumber: process.env.OWNER_NUMBER || '201501728150',
  giphyApiKey: process.env.GIPHY_API_KEY || 'qnl7ssQChTdPjsKta2Ax2LMaGXz303tq',
  commandMode: process.env.COMMAND_MODE || "public",
  
  maxStoreMessages: Number(process.env.MAX_STORE_MESSAGES) || 20,
  tempCleanupInterval: Number(process.env.CLEANUP_INTERVAL) || 1 * 60 * 60 * 1000,
  storeWriteInterval: Number(process.env.STORE_WRITE_INTERVAL) || 10000,
  
  
  channelLink: process.env.CHANNEL_LINK || "https://whatsapp.com/channel/0029VbCKWqiBKfi7Df0m7O1M",
};

module.exports = settings;
