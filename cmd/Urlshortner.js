/*
  cmd/shortlink.js
  URL shortener using WhiteShadow API
  Exposes: shortlink
*/

const axios = require('axios');

const URL_REGEX = /https?:\/\/[^\s]+/i;
const TRAILING_JUNK = /[.,;:!?)\]}'"]+$/;
// Strip zero-width / invisible unicode chars WhatsApp sometimes injects
const INVISIBLE_CHARS = /[\u200B-\u200F\u202A-\u202E\uFEFF]/g;

async function callShortenApi(cleanUrl, encode) {
  const urlParam = encode ? encodeURIComponent(cleanUrl) : cleanUrl;
  const apiUrl = `https://whiteshadow-x-api.onrender.com/api/tools/shortlink?url=${urlParam}&apitoken=aWK0z4`;

  return axios.get(apiUrl, {
    timeout: 20000,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; KadiyaBot/1.0)'
    },
    validateStatus: () => true // let us read body even on 4xx/5xx
  });
}

module.exports = {
  name: 'shortlink',
  aliases: ['short', 'shorten'],
  execute: async (ctx) => {
    const {
      socket,
      msg,
      sender,
      quoted,
      text,
      arabianCtx,
      prefix
    } = ctx;

    try { await socket.sendMessage(sender, { react: { text: '🔗', key: msg.key } }); } catch (_) {}

    const rawSource = ((text && text.trim()) || quoted?.text || quoted?.body || '')
      .replace(INVISIBLE_CHARS, '')
      .trim();

    const found = rawSource.match(URL_REGEX);
    let url = found ? found[0].replace(TRAILING_JUNK, '') : null;

    if (!url) {
      return socket.sendMessage(sender, {
        text: `*⚠️ Usage:* ${prefix}shortlink <url>\n*Example:* ${prefix}shortlink https://github.com\n_(or reply/quote a message containing a link)_`,
        contextInfo: arabianCtx()
      }, { quoted: msg });
    }

    // Validate it's a real, well-formed URL before hitting the API
    try {
      url = new URL(url).toString();
    } catch (_) {
      return socket.sendMessage(sender, {
        text: `*⚠️ Invalid URL format.* Check for stray characters and try again.`,
        contextInfo: arabianCtx()
      }, { quoted: msg });
    }

    try {
      // Attempt 1: normal encoded param
      let res = await callShortenApi(url, true);

      // Attempt 2: some deployments of this API double-decode — retry raw if 400
      if (res.status === 400) {
        res = await callShortenApi(url, false);
      }

      if (res.status !== 200 || !res.data?.success || !res.data?.short_url) {
        const apiMsg = res.data?.message || res.data?.error || JSON.stringify(res.data) || `HTTP ${res.status}`;
        throw new Error(apiMsg);
      }

      const { data } = res;
      const responseText =
        `*↳ ❝ [🔗 𝗨𝗥𝗟 𝗦𝗵𝗼𝗿𝘁𝗲𝗻𝗲𝗿 🔗] ¡! ❞*\n\n` +
        `*⊹₊⟡⋆ Original:* ${data.original_url}\n` +
        `*⊹₊⟡⋆ Short:* ${data.short_url}\n\n` +
        `> *𝗔esthatic 𝗤ueen 𝗕y 𝗜sanka ⋆*`;

      await socket.sendMessage(sender, {
        text: responseText,
        contextInfo: arabianCtx()
      }, { quoted: msg });

    } catch (err) {
      const detail = err.response?.data?.message || err.response?.data?.error || err.message;
      await socket.sendMessage(sender, {
        text: `*❌ Shorten fail ununa.* Try again later.\n_${detail}_`,
        contextInfo: arabianCtx()
      }, { quoted: msg });
    }
  }
};
