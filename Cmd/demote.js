/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: demote
*/

module.exports = {
  name: 'demote',
  aliases: [],
  execute: async (ctx) => {
    const { socket, msg, sender, args, isGroup, reply, prefix } = ctx;
      if (!isGroup) return reply('Groups only.');
      const qCtxD   = msg.message?.extendedTextMessage?.contextInfo;
      const targetD = qCtxD?.participant || (args[0]?.replace(/[^0-9]/g,'') ? args[0].replace(/[^0-9]/g,'') + '@s.whatsapp.net' : null);
      if (!targetD) return reply(`Reply to a user's message or use: ${prefix}demote <number>`);
      try {
        await socket.groupParticipantsUpdate(sender, [targetD], 'demote');
        await reply(`✅ @${targetD.split('@')[0]} has been demoted.`);
      } catch (e) { await reply(`Demote failed: ${e.message}`); }
  }
};
