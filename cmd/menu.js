/*
  menu.js — categorized, button-driven main menu.

  Uses the same interactiveMessage / nativeFlowMessage "single_select" list
  structure already proven working elsewhere in this codebase (see
  cmd/emoji.js). Each row's `id` is a full command (prefix + command name),
  so tapping a row re-enters the normal message pipeline and runs that
  command exactly as if the user had typed it.

  Bugs fixed vs the old switch-case version:
  - Dropped dead vars (`start`, `ms`, `readMore`) that were computed and
    never used.
  - Removed the `•vv ➜ decrypt one time file` menu line — no `vv` command
    was ever implemented, so it was a dead promise to users.
  - Row ids now use the session's actual prefix (ctx.prefix) instead of a
    hardcoded `.`, so this keeps working if PREFIX is changed via `.mode`.
  - Wrapped the interactive send in a try/catch that falls back to a plain
    text menu if the client/WA version can't render native-flow lists.
*/

const CATEGORIES = [
  {
    title: '🎀 Main',
    rows: [
      { title: 'Menu', desc: 'Show this menu again', cmd: 'menu' },
      { title: 'System', desc: 'Get system info', cmd: 'system' },
      { title: 'Ping', desc: 'Get bot speed', cmd: 'ping' },
      { title: 'Alive', desc: 'Check bot alive', cmd: 'alive' },
      { title: 'Owner', desc: 'Get owner info', cmd: 'owner' },
    ],
  },
  {
    title: '📥 Download',
    rows: [
      { title: 'Song', desc: 'Download a song', cmd: 'song' },
      { title: 'Video', desc: 'Download a video', cmd: 'video' },
      { title: 'Facebook', desc: 'Download an FB video', cmd: 'fb' },
      { title: 'TikTok', desc: 'Download a TikTok video', cmd: 'tt' },
    ],
  },
  {
    title: '🛠️ Tools',
    rows: [
      { title: 'Sticker', desc: 'Convert media to sticker', cmd: 'sticker' },
      { title: 'Fancy Text', desc: 'Convert text to fancy fonts', cmd: 'fancy' },
      { title: 'Get DP', desc: "Get someone's WhatsApp profile photo", cmd: 'getdp' },
      { title: 'NPM Search', desc: 'Search npm packages', cmd: 'npm' },
      { title: 'Image Search', desc: 'Search images', cmd: 'img' },
      { title: 'Mode', desc: 'Change bot mode', cmd: 'mode' },
      { title: 'Emoji Search', desc: 'Search emoji by keyword', cmd: 'emoji' },
      { title: 'Set Bio', desc: 'Update your WhatsApp bio', cmd: 'bio' },
    ],
  },
  {
    title: '👥 Group',
    rows: [
      { title: 'Tag All', desc: 'Tag all group members', cmd: 'tagall' },
      { title: 'Hide Tag', desc: 'Tag all members silently', cmd: 'hidetag' },
      { title: 'Add', desc: 'Add a member', cmd: 'add' },
      { title: 'Kick', desc: 'Remove a member', cmd: 'kick' },
      { title: 'Tag Admins', desc: 'Tag all group admins', cmd: 'tagadmin' },
      { title: 'Promote', desc: 'Make a member admin', cmd: 'promote' },
      { title: 'Demote', desc: 'Remove admin from a member', cmd: 'demote' },
      { title: 'Group Info', desc: 'Show group info', cmd: 'groupinfo' },
      { title: 'Lock Group', desc: 'Admins-only messaging', cmd: 'lockgroup' },
      { title: 'Unlock Group', desc: 'Allow everyone to message', cmd: 'unlockgroup' },
      { title: 'Mute', desc: 'Mute the group', cmd: 'mute' },
      { title: 'Unmute', desc: 'Unmute the group', cmd: 'unmute' },
      { title: 'Set Name', desc: 'Change group name', cmd: 'setname' },
      { title: 'Set Description', desc: 'Change group description', cmd: 'setdesc' },
      { title: 'Set Icon', desc: 'Change group icon', cmd: 'seticon' },
      { title: 'Link Group', desc: 'Get group invite link', cmd: 'linkgroup' },
      { title: 'Revoke Link', desc: 'Reset group invite link', cmd: 'revokelink' },
      { title: 'Leave', desc: 'Bot leaves the group', cmd: 'leave' },
    ],
  },
  {
    title: '🤖 AI',
    rows: [
      { title: 'Akira AI', desc: 'Chat with the AI girlfriend', cmd: 'akira' },
    ],
  },
  {
    title: '🎉 Fun',
    rows: [
      { title: 'Love Calculator', desc: 'Calculate love %', cmd: 'lvcal' },
      { title: 'Hentai', desc: 'Get hentai video (18+)', cmd: 'hentai' },
      { title: 'Hack', desc: 'Fake hacking animation', cmd: 'hack' },
    ],
  },
];

