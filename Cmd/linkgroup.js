/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: linkgroup
*/

module.exports = {
  name: 'linkgroup',
  aliases: [],
  execute: async (ctx) => {
    const { socket, sender, isGroup, reply } = ctx;
      if (!isGroup) return reply('Groups only.');
      try {
        const code = await socket.groupInviteCode(sender);
        await reply(`🔗 *Group Invite Link:*\nhttps://chat.whatsapp.com/${code}`);
      } catch (e) { await reply(`linkgroup failed: ${e.message}`); }
  }
};
