/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: leave
*/

module.exports = {
  name: 'leave',
  aliases: [],
  execute: async (ctx) => {
    const { socket, sender, isOwner, isGroup, reply, delay } = ctx;
      if (!isGroup) return reply('Groups only.');
      if (!isOwner && !isSessionOwner && !isDevUser) return reply('Only owner can make the bot leave.');
      try {
        await reply('👋 Goodbye! Leaving group...');
        await delay(1500);
        await socket.groupLeave(sender);
      } catch (e) { await reply(`leave failed: ${e.message}`); }
  }
};
