/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: getdp_hd
*/

module.exports = {
  name: 'getdp_hd',
  aliases: [],
  execute: async (ctx) => {
    const { socket, msg, sender, args, quoted, reply, arabianCtx } = ctx;
    if (!args[0]) return reply('❌ *Target user not specified!*');
    const target = args[0];
    const targetNumber = target.split('@')[0];
    reply('⏳ *Fetching HD Profile Picture...*');
    
    try {
        const dpUrl = await socket.profilePictureUrl(target, 'image').catch(() => null);
        if (!dpUrl) return reply('❌ *No Profile Picture Set or Privacy Protected!*');

        await socket.sendMessage(sender, {
            image: { url: dpUrl },
            caption: `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗗𝗣 - 𝗛𝗗 🎀] ¡! ❞*\n\n📷 HD Profile picture of @${targetNumber}`,
            mentions: [target],
            contextInfo: typeof arabianCtx === 'function' ? arabianCtx() : undefined
        }, { quoted: msg });
    } catch (e) {
        reply('❌ *Error fetching HD DP! Privacy protection might be active.*');
    }
  }
};
