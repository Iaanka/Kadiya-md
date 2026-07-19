/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: menu  (aliases: list, panel)

  Updated: commands grouped into categories, rendered as a WhatsApp
  list message (native "button" that expands into sections) instead
  of one long caption. Falls back to the old text menu if the list
  message type fails to send (some clients / WA versions reject it).
*/

const CATEGORIES = [
  {
    title: '𝐌𝐚𝐢𝐧 𝐂𝐦𝐝𝐳',
    rows: [
      { title: 'menu',  id: 'menu',  description: 'ɢᴇᴛ ᴄᴍᴅ ʟɪꜱᴛ' },
      { title: 'system', id: 'system', description: 'ɢᴇᴛ ꜱʏꜱᴛᴇᴍ ɪɴꜰᴏ' },
      { title: 'ping',  id: 'ping',  description: 'ɢᴇᴛ ʙᴏᴛ ꜱᴘᴇᴇᴅ' },
      { title: 'alive', id: 'alive', description: 'ᴄʜᴇᴄᴋ ʙᴏᴛ ᴀʟɪᴠᴇ' },
      { title: 'owner', id: 'owner', description: 'ɢᴇᴛ ᴏᴡɴᴇʀ ɪɴꜰᴏ' },
    ],
  },
  {
    title: '𝐃𝐰𝐧 𝐂𝐦𝐝𝐳',
    rows: [
      { title: 'song',  id: 'song',  description: 'ᴅᴏᴡɴʟᴏᴀᴅ ꜱᴏɴɢ' },
      { title: 'video', id: 'video', description: 'ᴅᴏᴡɴʟᴏᴀᴅ ᴠɪᴅᴇᴏ' },
      { title: 'fb',    id: 'fb',    description: 'ᴅᴏᴡɴʟᴏᴀᴅ ꜰʙ ᴠɪᴅᴇᴏ' },
      { title: 'tt',    id: 'tt',    description: 'ᴅᴏᴡɴʟᴏᴀᴅ ᴛᴛ ᴠɪᴅᴇᴏ' },
    ],
  },
  {
    title: '𝐓𝐨𝐨𝐥 𝐂𝐦𝐝𝐳',
    rows: [
      { title: 'vv',      id: 'vv',      description: 'ᴅᴇᴄʀʏᴘᴛ ᴏɴᴇ ᴛɪᴍᴇ ꜰɪʟᴇ' },
      { title: 'sticker', id: 'sticker', description: 'ᴄᴏɴᴠᴇʀᴛ ᴛᴏ ꜱᴛᴋ' },
      { title: 'fancy',   id: 'fancy',   description: 'ᴄᴏɴᴠᴇʀᴛ ᴛᴏ ꜰᴀɴᴄʏ ᴛᴇxᴛ' },
      { title: 'getdp',   id: 'getdp',   description: 'ɢᴇᴛ ᴡʜ ᴘʀᴏꜰɪʟᴇ ᴘʜᴏᴛᴏ' },
      { title: 'npm',     id: 'npm',     description: 'ꜱᴇᴀʀᴄʜ ɴᴘᴍ ᴘᴋɢꜱ' },
      { title: 'img',     id: 'img',     description: 'ꜱᴇᴀʀᴄʜ ɪᴍɢꜱ' },
      { title: 'mode',    id: 'mode',    description: 'ᴄʜᴀɴɢᴇ ʙᴏᴛ ᴍᴏᴅᴇ' },
    ],
  },
  {
    title: '𝐆𝐫𝐨𝐮𝐩 𝐂𝐦𝐝𝐳',
    rows: [
      { title: 'tagall',      id: 'tagall',      description: 'ᴛᴀɢᴀʟʟ ᴍᴇᴍʙᴇʀꜱ' },
      { title: 'hidetag',     id: 'hidetag',     description: 'ᴛᴀɢᴀʟʟ ᴍᴇᴍʙᴇʀꜱ ꜱɪʟᴇɴᴛʟʏ' },
      { title: 'add',         id: 'add',         description: 'ᴀᴅᴅ ᴍᴇᴍʙᴇʀ' },
      { title: 'kick',        id: 'kick',        description: 'ᴋɪᴄᴋ ᴍᴇᴍʙᴇʀ' },
      { title: 'tagadmin',    id: 'tagadmin',    description: 'ᴛᴀɢ ᴀʟʟ ᴀᴅᴍɪɴꜱ' },
      { title: 'promote',     id: 'promote',     description: 'ᴍᴀᴋᴇ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴ' },
      { title: 'demote',      id: 'demote',      description: 'ᴅɪꜱᴍɪꜱꜱ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴ' },
      { title: 'lockgroup',   id: 'lockgroup',   description: 'ʟᴏᴄᴋ ᴛʜᴇ ɢʀᴏᴜᴘ' },
      { title: 'unlockgroup', id: 'unlockgroup', description: 'ᴜɴʟᴏᴄᴋ ᴛʜᴇ ɢʀᴏᴜᴘ' },
      { title: 'mute',        id: 'mute',        description: 'ᴍᴜᴛᴇ ᴛʜᴇ ɢʀᴏᴜᴘ' },
      { title: 'unmute',      id: 'unmute',      description: 'ᴜɴᴍᴜᴛᴇ ᴛʜᴇ ɢʀᴏᴜᴘ' },
      { title: 'setname',     id: 'setname',     description: 'ꜱᴇᴛ ɢʀᴏᴜᴘ ɴᴀᴍᴇ' },
      { title: 'setdesc',     id: 'setdesc',     description: 'ꜱᴇᴛ ɢʀᴏᴜᴘ ᴅᴇꜱᴄ' },
      { title: 'seticon',     id: 'seticon',     description: 'ꜱᴇᴛ ɢʀᴏᴜᴘ ɪᴄᴏɴ' },
      { title: 'linkgroup',   id: 'linkgroup',   description: 'ɢᴇᴛ ɢʀᴏᴜᴘ ʟɪɴᴋ' },
      { title: 'revokelink',  id: 'revokelink',  description: 'ʀᴇꜱᴇᴛ ɢʀᴏᴜᴘ ʟɪɴᴋ' },
      { title: 'leave',       id: 'leave',       description: 'ʟᴇᴀᴠᴇ ᴛʜᴇ ɢʀᴏᴜᴘ' },
    ],
  },
  {
    title: '𝐀𝐈 𝐂𝐦𝐝𝐳',
    rows: [
      { title: 'akira', id: 'akira', description: 'ᴀᴋɪʀᴀ ᴀɪ ɢɪʀʟꜰʀɪᴇɴᴅ' },
    ],
  },
  {
    title: '𝐅𝐮𝐧 𝐂𝐦𝐝𝐳',
    rows: [
      { title: 'lvcal',  id: 'lvcal',  description: 'ʟᴏᴠᴇ ᴄᴀʟᴄᴜʟᴀᴛᴏʀ' },
      { title: 'hentai', id: 'hentai', description: 'ɢᴇᴛ ʜᴇɴᴛᴀɪ ᴠɪᴅᴇᴏ (18+)' },
      { title: 'hack',   id: 'hack',   description: 'ꜱᴇɴᴅ ʜᴀᴄᴋɪɴɢ ᴍꜱɢ' },
    ],
  },
];

