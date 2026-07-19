/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: kick  (aliases: remove)
*/

module.exports = {
  name: 'kick',
  aliases: ["remove"],
  execute: async (ctx) => {
    const { socket, msg, sender, args, isGroup, reply, prefix } = ctx;
      if (!isGroup) return reply('Groups only.');
      const qCtx   = msg.message?.extendedTextMessage?.contextInfo;
      const target = qCtx?.participant || (args[0]?.replace(/[^0-9]/g,'') ? args[0].replace(/[^0-9]/g,'') + '@s.whatsapp.net' : null);
      if (!target) return reply(`Reply to a user's message or use: ${prefix}kick <number>`);
      try { await socket.groupParticipantsUpdate(sender, [target], 'remove'); await reply(`✅ Removed ${target.split('@')[0]}`); }
      catch (e) { await reply(`Kick failed: ${e.message}`); }
  }
};
