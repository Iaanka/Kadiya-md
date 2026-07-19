/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: unmute
*/

module.exports = {
  name: 'unmute',
  aliases: [],
  execute: async (ctx) => {
    const { socket, sender, isGroup, reply } = ctx;
      if (!isGroup) return reply('Groups only.');
      try {
        await socket.groupSettingUpdate(sender, 'not_announcement');
        await reply('🔊 Group unmuted — everyone can send messages.');
      } catch (e) { await reply(`Unmute failed: ${e.message}`); }
  }
};
