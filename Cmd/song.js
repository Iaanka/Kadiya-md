/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: song  (aliases: ytmp3, music, video, ytv, yta)
*/

module.exports = {
  name: 'song',
  aliases: ["ytmp3", "music", "video", "ytv", "yta"],
  execute: async (ctx) => {
    const { socket, msg, sender, args, command, quoted, text, type, reply, images, axios } = ctx;
    try {
        const query = args.join(' ');
        if (!query) return reply("🎵 *කරුණාකර සින්දුවක නමක් හෝ YouTube ලින්ක් එකක් ලබා දෙන්න!*\n💡 උදා: `.song master sir` හෝ `.song <youtube link>`");

        try { await socket.sendMessage(sender, { react: { text: '🔎', key: msg.key } }); } catch (_) {}

        // WhiteShadow YT APIs & Token
        const API_TOKEN = "aWK0z4"; // API එකෙහි නිවැරදි Token එක මෙහි ඇතුලත් කරන්න
        const YT_SEARCH_API = "https://whiteshadow-x-api.onrender.com/api/search/yt";
        
        let youtubeUrl = null;
        let songTitle = "Sadew-MD Audio";
        let songThumb = "https://images.unsplash.com/photo-1614680376593-902f74fa0d41"; // Default fallback thumbnail
        let duration = "Unknown";
        let views = "Unknown";

        // 1. Check if input is a YouTube Link
        const regex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)[^\s?#]+)/i;
        const match = query.match(regex);

        if (match) {
            youtubeUrl = match[0].trim();
            reply("🔗 _YouTube link detected. Fetching data from server..._");
            
            // ලින්ක් එකක් නම්, එහි තොරතුරු සෙවීමට search api එකට query එක ලෙස ලින්ක් එක යවන්න පුළුවන් (API එක support කරන්නේ නම්)
            const searchRes = await axios.get(`${YT_SEARCH_API}?q=${encodeURIComponent(youtubeUrl)}&apitoken=${API_TOKEN}`);
            if (searchRes.data && searchRes.data.success && searchRes.data.result.length > 0) {
                songTitle = searchRes.data.result[0].title || songTitle;
                songThumb = searchRes.data.result[0].thumbnail || songThumb;
                duration = searchRes.data.result[0].duration || duration;
                views = searchRes.data.result[0].views || views;
            }
        } else {
            // It's a name search
            reply(`🔍 _Searching YouTube for: "${query}"..._`);
            const searchRes = await axios.get(`${YT_SEARCH_API}?q=${encodeURIComponent(query)}&apitoken=${API_TOKEN}`);

            if (searchRes.data && searchRes.data.success && searchRes.data.result.length > 0) {
                youtubeUrl = searchRes.data.result[0].url;
                songTitle = searchRes.data.result[0].title || songTitle;
                songThumb = searchRes.data.result[0].image || searchRes.data.result[0].thumbnail || songThumb;
                duration = searchRes.data.result[0].timestamp || searchRes.data.result[0].duration || duration;
                views = searchRes.data.result[0].views || views;
            }
        }

        if (!youtubeUrl) {
            try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_) {}
            return reply("❌ *Error:* සින්දුව හෝ වීඩියෝව සොයා ගැනීමට නොහැකි විය!");
        }

        // 2. Buttons පණිවිඩය නිර්මාණය කිරීම (Baileys Interactive Buttons Format)
        // සටහන: නවතම WhatsApp updates වල Buttons පෙන්වීමට Template Buttons භාවිතා කරයි.
        
        const buttons = [
            {
                buttonId: `.download_audio ${youtubeUrl}`, // බොත්තම ක්ලික් කල විට trigger වන command එක
                buttonText: { displayText: '🎵 Audio (320kbps)' },
                type: 1
            },
            {
                buttonId: `.download_video ${youtubeUrl}`, 
                buttonText: { displayText: '🎥 Video (720p)' },
                type: 1
            },
            {
                buttonId: `.download_doc ${youtubeUrl}`, 
                buttonText: { displayText: '📂 Document (File)' },
                type: 1
            }
        ];

        const buttonMessage = {
            image: { url: songThumb },
            caption: `✨ *_👑𝗞ᴀᴅɪ𝗬𝗮-𝙓-𝙈𝘿🔥_ Music Downloader* ✨\n\n📌 *Title:* ${songTitle}\n🕒 *Duration:* ${duration}\n👁️ *Views:* ${views}\n🔗 *URL:* ${youtubeUrl}\n\n*පහත බොත්තම් භාවිතයෙන් ඔබට අවශ්‍ය Format එක තෝරාගන්න:*`,
            footer: '© Powerd By Kadiya-X-MD 🇱🇰',
            buttons: buttons,
            headerType: 4
        };

        await socket.sendMessage(sender, buttonMessage, { quoted: msg });
        try { await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } }); } catch (_) {}

    } catch (e) {
        console.log("SONG CMD ERROR:", e);
        try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_) {}
        reply("❌ *Kadiya-X-MD Internal Error:* " + e.message);
    }
  }
};
