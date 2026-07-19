/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: getdp_normal
*/

module.exports = {
  name: 'getdp_normal',
  aliases: [],
  execute: async (ctx) => {
    const { socket, msg, sender, args, quoted, reply, arabianCtx } = ctx;
    if (!args[0]) return reply('❌ *Target user not specified!*');
    const target = args[0];
    const targetNumber = target.split('@')[0];
    reply('⏳ *Fetching Normal Quality Profile Picture...*');

    try {
        // 'preview' parameter gets the lower resolution/compressed avatar
        const dpUrl = await socket.profilePictureUrl(target, 'preview').catch(() => null);
        if (!dpUrl) return reply('❌ *No Profile Picture Set or Privacy Protected!*');

        await socket.sendMessage(sender, {
            image: { url: dpUrl },
            caption: `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗗𝗣 - 𝗡𝗼𝗿𝗺𝗮𝗹 🎀] ¡! ❞*\n\n📷 Normal Profile picture of @${targetNumber}`,
            mentions: [target],
            contextInfo: typeof arabianCtx === 'function' ? arabianCtx() : undefined
        }, { quoted: msg });
    } catch (e) {
        reply('❌ *Error fetching Normal DP!*');
    }
  }
};
