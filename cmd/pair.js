/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: pair
*/

module.exports = {
  name: 'pair',
  aliases: [],
  execute: async (ctx) => {
    const { args, match, isOwner, activeSockets, reply, path, EmpirePair } = ctx;
    if (!isOwner) return reply('🚫 *Owner Only Command !*');

    const pairNumber = args[0]?.replace(/[^0-9]/g, '');
    if (!pairNumber) {
        return reply('📱 *Usage:* `.pair 94771234567`\n\n*(Include country code, no + or spaces)*');
    }

    if (activeSockets.has(pairNumber)) {
        return reply(`⚠️ *Number* \`${pairNumber}\` *Is Already Connected !*`);
    }

    await reply(`⏳ *Generating Pairing Code For* \`${pairNumber}\` *... Please Wait !*`);

    // Fake "res" object so we can reuse EmpirePair() exactly as the HTTP route uses it —
    // same proven pairing path, just delivered back into WhatsApp chat instead of an HTTP response.
    const mockRes = {
        headersSent: false,
        status: function () { return this; },
        send: async (payload) => {
            const code = payload?.code || payload?.error;
            if (payload?.code) {
                const formatted = payload.code.match(/.{1,4}/g)?.join('-') || payload.code;
                await reply(`🔗 *𝗣𝗔𝗜𝗥𝗜𝗡𝗚 𝗖𝗢𝗗𝗘*\n\n📱 *𝙽𝚞𝚖𝚋𝚎𝚛:* ${pairNumber}\n🔑 *𝙲𝚘𝚍𝚎:* \`${formatted}\`\n\n_Open WhatsApp > Linked Devices > Link with phone number, and enter this code within 60 seconds._`);
            } else {
                await reply(`❌ *Failed To Generate Pairing Code For* \`${pairNumber}\` *!*`);
            }
        }
    };

    try {
        await EmpirePair(pairNumber, mockRes);
    } catch (e) {
        console.log('PAIR CMD ERROR:', e);
        await reply('❌ *Pairing Failed, Try Again Later !*');
    }
  }
};
