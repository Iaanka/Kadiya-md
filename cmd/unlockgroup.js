/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: unlockgroup
*/

module.exports = {
  name: 'unlockgroup',
  aliases: [],
  execute: async (ctx) => {
    const { socket, sender, isGroup, reply, replyFq } = ctx;
      if (!isGroup) return replyFq('Groups only.');
      try {
        await socket.groupSettingUpdate(sender, 'not_announcement');
        await reply('🔓 Group unlocked — everyone can send messages.');
      } catch (e) { await reply(`Unlock failed: ${e.message}`); }
  }
};
