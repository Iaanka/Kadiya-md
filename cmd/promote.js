/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: promote
*/

module.exports = {
  name: 'promote',
  aliases: [],
  execute: async (ctx) => {
    const { socket, msg, sender, args, isGroup, reply, prefix } = ctx;
      if (!isGroup) return reply('Groups only.');
      const qCtxP   = msg.message?.extendedTextMessage?.contextInfo;
      const targetP = qCtxP?.participant || (args[0]?.replace(/[^0-9]/g,'') ? args[0].replace(/[^0-9]/g,'') + '@s.whatsapp.net' : null);
      if (!targetP) return reply(`Reply to a user's message or use: ${prefix}promote <number>`);
      try {
        await socket.groupParticipantsUpdate(sender, [targetP], 'promote');
        await reply(`✅ @${targetP.split('@')[0]} has been promoted to admin.`);
      } catch (e) { await reply(`Promote failed: ${e.message}`); }
  }
};
