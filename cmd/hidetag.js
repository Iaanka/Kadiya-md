/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: hidetag
*/

module.exports = {
  name: 'hidetag',
  aliases: [],
  execute: async (ctx) => {
    const { socket, msg, sender, args, quoted, text, isGroup, groupMetadata, participants, reply } = ctx;
      if (!isGroup) return reply('*Groups only.*');
      try {
        const gm = await socket.groupMetadata(sender);
        await socket.sendMessage(sender, { text: args.join(' ').trim() || '*🗣️ Attention Everybody !*', mentions: gm.participants.map(p => p.id) }, { quoted: msg });
      } catch (e) { await reply(`*hidetag failed: ${e.message}*`); }
  }
};