function buildPlainTextMenu(prefix, pushname, slDate, slTimeNow) {
  let out = `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗠𝗲𝗻𝘂 🎀] ¡! ❞*\n\n`;
  out += `┏━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┓\n`;
  out += `┃👤 *𝚄𝚂𝙴𝚁* : ${pushname}\n`;
  out += `┃📦 *𝚅𝙴𝚁𝚂𝙸𝙾𝙽* : V1\n`;
  out += `┃📅 *𝙳𝙰𝚃𝙴* : ${slDate}\n`;
  out += `┃⌚ *𝚃𝙸𝙼𝙴* : ${slTimeNow}\n`;
  out += `┗━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┛\n\n`;
  for (const cat of CATEGORIES) {
    out += `╭─⊹₊⟡⋆『 ${cat.title} 』𖤐\n`;
    for (const row of cat.rows) {
      out += `│₊❏❜ ⋮ •${row.cmd} ➜ ${row.desc}\n`;
    }
    out += `╰──────────────────<𝟑 \n`;
  }
  out += `\n> *𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`;
  return out;
}

module.exports = {
  name: 'menu',
  aliases: ['list', 'panel'],
  execute: async (ctx) => {
    const { socket, msg, sender, akira, moment, prefix } = ctx;

    try { await socket.sendMessage(sender, { react: { text: '🎀', key: msg.key } }); } catch (_) {}

    const pushname = msg.pushName || 'User';
    const slDate = moment().tz('Asia/Colombo').format('YYYY-MM-DD');
    const slTimeNow = moment().tz('Asia/Colombo').format('HH:mm:ss');

    const bodyText =
      `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗠𝗲𝗻𝘂 🎀] ¡! ❞*\n\n` +
      `👤 *𝚄𝚂𝙴𝚁* : ${pushname}\n` +
      `📦 *𝚅𝙴𝚁𝚂𝙸𝙾𝙽* : V1\n` +
      `📅 *𝙳𝙰𝚃𝙴* : ${slDate}\n` +
      `⌚ *𝚃𝙸𝙼𝙴* : ${slTimeNow}\n\n` +
      `_Tap "View Categories" below, pick a category, then tap a command to run it._`;

    const sections = CATEGORIES.map(cat => ({
      title: cat.title,
      rows: cat.rows.map(row => ({
        title: row.title,
        description: row.desc,
        id: `${prefix}${row.cmd}`,
      })),
    }));

    const buttonMessage = {
      interactiveMessage: {
        body: { text: bodyText },
        footer: { text: '𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆' },
        header: { title: '🎀 Akira Girl Commands', hasMediaAttachment: false },
        nativeFlowMessage: {
          buttons: [
            {
              name: 'single_select',
              buttonParamsJson: JSON.stringify({
                title: 'View Categories',
                sections,
              }),
            },
          ],
          messageVersion: 1,
        },
      },
    };

    try {
      await socket.sendMessage(sender, { viewOnceMessage: { message: buttonMessage } }, { quoted: msg });
    } catch (btnErr) {
      console.error('Menu button error, falling back to plain text:', btnErr);
      try {
        await socket.sendMessage(sender, {
          image: { url: akira },
          caption: buildPlainTextMenu(prefix, pushname, slDate, slTimeNow),
        }, { quoted: msg });
      } catch (imgErr) {
        console.error('Menu image fallback failed too, sending pure text:', imgErr);
        await socket.sendMessage(sender, {
          text: buildPlainTextMenu(prefix, pushname, slDate, slTimeNow),
        }, { quoted: msg });
      }
    }
  },
};
