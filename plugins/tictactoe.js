const TicTacToe = require('../lib/tictactoe');

const games = {};

async function handleTicTacToeMove(sock, chatId, senderId, text) {
    try {
        const room = Object.values(games).find(room => 
            room.id.startsWith('tictactoe') && 
            [room.game.playerX, room.game.playerO].includes(senderId) && 
            room.state === 'PLAYING'
        );

        if (!room) return;

        const isSurrender = /^(استسلم|انسحب)$/i.test(text);
        
        if (!isSurrender && !/^[1-9]$/.test(text)) return;

        if (senderId !== room.game.currentTurn && !isSurrender) {
            await sock.sendMessage(chatId, { 
                text: '❌ مش دورك دلوقتي!' 
            });
            return;
        }

        let ok = isSurrender ? true : room.game.turn(
            senderId === room.game.playerO,
            parseInt(text) - 1
        );

        if (!ok) {
            await sock.sendMessage(chatId, { 
                text: '❌ حركة غير صالحة! المكان ده مأخوذ بالفعل.' 
            });
            return;
        }

        let winner = room.game.winner;
        let isTie = room.game.turns === 9;

        const arr = room.game.render().map(v => ({
            'X': '❎',
            'O': '⭕',
            '1': '1️⃣',
            '2': '2️⃣',
            '3': '3️⃣',
            '4': '4️⃣',
            '5': '5️⃣',
            '6': '6️⃣',
            '7': '7️⃣',
            '8': '8️⃣',
            '9': '9️⃣',
        }[v]));

        if (isSurrender) {
            winner = senderId === room.game.playerX ? room.game.playerO : room.game.playerX;
            
            await sock.sendMessage(chatId, { 
                text: `🏳️ @${senderId.split('@')[0]} استسلم! @${winner.split('@')[0]} فاز باللعبة!`,
                mentions: [senderId, winner]
            });
            delete games[room.id];
            return;
        }

        let gameStatus;
        if (winner) {
            gameStatus = `🎉 @${winner.split('@')[0]} فاز باللعبة!`;
        } else if (isTie) {
            gameStatus = `🤝 انتهت اللعبة بالتعادل!`;
        } else {
            gameStatus = `🎲 دور: @${room.game.currentTurn.split('@')[0]} (${senderId === room.game.playerX ? '❎' : '⭕'})`;
        }

        const str = `
🎮 *لعبة إكس أو*

${gameStatus}

${arr.slice(0, 3).join('')}
${arr.slice(3, 6).join('')}
${arr.slice(6).join('')}

▢ لاعب ❎: @${room.game.playerX.split('@')[0]}
▢ لاعب ⭕: @${room.game.playerO.split('@')[0]}

${!winner && !isTie ? '• اكتب رقم من 1-9 للعب\n• اكتب *استسلم* للتخلي عن اللعبة' : ''}
`;

        const mentions = [
            room.game.playerX, 
            room.game.playerO,
            ...(winner ? [winner] : [room.game.currentTurn])
        ];

        await sock.sendMessage(room.x, { 
            text: str,
            mentions: mentions
        });

        if (room.x !== room.o) {
            await sock.sendMessage(room.o, { 
                text: str,
                mentions: mentions
            });
        }

        if (winner || isTie) {
            delete games[room.id];
        }

    } catch (error) {
        console.error('خطأ في حركة إكس أو:', error);
    }
}

module.exports = {
    command: 'اكس_اوه',
    aliases: ['ttt', 'xo'],
    category: 'اوامـࢪ الالـعـاب',
    description: 'العب لعبة إكس أو مع شخص آخر',
    usage: '.tictactoe [اسم الغرفة]',
    groupOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = context.senderId || message.key.participant || message.key.remoteJid;
        const text = args.join(' ').trim();

        try {
            if (Object.values(games).find(room => 
                room.id.startsWith('tictactoe') && 
                [room.game.playerX, room.game.playerO].includes(senderId)
            )) {
                await sock.sendMessage(chatId, { 
                    text: '*أنت بالفعل في لعبة*\n\nاكتب *استسلم* للخروج من اللعبة الحالية أولاً.'
                }, { quoted: message });
                return;
            }

            let room = Object.values(games).find(room => 
                room.state === 'WAITING' && 
                (text ? room.name === text : true)
            );

            if (room) {
                room.o = chatId;
                room.game.playerO = senderId;
                room.state = 'PLAYING';

                const arr = room.game.render().map(v => ({
                    'X': '❎',
                    'O': '⭕',
                    '1': '1️⃣',
                    '2': '2️⃣',
                    '3': '3️⃣',
                    '4': '4️⃣',
                    '5': '5️⃣',
                    '6': '6️⃣',
                    '7': '7️⃣',
                    '8': '8️⃣',
                    '9': '9️⃣',
                }[v]));

                const str = `
🎮 *بدأت لعبة إكس أو!*

في انتظار @${room.game.currentTurn.split('@')[0]} للعب...

${arr.slice(0, 3).join('')}
${arr.slice(3, 6).join('')}
${arr.slice(6).join('')}

▢ *معرّف الغرفة:* ${room.id}
▢ *القوانين:*
• حاول تكوين 3 رموز على خط عمودي، أفقي أو قطري للفوز
• اكتب رقم من 1-9 لوضع رمزك
• اكتب *استسلم* للتخلي عن اللعبة
`;
                await sock.sendMessage(chatId, { 
                    text: str,
                    mentions: [room.game.currentTurn, room.game.playerX, room.game.playerO]
                }, { quoted: message });

            } else {
                room = {
                    id: 'tictactoe-' + (+new Date),
                    x: chatId,
                    o: '',
                    game: new TicTacToe(senderId, 'o'),
                    state: 'WAITING'
                };

                if (text) room.name = text;

                await sock.sendMessage(chatId, { 
                    text: `*في انتظار منافس*\n\nاكتب \`.tictactoe ${text || ''}\` للانضمام لهذه اللعبة!\n\nلاعب ❎: @${senderId.split('@')[0]}`,
                    mentions: [senderId]
                }, { quoted: message });

                games[room.id] = room;
            }

        } catch (error) {
            console.error('خطأ في أمر إكس أو:', error);
            await sock.sendMessage(chatId, { 
                text: '❌ *حدث خطأ أثناء بدء اللعبة*\n\nحاول مرة أخرى لاحقاً.'
            }, { quoted: message });
        }
    },

    handleTicTacToeMove,
    games
};