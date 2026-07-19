/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: lockgroup
*/

module.exports = {
  name: 'lockgroup',
  aliases: [],
  execute: async (ctx) => {
    const { socket, sender, isGroup, reply, replyFq } = ctx;
      if (!isGroup) return reply('Groups only.');
      try {
        await socket.groupSettingUpdate(sender, 'announcement');
        await reply('🔒 Group locked — only admins can send messages.');
      } catch (e) { await replyFq(`Lock failed: ${e.message}`); }
  }
};
