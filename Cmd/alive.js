/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: alive
*/

module.exports = {
  name: 'alive',
  aliases: [],
  execute: async (ctx) => {
    const {
      socket,
      msg,
      sender,
      quoted,
      text,
      arabianCtx,
      akira,
      sanitizedNumber,
      socketCreationTime,
      prefix
    } = ctx;

    try { await socket.sendMessage(sender, { react: { text: '🍓', key: msg.key } }); } catch (_) {}

    // socketCreationTime is a Map<sanitizedNumber, timestamp> owned by pair.js.
    // Both must arrive via ctx now that this file lives outside that scope.
    const startTime = socketCreationTime?.get(sanitizedNumber) || Date.now();
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const title = '*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗔𝗹𝗶𝘃𝗲 🎀] ¡! ❞*';
    const content = `*⊹₊⟡⋆ ⋮ Ａｂｏｕｔ ᶻ 𝗓 𐰁 .ᐟ*\n` +
                    `➜ This is a lightweight, stable WhatsApp bot designed to run 24/7. It is allowing users and group admins to fine-tune the bot's behavior.\n\n` +
                    `*⊹₊⟡⋆ ⋮ Ｕｐｔｉｍｅ ᶻ 𝗓 𐰁 .ᐟ*\n` +
                    `➜ ${hours}h ${minutes}m ${seconds}s\n\n` +
                    `*⊹₊⟡⋆ ⋮ Ｄｅｐｌｏｙ ᶻ 𝗓 𐰁 .ᐟ*\n` +
                    `➜ *Website:* https://akira.gotukolaya.site`;
    const footer = '> *𝗔esthatic 𝗤ueen 𝗕y 𝗜sanka ⋆*';

    const buttons = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: '📜 Menu' }, type: 1 },
      { buttonId: `${prefix}ping`, buttonText: { displayText: '🏓 Ping' }, type: 1 }
    ];

    await socket.sendMessage(sender, {
        image: { url: akira },
        caption: `${title}\n\n${content}\n\n${footer}`,
        footer: footer,
        buttons,
        headerType: 4,
        contextInfo: arabianCtx()
    }, { quoted: msg });

  }
};
