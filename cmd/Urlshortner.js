const axios = require('axios');

module.exports = {
  name: 'shortlink',
  aliases: ['short', 'url'],
  execute: async (ctx) => {
    const {
      socket,
      msg,
      sender,
      text,
      arabianCtx,
      akira,
      prefix
    } = ctx;

    // React with an emoji to show processing
    try { await socket.sendMessage(sender, { react: { text: '🔗', key: msg.key } }); } catch (_) {}

    // Check if URL is provided
    if (!text) {
      return await socket.sendMessage(sender, { 
        text: `❌ කරුණාකර කෙටි කිරීමට අවශ්‍ය URL එක ඇතුළත් කරන්න.\nExample: *${prefix}shortlink https://github.com*` 
      }, { quoted: msg });
    }

    try {
      // API call to shorten the URL
      const apiUrl = `https://whiteshadow-x-api.onrender.com/api/tools/shortlink?url=${encodeURIComponent(text)}&apitoken=aWK0z4`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data.success) {
        const title = '*↳ ❝ [🎀 𝗨𝗥𝗟 𝗦𝗵𝗼𝗿𝘁𝗲𝗻𝗲𝗿 🎀] ¡! ❞*';
        const content = `*⊹₊⟡⋆ ⋮ Ｌｉｎｋ Ｉｎｆｏ ᶻ 𝗓 𐰁 .ᐟ*\n` +
                        `➜ *Original URL:* ${data.original_url}\n` +
                        `➜ *Short URL:* ${data.short_url}\n\n` +
                        `*⊹₊⟡⋆ ⋮ Ｃｒｅａｔｏｒ ᶻ 𝗓 𐰁 .ᐟ*\n` +
                        `➜ *By:* ${data.creator}`;
        const footer = '> *𝗔esthatic 𝗤ueen 𝗕y 𝗜sanka ⋆*';

        const buttons = [
          { buttonId: `${prefix}menu`, buttonText: { displayText: '📜 Menu' }, type: 1 }
        ];

        // Send the response with image and buttons
        await socket.sendMessage(sender, {
            image: { url: akira },
            caption: `${title}\n\n${content}\n\n${footer}`,
            footer: footer,
            buttons,
            headerType: 4,
            contextInfo: arabianCtx()
        }, { quoted: msg });

      } else {
        await socket.sendMessage(sender, { text: '❌ URL එක කෙටි කිරීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.' }, { quoted: msg });
      }

    } catch (error) {
      console.error(error);
      await socket.sendMessage(sender, { text: '❌ API එක සම්බන්ධ කර ගැනීමේදී දෝෂයක් ඇති විය.' }, { quoted: msg });
    }
  }
};

