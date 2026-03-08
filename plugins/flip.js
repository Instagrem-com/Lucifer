module.exports = {
  command: 'شقلب_كلمه',
  aliases: ['mirror', 'upside'],
  category: 'اوامـࢪ الاداوات',
  description: 'اقلب النص الإنجليزي فوق تحت (يدعم الحروف الكبيرة)',
  usage: '.شكلب_كلمه <الكلمه> او الرد على رسالة',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    
    let txt = args?.join(' ') || "";
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quoted) {
      txt = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || txt;
    }
    txt = txt.replace(/^\.\w+\s*/, '').trim();

    if (!txt) return await sock.sendMessage(chatId, { text: '*عايزني اشقلب ايه ياحب 👀❤️*\n الاستخدام 📝 : \n .شقلب_كلمه <كلمه انجليزي> ' });

    const charMap = {
      'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ',
      'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ',
      'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
      'A': '∀', 'B': 'ᗺ', 'C': 'Ɔ', 'D': 'p', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': 'פ', 'H': 'H', 'I': 'I', 'J': 'ſ',
      'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ', 'Q': 'Ό', 'R': 'ᴚ', 'S': 'S', 'T': '⊥',
      'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
      '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '0': '0',
      '.': '˙', ',': '\'', '\'': ',', '"': '„', '!': '¡', '?': '¿', '(': ')', ')': '(', '[': ']', ']': '[',
      '{': '}', '}': '{', '<': '>', '>': '<', '_': '‾', '&': '⅋'
    };

    const flipped = txt.split('').map(char => charMap[char] || char).reverse().join('');
    
    await sock.sendMessage(chatId, { text: flipped }, { quoted: message });
  }
};