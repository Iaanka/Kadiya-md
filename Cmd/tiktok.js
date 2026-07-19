/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: tiktok  (aliases: tt)
*/

module.exports = {
  name: 'tiktok',
  aliases: ["tt"],
  execute: async (ctx) => {
    const { socket, msg, sender, args, quoted, text, reply, moment, axios } = ctx;
    try {
        const query = args.join(' ');
        if (!query) return reply("🔗 *Send me a tiktok link !*");
        
        if (!query.includes('tiktok.com')) {
            return reply("❌ *This is not valid tiktok link !*");
        }

        try { await socket.sendMessage(sender, { react: { text: '📥', key: msg.key } }); } catch (_) {}

        const ttRes = await axios.get(`https://www.movanest.xyz/v2/tiktok?url=${encodeURIComponent(query)}`);
        
        if (!ttRes.data.status || !ttRes.data.results) {
            return reply("❌ *I cant get video !*");
        }

        const videoData = ttRes.data.results;
        const videoUrl = videoData.no_watermark || videoData.watermark; // Watermark නැති ලින්ක් එකට මුල් තැන දේ

        const response = await axios.get(videoUrl, { 
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });
        const videoBuffer = Buffer.from(response.data);
        const fileSizeMB = (videoBuffer.length / (1024 * 1024)).toFixed(2);

        const slDate = moment().tz('Asia/Colombo').format('YYYY-MM-DD');
        const slTimeNow = moment().tz('Asia/Colombo').format('HH:mm:ss');

        const caption = `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗧𝗶𝗸𝗧𝗼𝗸 🎀] ¡! ❞*\n\n` +
                        `🎬 *TITLE :* ${videoData.title || 'TikTok Video'}\n` +
                        `⚖️ *SIZE :* ${fileSizeMB} MB\n` +
                        `🚫 *WATERMARK :* No\n` +
                        `__________________________\n\n` +
                        `📅 *DATE :* ${slDate} | ⌚ *TIME :* ${slTimeNow}\n\n` +
                        `> *𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`;

        await socket.sendMessage(sender, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: caption,
            fileName: `tiktok_video_${slTimeNow}.mp4`
        }, { quoted: msg });

        try { await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } }); } catch (_) {}

    } catch (e) {
        console.log("TIKTOK CMD ERROR:", e);
        reply("❌ *Known Error*");
        try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_) {}
    }
  }
};
