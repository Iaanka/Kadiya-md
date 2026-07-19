/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: setname
*/

module.exports = {
  name: 'setname',
  aliases: [],
  execute: async (ctx) => {
    const { socket, sender, args, isGroup, reply } = ctx;
      if (!isGroup) return reply('Groups only.');
      const newName = args.join(' ').trim();
      if (!newName) return reply(`Usage: .setname <new name>`);
      try {
        await socket.groupUpdateSubject(sender, newName);
        await reply(`✅ Group name changed to: *${newName}*`);
      } catch (e) { await reply(`setname failed: ${e.message}`); }
  }
};
