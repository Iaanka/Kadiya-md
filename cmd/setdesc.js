/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: setdesc
*/

module.exports = {
  name: 'setdesc',
  aliases: [],
  execute: async (ctx) => {
    const { socket, sender, args, isGroup, reply } = ctx;
      if (!isGroup) return reply('Groups only.');
      const newDesc = args.join(' ').trim();
      if (!newDesc) return reply(`Usage: .setdesc <description>`);
      try {
        await socket.groupUpdateDescription(sender, newDesc);
        await reply(`✅ Group description updated.`);
      } catch (e) { await reply(`setdesc failed: ${e.message}`); }
  }
};
