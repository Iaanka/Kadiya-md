/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: delsession  (aliases: wipenumber)
*/

module.exports = {
  name: 'delsession',
  aliases: ["wipenumber"],
  execute: async (ctx) => {
    const { socket, msg, sender, args, text, isOwner, activeSockets, reply, Session, destroySocket, deleteSession } = ctx;
    if (!isOwner) return reply('🚫 *Owner Only Command !*');

    const delNumber = args[0]?.replace(/[^0-9]/g, '');
    if (!delNumber) {
        return reply('📱 *Usage:* `.delsession 94771234567`');
    }

    try { await socket.sendMessage(sender, { react: { text: '🗑️', key: msg.key } }); } catch (_) {}

    const wasActive = activeSockets.has(delNumber);

    try {
        await destroySocket(delNumber);
        await deleteSession(delNumber);
    } catch (e) {
        console.log('DELSESSION CMD ERROR:', e);
        return reply(`❌ *Failed To Delete Session For* \`${delNumber}\` *!*`);
    }

    await reply(`✅ *𝗦𝗲𝘀𝘀𝗶𝗼𝗻 𝗗𝗲𝗹𝗲𝘁𝗲𝗱 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 !*\n📱 *𝙽𝚞𝚖𝚋𝚎𝚛:* ${delNumber}${wasActive ? '\n🔌 *𝚂𝚘𝚌𝚔𝚎𝚝 𝙳𝚒𝚜𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍*' : '\n_(no active socket was running for this number)_'}`);

    try { await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } }); } catch (_) {}
  }
};
