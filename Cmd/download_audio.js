/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: download_audio
*/

module.exports = {
  name: 'download_audio',
  aliases: [],
  execute: async (ctx) => {
    const { socket, msg, sender, args, quoted, text, reply, axios, ytmp3 } = ctx;
    try {
        const youtubeUrl = args[0];
        if (!youtubeUrl) return reply("❌ වලංගු YouTube Link එකක් ලැබී නැත.");
        
        try { await socket.sendMessage(sender, { react: { text: '📥', key: msg.key } }); } catch (_) {}
        reply("📥 _*👑𝗞ᴀᴅɪ𝗬𝗮-𝙓-𝙈𝘿🔥*_ Extracting 320kbps High-Quality MP3..._");

        const API_TOKEN = "aWK0z4";
        const YT_DOWNLOAD_API = "https://whiteshadow-x-api.onrender.com/api/download/ytmp3";

        const dlRes = await axios.get(`${YT_DOWNLOAD_API}?url=${encodeURIComponent(youtubeUrl)}&quality=320&apitoken=${API_TOKEN}`);
        
        if (dlRes.data && dlRes.data.success && dlRes.data.result) {
            const audioDownloadUrl = dlRes.data.result.download_url;
            const songTitle = dlRes.data.result.title || "Kadiya-MD Audio";
            const cleanFileName = songTitle.replace(/[\\/:*?"<>|]/g, "_").slice(0, 60) + ".mp3";

            // Send Audio File
            await socket.sendMessage(sender, {
                audio: { url: audioDownloadUrl },
                mimetype: 'audio/mpeg',
                fileName: cleanFileName,
                ptt: false
            }, { quoted: msg });

            try { await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } }); } catch (_) {}
        } else {
            reply("❌ *Error:* සේවාදායකයෙන් ඕඩියෝ එක ලබා ගැනීමට නොහැකි විය.");
        }
    } catch (e) {
        reply("❌ *Download Error:* " + e.message);
    }
  }
};
