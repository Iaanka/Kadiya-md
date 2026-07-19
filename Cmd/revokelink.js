/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: revokelink
*/

module.exports = {
  name: 'revokelink',
  aliases: [],
  execute: async (ctx) => {
    const { socket, sender, isGroup, reply } = ctx;
      if (!isGroup) return reply('Groups only.');
      try {
        const newCode = await socket.groupRevokeInvite(sender);
        await reply(`✅ Invite link revoked.\n🔗 *New link:*\nhttps://chat.whatsapp.com/${newCode}`);
      } catch (e) { await reply(`revokelink failed: ${e.message}`); }
  }
};
