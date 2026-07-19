/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: getdp  (aliases: pfp)
*/

module.exports = {
  name: 'getdp',
  aliases: ["pfp"],
  execute: async (ctx) => {
    const { socket, msg, sender, args, command, quoted, text, type, reply, arabianCtx, jidNormalizedUser } = ctx;
    try {
        const qCtx = msg.message?.extendedTextMessage?.contextInfo;

        // Correct "who actually sent this" resolution.
        const realSender = msg.key.participant || msg.key.remoteJid;

        let target;
        if (qCtx?.mentionedJid?.[0]) {
            target = qCtx.mentionedJid[0];
        } else if (qCtx?.participant) {
            target = qCtx.participant;
        } else if (args[0]) {
            const digits = args[0].replace(/[^0-9]/g, '');
            if (digits) target = digits + '@s.whatsapp.net';
        }

        if (!target) target = realSender;

        // Normalize jid (handles @lid / weird formats)
        try {
            if (typeof jidNormalizedUser === 'function') {
                target = jidNormalizedUser(target);
            }
        } catch (_) { /* ignore */ }

        // target එක helper function වලට යැවීමට query parameter එකක් ලෙස parse කරමු
        const targetNumber = target.split('@')[0];

        // WhatsApp interactive buttons setup (Buttons structured for Baileys)
        // Note: Buttons format can vary slightly depending on your Baileys version (standard buttons / template buttons)
        const buttons = [
            { 
                buttonId: `.getdp_hd ${target}`, // HD DP එක ලබාගැනීමට
                buttonText: { displayText: '✨ HD Quality' }, 
                type: 1 
            },
            { 
                buttonId: `.getdp_normal ${target}`, // Normal DP එක ලබාගැනීමට
                buttonText: { displayText: '🖼️ Normal Quality' }, 
                type: 1 
            },
            { 
                buttonId: '.owner', // Owner command එක auto trigger කිරීමට
                buttonText: { displayText: '👑 Owner Info' }, 
                type: 1 
            }
        ];

        const buttonMessage = {
            text: `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗗𝗣 🎀] ¡! ❞*\n\nSelect the quality you want to download for @${targetNumber} or contact Owner.`,
            footer: 'Akira MD Bot DP Downloader',
            buttons: buttons,
            headerType: 1,
            mentions: [target],
            contextInfo: typeof arabianCtx === 'function' ? arabianCtx() : undefined
        };

        await socket.sendMessage(sender, buttonMessage, { quoted: msg });

    } catch (err) {
        console.error("GETDP CMD ERROR:", err);
        reply('❌ *Something Went Wrong, Try Again !*');
    }
  }
};
