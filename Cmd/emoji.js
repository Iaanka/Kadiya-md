/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: emoji  (aliases: emojisearch, emojidb)
*/

module.exports = {
  name: 'emoji',
  aliases: ["emojisearch", "emojidb"],
  execute: async (ctx) => {
    const { socket, msg, quoted, text, body, reply } = ctx;
    try {
        const axios = require('axios');

        const searchQuery = q ? q.trim().toLowerCase() : '';

        if (!searchQuery) {
            return reply('❌ *කරුණාකර සෙවිය යුතු Emoji වචනය ඇතුළත් කරන්න!*\n\n*භාවිතය:* _.emoji [වචනය]_\n*උදාහරණ:* _.emoji heart_ හෝ _.emoji smile_');
        }

        reply(`🔍 *"${searchQuery}" සඳහා ගැළපෙන Emojis සොයමින් පවතී...*`);

        // 1. 100% Uptime සහිත නිල Enterprise Emoji CDN එක භාවිතා කිරීම
        const cdnUrl = `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.0/emoji.json`;
        
        const response = await axios.get(cdnUrl, { timeout: 10000 });
        const allEmojis = response.data;

        if (!allEmojis || !Array.isArray(allEmojis)) {
            return reply('❌ *Emoji දත්ත පද්ධතිය ලබා ගැනීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න!*');
        }

        // 2. පරිශීලකයා සෙවූ වචනයට අනුව දත්ත Filter කර ගැනීම
        const filteredEmojis = allEmojis.filter(item => {
            const nameMatch = item.name ? item.name.toLowerCase().includes(searchQuery) : false;
            const shortNameMatch = item.short_name ? item.short_name.toLowerCase().includes(searchQuery) : false;
            const categoryMatch = item.category ? item.category.toLowerCase().includes(searchQuery) : false;
            const shortNamesMatch = item.short_names ? item.short_names.some(sn => sn.toLowerCase().includes(searchQuery)) : false;
            
            return nameMatch || shortNameMatch || categoryMatch || shortNamesMatch;
        });

        if (filteredEmojis.length === 0) {
            return reply(`❌ *"${searchQuery}" සඳහා කිසිදු Emoji එකක් සොයා ගැනීමට නොහැකි විය!*`);
        }

        const totalEmojis = filteredEmojis.length;

        // 3. නිමැවුම (Caption/Text) අලංකාරව සැකසීම
        let responseText = `*🦋 ─── 𝐄𝐌𝐎𝐉𝐈 𝐅𝐈𝐍𝐃𝐄𝐑 ─── 🦋*\n\n`;
        responseText += `🔍 *Search:* \`${searchQuery}\`\n`;
        responseText += `🔢 *Total Found:* \`${totalEmojis}\` Emojis\n\n`;
        responseText += `─── *𝐒𝐞𝐚𝐫𝐜𝐡 𝐑𝐞𝐬𝐮𝐥𝐭𝐬* ───\n\n`;

        // උපරිම ප්‍රතිඵල 15ක් පමණක් පෙන්වීමට සීමා කිරීම
        const maxResults = Math.min(filteredEmojis.length, 15);

        // Unicode Hex එක සැබෑ Emoji එකක් බවට පත් කරන Function එක
        const convertToEmoji = (unifiedStr) => {
            try {
                return unifiedStr.split('-')
                    .map(hex => String.fromCodePoint(parseInt(hex, 16)))
                    .join('');
            } catch (e) {
                return '😀';
            }
        };

        for (let i = 0; i < maxResults; i++) {
            const item = filteredEmojis[i];
            const actualEmoji = convertToEmoji(item.unified);
            const emojiName = item.name ? item.name.charAt(0) + item.name.slice(1).toLowerCase() : item.short_name;

            responseText += `${i + 1}. ${actualEmoji} *${emojiName || 'Unnamed'}*\n`;
            responseText += `   🏷️ *Keywords:* _${item.short_names ? item.short_names.join(', ') : 'N/A'}_\n`;
            responseText += `   🔣 *Unicode:* \`U+${item.unified}\`\n\n`;
        }

        if (filteredEmojis.length > 15) {
            responseText += `*And ${filteredEmojis.length - 15} more emojis found...*\n`;
        }

        // ආරක්ෂිතව JID එක ලබා ගැනීම
        const destinationJid = msg.key.remoteJid || from;

        // 4. වර්තමාන WhatsApp සඳහා 100%ක් වැඩ කරන නිවැරදි Interactive Buttons ව්‍යුහය
        const buttonMessage = {
            interactiveMessage: {
                body: { text: responseText },
                footer: { text: "𝜗𝜚 𝐄𝐦𝐨𝐣𝐢𝐃𝐁 𝐀𝐩𝐢 𝐁𝐲 𝐊 𝐂𝐞𝐘 🎀" },
                header: { hasMediaAttachment: false },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "📜 Main Menu",
                                id: ".menu"
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "📶 Bot Status",
                                id: ".ping"
                            })
                        }
                    ],
                    messageVersion: 1
                }
            }
        };

        // 5. පණිවිඩය ආරක්ෂිතව යැවීම (Fail-Safe ක්‍රමවේදය සහිතව)
        try {
            await socket.sendMessage(destinationJid, { viewOnceMessage: { message: buttonMessage } }, { quoted: msg });
        } catch (btnErr) {
            // යම් හෙයකින් Button Message එක Fail වුවහොත් සාමාන්‍ය Text එකක් ලෙස යවයි (200% Safe)
            console.error("Button error, sending plain text:", btnErr);
            await socket.sendMessage(destinationJid, { text: responseText + "\n\n*𝜗𝜚 𝐄𝐦𝐨𝐣𝐢𝐃𝐁 𝐀𝐩𝐢 𝐁𝐲 𝐊 𝐂𝐞𝐘 🎀*" }, { quoted: msg });
        }

    } catch (err) {
        console.error("EMOJI CMD CRITICAL ERROR:", err);
        // සැබෑ දෝෂය කුමක්දැයි හඳුනා ගැනීමට err.message එක් කර ඇත
        reply(`❌ *Emoji සෙවීමේදී දෝෂයක් සිදු විය!*\n\n*Error:* \`${err.message}\``);
    }
  }
};