// Prefix used to invoke a command when a list row is tapped.
// Change this if your bot's real prefix differs.
const PREFIX = '.';

function buildSections() {
  return CATEGORIES.map((cat) => ({
    title: cat.title,
    rows: cat.rows.map((r) => ({
      title: r.title,
      rowId: `${PREFIX}${r.id}`,
      description: r.description,
    })),
  }));
}

function buildFallbackText(pushname, slDate, slTimeNow) {
  let body = `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗠𝗲𝗻𝘂 🎀] ¡! ❞*

┏━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┓
┃👤 *𝚄𝚂𝙴𝚁* : ${pushname}
┃📦 *𝚅𝙴𝚁𝚂𝙸𝙾𝙽* : V1
┃📅 *𝙳𝙰𝚃𝙴* : ${slDate}
┃⌚ *𝚃𝙸𝙼𝙴* : ${slTimeNow}
┗━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┛
`;

  for (const cat of CATEGORIES) {
    body += `\n╭─⊹₊⟡⋆『 \`${cat.title}\` 』𖤐\n`;
    for (const r of cat.rows) {
      body += `│₊❏❜ ⋮ ${PREFIX}${r.id} ➜ ${r.description}\n`;
    }
    body += `╰──────────────────<𝟑 \n`;
  }

  body += `\n> *𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`;
  return body;
}

module.exports = {
  name: 'menu',
  aliases: ['list', 'panel'],
  execute: async (ctx) => {
    const { socket, msg, sender, arabianCtx, akira, moment } = ctx;

    try {
      await socket.sendMessage(sender, { react: { text: '🎀', key: msg.key } });
    } catch (_) {}

    const pushname = msg.pushName || 'User';
    const slDate = moment().tz('Asia/Colombo').format('YYYY-MM-DD');
    const slTimeNow = moment().tz('Asia/Colombo').format('HH:mm:ss');

    // 1) Header image with a short caption.
    try {
      await socket.sendMessage(
        sender,
        {
          image: { url: akira },
          caption: `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗠𝗲𝗻𝘂 🎀] ¡! ❞*\n\n👤 *𝚄𝚂𝙴𝚁* : ${pushname}\n📅 *𝙳𝙰𝚃𝙴* : ${slDate}  ⌚ *𝚃𝙸𝙼𝙴* : ${slTimeNow}\n\n_Tap the button below to browse commands by category._`,
          contextInfo: arabianCtx ? arabianCtx() : undefined,
        },
        { quoted: msg }
      );
    } catch (err) {
      console.error('[menu] failed to send header image:', err);
    }

    // 2) Categorized command list as a native list message ("button" the
    //    user taps, which expands into sections/rows per category).
    try {
      await socket.sendMessage(
        sender,
        {
          text: '*ꜱᴇʟᴇᴄᴛ ᴀ ᴄᴀᴛᴇɢᴏʀʏ ᴛᴏ ᴠɪᴇᴡ ɪᴛꜱ ᴄᴏᴍᴍᴀɴᴅꜱ* 🎀',
          footer: '𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod',
          title: '🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗠𝗲𝗻𝘂',
          buttonText: 'ᴏᴘᴇɴ ᴍᴇɴᴜ',
          sections: buildSections(),
        },
        { quoted: msg }
      );
    } catch (err) {
      // Some clients / WA versions reject list messages outright.
      // Fall back to the classic single-message text menu so users
      // are never left without a response.
      console.error('[menu] list message failed, falling back to text:', err);
      try {
        await socket.sendMessage(
          sender,
          { text: buildFallbackText(pushname, slDate, slTimeNow) },
          { quoted: msg }
        );
      } catch (err2) {
        console.error('[menu] fallback text menu also failed:', err2);
      }
    }
  },
};
