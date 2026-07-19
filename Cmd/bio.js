/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: bio  (aliases: setbio)
*/

module.exports = {
  name: 'bio',
  aliases: ["setbio"],
  execute: async (ctx) => {
    const { socket, args, reply, prefix } = ctx;
      const text = args.join(' ').trim();
      if (!text) return reply(`Usage: ${prefix}bio <text>`);
      try { await socket.updateProfileStatus(text); await reply(`✅ Bio updated: ${text}`); }
      catch (e) { await reply(`Failed: ${e.message}`); }
  }
};
