/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: gimg  (aliases: img)
*/

module.exports = {
  name: 'gimg',
  aliases: ["img"],
  execute: async (ctx) => {
    const { socket, msg, sender, args, quoted, text, reply, axios } = ctx;
  const q = args.join(' ').trim();
  if (!q) return reply(`Usage: .gimg <query>`);
  try {
    await socket.sendMessage(sender, {
      react: { text: '🖼️', key: msg.key }
    });
  } catch (_) {}

  try {
    const res = await axios.get(
      `https://www.movanest.xyz/v2/pinterest?query=${encodeURIComponent(q)}&pageSize=10`
    );

    if (res.data && res.data.results && res.data.results.length > 0) {
      const random =
        res.data.results[
          Math.floor(Math.random() * res.data.results.length)
        ];

      const imgUrl = random.image;
      await socket.sendMessage(
        sender,
        {
          image: { url: imgUrl },
          caption:
`*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗜𝗠𝗚𝘀 🎀] ¡! ❞*

*₊❏❜ ⋮ 🔍 Search:* ${q}

> *𝗔esthetic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`
        },
		  { quoted: msg }
      );
    } else {
      await reply(`I cant find it !`);
    }
  } catch (e) {
    console.error(e);
    await reply(`Image search failed:\n${e.message}`);
  }
  }
};
