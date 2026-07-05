/*                                                                                                                                    
  KADIYA MD MINI BOT - MULTI SESSION SUPPORT
  DEVELOPED BY ISANKA TECH OFC
  FULLY ENC AND PRIVET SOURCE CODE    
  Code Ussai #akak - Thawa #akada balanne                                                                    
*/

const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const {
    exec
} = require('child_process');
const { sms } = require("./msg");
const router = express.Router();
const pino = require('pino');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Jimp = require('jimp');
const crypto = require('crypto');
const axios = require('axios');
const yts = require('yt-search');
const { ytmp3, ytmp4 } = require('sadaslk-dlcore');
const os = require('os');
const fecth = require('node-fetch');
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegPath);
  const images = [
    'https://i.ibb.co/FZjptLY/tourl-1779693358137.jpg',
    'https://i.ibb.co/nsvyKzHq/tourl-1779693358584.jpg',
    'https://i.ibb.co/nqr1zs58/tourl-1779693359381.jpg',
    'https://i.ibb.co/hFgRrkHG/tourl-1779693362084.jpg',
    'https://i.ibb.co/b5BGG3qy/tourl-1779693381594.jpg',
    'https://i.ibb.co/Xxwq0KbL/tourl-1779693384509.jpg',
    'https://i.ibb.co/p60X2gCY/tourl-1779693391761.jpg',
    'https://i.ibb.co/8LDKt9St/tourl-1779693394059.jpg',
    'https://i.ibb.co/5XSxSGrd/tourl-1779693398804.jpg',
    'https://i.ibb.co/NdJ2LFJp/tourl-1779693402284.jpg',
    'https://i.ibb.co/rKRD8cCT/tourl-1779693404589.jpg',
    'https://i.ibb.co/4nVwLGXm/tourl-1779693406982.jpg'
  ]; 

const akira = images[Math.floor(Math.random() * images.length)];

const {
    default: makeWASocket,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState,
    DisconnectReason,
    downloadMediaMessage,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    fetchLatestBaileysVersion, 
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    extractMessageContent, 
    jidDecode,
    MessageRetryMap,
    jidNormalizedUser, 
    proto,
    getContentType,
    areJidsSameUser,
    generateWAMessage, 
    delay, 
    Browsers
} = require("baileys");

const config = {
    AUTO_VIEW_STATUS: 'true',
    AUTO_LIKE_STATUS: 'true',
    MODE: 'public',
    PREFIX: '.',
    MAX_RETRIES: 3,
    ANTI_BAN: 'true',
    ADMIN_LIST_PATH: './admin.json',
    AKIRA_IMG: 'https://i.ibb.co/FZjptLY/tourl-1779693358137.jpg',
    NEWSLETTER_JID: '120363399723529947@newsletter',
    NEWSLETTER_LIST: [
        '120363399723529947@newsletter',
        '120363422562980426@newsletter'
    ],
    NEWSLETTER_MESSAGE_ID: '428',
    OTP_EXPIRY: 300000,
    OWNER_NUMBER: '94763353368',
    // Bot-host super admin — the ONLY number allowed to force-disconnect
    // any other user's active session (see .delsession command below).
    SUPER_ADMIN_NUMBER: '94765480861',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029Vb69K9665yDEFt3DRR0D',
    ANTI_LINK: 'false',
    ANTI_BADWORD: 'false',
    BAD_WORDS: ['fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy', 'cunt', 'porn', 'wtf']
};

// ══════════════════════════════════════════════════════════════════
// 📋 COMMAND REGISTRY — .menu auto-builds itself from this list.
// Aluth command ekak switch(case) ekata add karaddi, methanata
// object ekakත් add karanna (cmd, desc, category). Eeka witharයි —
// .menu eke output eka auto update wenawa, menu eke code eka
// venas karanna one na.
// ══════════════════════════════════════════════════════════════════
const CMD_CATEGORY_ORDER = ['Main', 'Download', 'Tools', 'Settings', 'Group', 'AI', 'Fun'];
const CMD_CATEGORY_TITLES = {
    Main: 'Main Cmdz',
    Download: 'Dwn Cmdz',
    Tools: 'Tool Cmdz',
    Settings: 'Settings Cmdz',
    Group: 'Group Cmdz',
    AI: 'AI Cmdz',
    Fun: 'Fun Cmdz'
};

const COMMANDS_REGISTRY = [
    { cmd: 'menu', desc: 'ɢᴇᴛ ᴄᴍᴅ ʟɪꜱᴛ', category: 'Main' },
    { cmd: 'system', desc: 'ɢᴇᴛ ꜱʏꜱᴛᴇᴍ ɪɴꜰᴏ', category: 'Main' },
    { cmd: 'ping', desc: 'ɢᴇᴛ ʙᴏᴛ ꜱᴘᴇᴇᴅ', category: 'Main' },
    { cmd: 'alive', desc: 'ᴄʜᴇᴄᴋ ʙᴏᴛ ᴀʟɪᴠᴇ', category: 'Main' },
    { cmd: 'owner', desc: 'ɢᴇᴛ ᴏᴡɴᴇʀ ɪɴꜰᴏ', category: 'Main' },
    { cmd: 'pair', desc: 'ɢᴇᴛ ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ ꜰᴏʀ ᴀ ɴᴜᴍʙᴇʀ', category: 'Main' },

    { cmd: 'song', desc: 'ᴅᴏᴡɴʟᴏʀᴅ ꜱᴏɴɢ', category: 'Download' },
    { cmd: 'video', desc: 'ᴅᴏᴡɴʟᴏʀᴅ ᴠɪᴅᴇᴏ', category: 'Download' },
    { cmd: 'fb', desc: 'ᴅᴏᴡɴʟᴏʀᴅ ꜰʙ ᴠɪᴅᴇᴏ', category: 'Download' },
    { cmd: 'tt', desc: 'ᴅᴏᴡɴʟᴏʀᴅ ᴛᴛ ᴠɪᴅᴇᴏ', category: 'Download' },
    { cmd: 'pin', desc: 'ᴅᴏᴡɴʟᴏʀᴅ ᴘɪɴᴛᴇʀᴇꜱᴛ ᴠɪᴅᴇᴏ/ɪᴍɢ', category: 'Download' },

    { cmd: 'vv', desc: 'ᴅᴇᴄʀʏᴘᴛ ᴏɴᴇ ᴛɪᴍᴇ ꜰɪʟᴇ', category: 'Tools' },
    { cmd: 'sticker', desc: 'ᴄᴏɴᴠᴇᴛʀ ᴛᴏ ꜱᴛᴋ', category: 'Tools' },
    { cmd: 'fancy', desc: 'ᴄᴏɴᴠᴇᴛ ᴛᴏ ꜰᴀɴᴄʏ ᴛᴇxᴛ', category: 'Tools' },
    { cmd: 'getdp', desc: 'ɢᴇᴛ ᴡʜ ᴘʀᴏꜰɪʟᴇ 𝗉ʜᴏᴛᴏ', category: 'Tools' },
    { cmd: 'npm', desc: 'ꜱᴇᴀʀᴄʜ ɴᴘᴍ ᴘᴋɢꜱ', category: 'Tools' },
    { cmd: 'img', desc: 'ꜱᴇᴀʀᴄʜ ɪᴍɢꜱ', category: 'Tools' },
    { cmd: 'mode', desc: 'ᴄʜᴀɴɢᴇ ʙᴏᴛ ᴍᴏᴅᴇ', category: 'Tools' },
    { cmd: 'active', desc: 'ᴄʜᴇᴄᴋ ᴀᴄᴛɪᴠᴇ ꜱᴇꜱꜱɪᴏɴꜱ', category: 'Tools' },
    { cmd: 'getjid', desc: 'ɢᴇᴛ ᴄʜᴀɴɴᴇʟ ᴊɪᴅ', category: 'Tools' },
    { cmd: 'ff', desc: 'ɢᴇᴛ ꜰʀᴇᴇ ꜰɪʀᴇ ᴘʟᴀʏᴇʀ ɪɴꜰᴏ', category: 'Tools' },

    { cmd: 'settings', desc: 'ʙᴏᴛ ꜱᴇᴛᴛɪɴɢꜱ ᴘᴀɴᴇʟ (ᴀɴᴛɪ-ʟɪɴᴋ/ʙᴀᴅᴡᴏʀᴅ/ᴇᴍᴏᴊɪ)', category: 'Settings' },

    { cmd: 'tagall', desc: 'ᴛᴀɢᴀʟʟ ᴍᴇᴍʙᴇʀꜱ', category: 'Group' },
    { cmd: 'hidetag', desc: 'ᴛᴀɢᴀʟʟ ᴍᴇᴍ ꜱɪʟᴇɴᴛʟʏ', category: 'Group' },
    { cmd: 'add', desc: 'ᴀᴅᴅ ᴍᴇᴍʙᴇʀ', category: 'Group' },
    { cmd: 'kick', desc: 'ᴋɪᴄᴋ ᴍᴇᴍʙᴇʀ', category: 'Group' },
    { cmd: 'bio', desc: 'ꜱᴇᴛ ᴡʜ ʙɪᴏ', category: 'Group' },
    { cmd: 'tagadmin', desc: 'ᴛᴀɢ ᴀʟʟ ᴀᴅᴍɪɴꜱ', category: 'Group' },
    { cmd: 'promote', desc: 'ᴍᴀᴋᴇ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴ', category: 'Group' },
    { cmd: 'demote', desc: 'ᴅɪꜱᴍɪꜱꜱ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴ', category: 'Group' },
    { cmd: 'lockgroup', desc: 'ʟᴏᴄᴋ ᴛʜᴇ ɢʀᴏᴜᴘ', category: 'Group' },
    { cmd: 'unlockgroup', desc: 'ᴜɴʟᴏᴄᴋ ᴛʜᴇ ɢʀᴏᴜᴘ', category: 'Group' },
    { cmd: 'mute', desc: 'ᴍᴜᴛᴇ ᴛʜᴇ ɢʀᴏᴜᴘ', category: 'Group' },
    { cmd: 'unmute', desc: 'ᴜɴᴍᴜᴛᴇ ᴛʜᴇ ɢʀᴏᴜᴘ', category: 'Group' },
    { cmd: 'groupinfo', desc: 'ɢᴇᴛ ɢʀᴏᴜᴘ ɪɴꜰᴏ', category: 'Group' },
    { cmd: 'setname', desc: 'ꜱᴇᴛ ɢʀᴏᴜᴘ ɴᴀᴍᴇ', category: 'Group' },
    { cmd: 'setdesc', desc: 'ꜱᴇᴛ ɢʀᴏᴜᴘ ᴅᴇꜱᴄ', category: 'Group' },
    { cmd: 'seticon', desc: 'ꜱᴇᴛ ɢʀᴏᴜᴘ ɪᴄᴏɴ', category: 'Group' },
    { cmd: 'linkgroup', desc: 'ɢᴇᴛ ɢʀᴏᴜᴘ ʟɪɴᴋ', category: 'Group' },
    { cmd: 'revokelink', desc: 'ʀꜱᴇᴛ ɢʀᴏᴜᴘ ʟɪɴᴋ', category: 'Group' },
    { cmd: 'leave', desc: 'ʟᴇᴀᴠᴇ ᴛʜᴇ ɢʀᴏᴜᴘ', category: 'Group' },

    { cmd: 'akira', desc: 'ᴋᴀᴅɪʏᴀ ᴀɪ ɢɪʀʟꜰʀɪᴇɴᴅ', category: 'AI' },

    { cmd: 'lvcal', desc: 'ʟᴏᴠᴇ ᴄᴀʟᴄᴜʟᴀᴛᴇʀ', category: 'Fun' },
    { cmd: 'anime', desc: 'ɢᴇᴛ ʀᴀɴᴅᴏᴍ ᴀɴɪᴍᴇ ɪᴍɢ (ꜱꜰᴡ)', category: 'Fun' },
    { cmd: 'hentai', desc: 'ɢᴇᴛ ʜᴇɴᴛᴀɪ ᴠɪᴅᴇᴏ(18+)', category: 'Fun' },
    { cmd: 'hack', desc: 'ꜱᴇɴᴅ ʜᴀᴄᴋɪɴɢ ᴍꜱɢ', category: 'Fun' },
    { cmd: 'csong', desc: 'ᴘᴏꜱᴛ ꜱᴏɴɢ ᴛᴏ ᴄʜᴀɴɴᴇʟ', category: 'Fun' },
    { cmd: 'styletext', desc: 'ꜱᴛʏʟᴇ ᴛᴇxᴛ ꜰᴀɴᴄʏ', category: 'Fun' },
];

function buildMenuBody(readMore) {
    const blocks = [];
    for (const cat of CMD_CATEGORY_ORDER) {
        const items = COMMANDS_REGISTRY.filter(c => c.category === cat);
        if (!items.length) continue;
        let block = `╭─⊹₊⟡⋆『 \`${CMD_CATEGORY_TITLES[cat]}\` 』𖤐.ᐟ\n`;
        for (const item of items) {
            block += `│₊❏❜ ⋮ •${item.cmd} ➜ ${item.desc}\n`;
        }
        block += `╰──────────────────<𝟑 .ᐟ`;
        blocks.push(block);
    }
    return blocks.join(`\n${readMore}\n`);
}

const replyFq = (text) => reply(text);
const activeSockets = new Map();
const socketCreationTime = new Map();
const socketHandlersMap = new Map();
const SESSION_BASE_PATH = './session';
const NUMBER_LIST_PATH = './numbers.json';

const SessionSchema = new mongoose.Schema({
    number: {
        type: String,
        unique: true,
        required: true
    },
    creds: {
        type: Object,
        required: true
    },
    config: {
        type: Object
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
const Session = mongoose.model('Session', SessionSchema);

async function connectMongoDB() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb+srv://maliquotes6_db_user:FlDox4Qcie9JUzZ9@cluster0.bbsrc3v.mongodb.net/?appName=Cluster0';
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
}
connectMongoDB();

if (!fs.existsSync(SESSION_BASE_PATH)) {
    fs.mkdirSync(SESSION_BASE_PATH, {
        recursive: true
    });
}

function initialize() {
    activeSockets.clear();
    socketCreationTime.clear();
    console.log('Cleared active sockets and creation times on startup');
}

async function uploadToCatbox(stream, fileName) {
    try {
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', stream, fileName);

        const res = await axios.post(
            'https://catbox.moe/user/api.php',
            form,
            { headers: form.getHeaders(), timeout: 0 }
        );

        if (!res.data.startsWith('https://')) return null;
        return res.data.trim();
    } catch {
        return null;
    }
}

async function saveMediaToCatbox(msg) {
    try {
        const type = Object.keys(msg.message)[0];
        const mediaMap = {
            imageMessage: 'image',
            videoMessage: 'video',
            audioMessage: 'audio',
            documentMessage: 'document'
        };

        if (!mediaMap[type]) return null;

        const mediaMsg = msg.message[type];
        const size = mediaMsg.fileLength || 0;
        
        if (size > 100 * 1024 * 1024) return null;

        const stream = await downloadContentFromMessage(
            mediaMsg,
            mediaMap[type]
        );

        const ext =
            type === 'imageMessage' ? 'jpg' :
            type === 'videoMessage' ? 'mp4' :
            type === 'audioMessage' ? 'opus' :
            'bin';

        return await uploadToCatbox(stream, `${msg.key.id}.${ext}`);
    } catch {
        return null;
    }
}


async function cleanupInactiveSessions() {
    try {
        const sessions = await Session.find({}, 'number').lean();
        let cleanedCount = 0;

        for (const {
                number
            }
            of sessions) {
            const sanitizedNumber = number.replace(/[^0-9]/g, '');

            if (!activeSockets.has(sanitizedNumber) && !socketCreationTime.has(sanitizedNumber)) {
                const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);

                if (fs.existsSync(sessionPath)) {
                    const stats = fs.statSync(sessionPath);
                    const timeSinceModified = Date.now() - stats.mtime.getTime();

                    if (timeSinceModified > 60 * 60 * 1000) {
                        console.log(`Cleaning up stale session: ${sanitizedNumber}`);
                        fs.removeSync(sessionPath);
                        cleanedCount++;
                    }
                }
            }
        }

        console.log(`Cleaned up ${cleanedCount} stale sessions`);
        return cleanedCount;
    } catch (error) {
        console.error('Cleanup error:', error);
        return 0;
    }
}

function setupNewsletterHandlers(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        if (!message?.key) return;

        const jid = message.key.remoteJid;

        if (jid !== config.NEWSLETTER_JID) return;

        try {
            const emojis = ['🎀', '🍬', '👽', '🌺', '🍓', '🍫', '🫐', '🥷'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            
            const messageId = message.key.server_id || message.newsletterServerId;

            if (!messageId) {
                console.warn('⚠️ No newsletterServerId found in message:', message);
                return;
            }

            await socket.newsletterReactMessage(jid, messageId.toString(), randomEmoji);
            console.log(`✅ Reacted to official newsletter: ${jid}`);
        } catch (error) {
            console.error('⚠️ Newsletter reaction failed:', error.message);
        }
    });
}


async function autoReconnectOnStartup() {
    try {
        let numbers = [];
        if (fs.existsSync(NUMBER_LIST_PATH)) {
            numbers = JSON.parse(fs.readFileSync(NUMBER_LIST_PATH, 'utf8'));
            console.log(`Loaded ${numbers.length} numbers from numbers.json`);
        }

        const sessions = await Session.find({}, 'number').lean();
        const mongoNumbers = sessions.map(s => s.number);
        numbers = [...new Set([...numbers, ...mongoNumbers])];

        if (numbers.length === 0) {
            console.log('No numbers found for auto-reconnect');
            return;
        }

        console.log(`Attempting to reconnect ${numbers.length} sessions...`);

        for (const number of numbers) {
            const sanitized = number.replace(/[^0-9]/g, '');
            if (activeSockets.has(sanitized)) {
                console.log(`Number ${sanitized} already connected, skipping`);
                continue;
            }

            const mockRes = { headersSent: false, send: () => {}, status: () => mockRes };

            try {
                await EmpirePair(sanitized, mockRes);
                console.log(`✅ Initiated reconnect for ${sanitized}`);
            } catch (error) {
                console.error(`❌ Failed to reconnect ${sanitized}:`, error);
            }

            await delay(1500);
        }
    } catch (error) {
        console.error('Auto-reconnect on startup failed:', error);
    }
}

(async () => {
    await initialize();
    setTimeout(autoReconnectOnStartup, 5000); 
})();


function loadAdmins() {
    try {
        if (fs.existsSync(config.ADMIN_LIST_PATH)) {
            return JSON.parse(fs.readFileSync(config.ADMIN_LIST_PATH, 'utf8'));
        }
        return [];
    } catch (error) {
        console.error('Failed to load admin list:', error);
        return [];
    }
}

function formatMessage(title, content, footer) {
    return `*${title}*\n\n${content}\n\n> *${footer}*`;
}

function getSriLankaTimestamp() {
    return moment().tz('Asia/Colombo').format('YYYY-MM-DD HH:mm:ss');
}

const fetchJson = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        })
        return res.data
    } catch (err) {
        return err
    }
}

// ══════════════════════════════════════════════════════════════════
// 🎵 YT-MP3 RESOLVER — tries a few sources in order, returns the first
// working direct audio URL. Free public download APIs die/change all
// the time, so .song falls through several sources instead of relying
// on one (often-dead) endpoint. If ALL of these ever go down at once,
// swap in whatever free API is currently working — just add another
// `try { ... } catch {}` block below following the same pattern.
// ══════════════════════════════════════════════════════════════════
async function getYtAudioUrl(youtubeUrl) {
    // 1) sadaslk-dlcore — already an installed project dependency
    try {
        const result = await ytmp3(youtubeUrl);
        const url = (result && (result.url || result.downloadUrl || result.download_url ||
            (result.data && result.data.url) || (result.result && result.result.url))) ||
            (typeof result === 'string' ? result : null);
        if (url) return url;
    } catch (e) {
        console.warn('getYtAudioUrl: sadaslk-dlcore failed:', e.message);
    }

    // 2) fallback free API — ytdl-new-dxz
    try {
        const res = await axios.get(`https://ytdl-new-dxz.vercel.app/api/ytmp3?url=${encodeURIComponent(youtubeUrl)}`, { timeout: 20000 });
        const url = res.data && (res.data.download_url || res.data.result || res.data.url);
        if (url) return url;
    } catch (e) {
        console.warn('getYtAudioUrl: ytdl-new-dxz fallback failed:', e.message);
    }

    // 3) fallback free API — GiftedTech public API
    try {
        const res = await axios.get(`https://api.giftedtech.web.id/api/download/dlmp3?apikey=gifted&url=${encodeURIComponent(youtubeUrl)}`, { timeout: 20000 });
        const r = res.data && res.data.result;
        const url = (r && (r.download_url || r.url)) || (res.data && (res.data.download_url || res.data.url));
        if (url) return url;
    } catch (e) {
        console.warn('getYtAudioUrl: giftedtech fallback failed:', e.message);
    }

    return null;
}

const runtime = (seconds) => {
	seconds = Number(seconds)
	var d = Math.floor(seconds / (3600 * 24))
	var h = Math.floor(seconds % (3600 * 24) / 3600)
	var m = Math.floor(seconds % 3600 / 60)
	var s = Math.floor(seconds % 60)
	var dDisplay = d > 0 ? d + (d == 1 ? ' day, ' : ' days, ') : ''
	var hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : ''
	var mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : ''
	var sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : ''
	return dDisplay + hDisplay + mDisplay + sDisplay;
}

async function setupMessageHandlers(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid === config.NEWSLETTER_JID) return;
               
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        const botNumber = jidNormalizedUser(socket.user.id).split('@')[0];
        const isReact = msg.message.reactionMessage;

        const sanitizedNumber = botNumber.replace(/[^0-9]/g, '');
        const sessionConfig = activeSockets.get(sanitizedNumber)?.config || config;
    });
} 

function setupAutoRestart(socket, number) {
    const id = number;
    let reconnecting = false;

    socket.ev.on('connection.update', async ({ connection, lastDisconnect }) => {

        if (connection === 'open') {
            reconnecting = false;
            return;
        }

        if (connection !== 'close' || reconnecting) return;
        reconnecting = true;

        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.warn(`[${id}] Connection closed | code:`, statusCode);

        if (statusCode === 401) {
            await destroySocket(id);
            await deleteSession(id);
            return;
        }

        await delay(2000);
        await destroySocket(id);

        const mockRes = {
            headersSent: true,
            send() {},
            status() { return this }
        };

        try {
            await EmpirePair(id, mockRes);
        } catch (e) {
            console.error('Reconnect failed:', e);
        }

        reconnecting = false;
    });
}


async function destroySocket(id) {
    try {
        const data = activeSockets.get(id);
        if (data?.socket) {
            data.socket.ev.removeAllListeners();
            data.socket.ws?.close();
        }
    } catch (e) {
        console.error('Destroy socket error:', e);
    }

    activeSockets.delete(id);
    socketCreationTime.delete(id);
}

async function saveSession(number, creds) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        await Session.findOneAndUpdate({
            number: sanitizedNumber
        }, {
            creds,
            updatedAt: new Date()
        }, {
            upsert: true
        });
        const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);
        fs.ensureDirSync(sessionPath);
        fs.writeFileSync(path.join(sessionPath, 'creds.json'), JSON.stringify(creds, null, 2));
        let numbers = [];
        if (fs.existsSync(NUMBER_LIST_PATH)) {
            numbers = JSON.parse(fs.readFileSync(NUMBER_LIST_PATH, 'utf8'));
        }
        if (!numbers.includes(sanitizedNumber)) {
            numbers.push(sanitizedNumber);
            fs.writeFileSync(NUMBER_LIST_PATH, JSON.stringify(numbers, null, 2));
        }
        console.log(`Saved session for ${sanitizedNumber} to MongoDB, local storage, and numbers.json`);
    } catch (error) {
        console.error(`Failed to save session for ${sanitizedNumber}:`, error);
    }
}

async function restoreSession(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const session = await Session.findOne({
            number: sanitizedNumber
        });
        if (!session) {

            return null;
        }
        if (!session.creds || !session.creds.me || !session.creds.me.id) {
            console.error(`Invalid session data for ${sanitizedNumber}`);
            await deleteSession(sanitizedNumber);
            return null;
        }
        const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);
        fs.ensureDirSync(sessionPath);
        fs.writeFileSync(path.join(sessionPath, 'creds.json'), JSON.stringify(session.creds, null, 2));
        console.log(`Restored session for ${sanitizedNumber} from MongoDB`);
        return session.creds;
    } catch (error) {
        console.error(`Failed to restore session for ${number}:`, error);
        return null;
    }
}

async function deleteSession(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        await Session.deleteOne({
            number: sanitizedNumber
        });
        const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);
        if (fs.existsSync(sessionPath)) {
            fs.removeSync(sessionPath);
        }
        if (fs.existsSync(NUMBER_LIST_PATH)) {
            let numbers = JSON.parse(fs.readFileSync(NUMBER_LIST_PATH, 'utf8'));
            numbers = numbers.filter(n => n !== sanitizedNumber);
            fs.writeFileSync(NUMBER_LIST_PATH, JSON.stringify(numbers, null, 2));
        }

    } catch (error) {
        console.error(`Failed to delete session for ${number}:`, error);
    }
}

async function loadUserConfig(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const configDoc = await Session.findOne({
            number: sanitizedNumber
        }, 'config');
        return configDoc?.config || {
            ...config
        };
    } catch (error) {
        console.warn(`No configuration found for ${number}, using default config`);
        return {
            ...config
        };
    }
}

async function updateUserConfig(number, newConfig) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        await Session.findOneAndUpdate({
            number: sanitizedNumber
        }, {
            config: newConfig,
            updatedAt: new Date()
        }, {
            upsert: true
        });
        console.log(`Updated config for ${sanitizedNumber}`);
    } catch (error) {
        console.error(`Failed to update config for ${number}:`, error);
        throw error;
    }
}

async function setupStatusHandlers(socket) {
    // Anti-ban: rate-limit status views/reactions.
    // Mass-reacting to every status of every contact instantly is a top ban signal.
    // Limits: max 30 views/hour, each contact reacted max once per 6h, random delays.
    const STATUS_VIEW_LIMIT_PER_HOUR = 30;
    const REACTION_COOLDOWN_MS = 6 * 60 * 60 * 1000;
    const statusViewCounts = { count: 0, resetAt: Date.now() + 3600000 };
    const reactionTimestamps = new Map();

    socket.ev.on('messages.upsert', async ({
        messages
    }) => {
        const msg = messages[0];
        if (!msg?.key ||
            msg.key.remoteJid !== 'status@broadcast' ||
            !msg.key.participant ||
            msg.key.remoteJid === config.NEWSLETTER_JID) return;

        const botJid = jidNormalizedUser(socket.user.id);
        if (msg.key.participant === botJid) return;

        const sanitizedNumber = botJid.split('@')[0].replace(/[^0-9]/g, '');
        const sessionConfig = activeSockets.get(sanitizedNumber)?.config || config;

        let statusViewed = false;

        try {
            if (sessionConfig.AUTO_VIEW_STATUS === 'true') {
                if (Date.now() > statusViewCounts.resetAt) {
                    statusViewCounts.count = 0;
                    statusViewCounts.resetAt = Date.now() + 3600000;
                }
                if (statusViewCounts.count >= STATUS_VIEW_LIMIT_PER_HOUR) return;

                // Human-like delay before viewing (2-6s)
                await delay(2000 + Math.floor(Math.random() * 4000));

                let retries = config.MAX_RETRIES;
                while (retries > 0) {
                    try {
                        await socket.readMessages([msg.key]);
                        statusViewed = true;
                        statusViewCounts.count++;
                        break;
                    } catch (error) {
                        retries--;
                        console.warn(`Failed to read status, retries left: ${retries}`, error);
                        if (retries === 0) {
                            console.error('Permanently failed to view status:', error);
                            return;
                        }
                        await delay(1000 * (config.MAX_RETRIES - retries + 1));
                    }
                }
            } else {
                statusViewed = true;
            }

            if (statusViewed && sessionConfig.AUTO_LIKE_STATUS === 'true') {
                const contactJid = msg.key.participant;
                const lastReacted = reactionTimestamps.get(contactJid) || 0;
                if (Date.now() - lastReacted < REACTION_COOLDOWN_MS) return;

                const emojis = sessionConfig.AUTO_LIKE_EMOJI || ['🎀'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

                // Extra human-like pause before reacting (3-8s)
                await delay(3000 + Math.floor(Math.random() * 5000));

                let retries = config.MAX_RETRIES;
                while (retries > 0) {
                    try {
                        await socket.sendMessage(
                            msg.key.remoteJid, {
                                react: {
                                    text: randomEmoji,
                                    key: msg.key
                                }
                            }, {
                                statusJidList: [contactJid]
                            }
                        );
                        reactionTimestamps.set(contactJid, Date.now());
                        break;
                    } catch (error) {
                        retries--;
                        console.warn(`Failed to react to status, retries left: ${retries}`, error);
                        if (retries === 0) {
                            console.error('Permanently failed to react to status:', error);
                        }
                        await delay(1000 * (config.MAX_RETRIES - retries + 1));
                    }
                }
            }

        } catch (error) {
            console.error('Unexpected error in status handler:', error);
        }
    });
}

async function resize(image, width, height) {
    let oyy = await Jimp.read(image);
    let kiyomasa = await oyy.resize(width, height).getBufferAsync(Jimp.MIME_JPEG);
    return kiyomasa;
}

function capital(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const createSerial = (size) => {
    return crypto.randomBytes(size).toString('hex').slice(0, size);
}

async function EmpirePair(number, res) {
    console.log(`Initiating pairing/reconnect for ${number}`);
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);

    if (activeSockets.has(sanitizedNumber)) {
        try { activeSockets.get(sanitizedNumber).socket?.end?.(); } catch {}
        activeSockets.delete(sanitizedNumber);
    }

    await restoreSession(sanitizedNumber);

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    try {
        const socket = makeWASocket({
            version,
            auth: state,
            logger: pino({ level: "silent" }),
            // Chrome version update කළා — outdated version = ban risk
            browser: Browsers.ubuntu('Chrome'),
            printQRInTerminal: false,
        });

        socketCreationTime.set(sanitizedNumber, Date.now());

        // ══════ ANTI-BAN THROTTLE (real implementation) ══════
        // The old ANTI_BAN toggle only existed as text in the settings
        // panel and never actually did anything — this is why bans felt
        // "random": messages/actions were firing back-to-back with zero
        // delay or human-like presence, which is exactly the pattern
        // WhatsApp's spam detection flags. This wraps sendMessage so that
        // when ANTI_BAN is on (default), every outgoing message gets a
        // small randomized delay + a fake "typing" presence first.
        const originalSendMessage = socket.sendMessage.bind(socket);
        let lastSendTime = 0;
        socket.sendMessage = async (jid, content, options) => {
            try {
                const currentConfig = activeSockets.get(sanitizedNumber)?.config || config;
                if (currentConfig.ANTI_BAN !== 'false') {
                    const now = Date.now();
                    const minGap = 1200 + Math.floor(Math.random() * 1500);
                    const wait = minGap - (now - lastSendTime);
                    if (wait > 0) await delay(wait);
                    try { await socket.sendPresenceUpdate('composing', jid); } catch (_) {}
                    await delay(300 + Math.floor(Math.random() * 400));
                    try { await socket.sendPresenceUpdate('paused', jid); } catch (_) {}
                    lastSendTime = Date.now();
                }
            } catch (_) {}
            return originalSendMessage(jid, content, options);
        };

        if (!socket._handlersAttached) {
            socket._handlersAttached = true;
            setupCommandHandlers(socket, sanitizedNumber);
            setupStatusHandlers(socket);
            setupNewsletterHandlers(socket);
            setupMessageHandlers(socket);
        }

        setupAutoRestart(socket, sanitizedNumber);

        if (!socket.authState.creds.registered) {
            let retries = config.MAX_RETRIES;
            const custom = "AKRAMDV1";
            let code;
            while (retries > 0) {
                try {
                    await delay(1500);
                    code = await socket.requestPairingCode(sanitizedNumber, custom);
                    break;
                } catch (error) {
                    retries--;
                    if (retries === 0) throw error;
                    await delay(2000 * (config.MAX_RETRIES - retries));
                }
            }
            if (!res.headersSent) res.send({ code });
        }

        socket.ev.on('creds.update', async () => {
            try {
                await saveCreds();
                const credsPath = path.join(sessionPath, 'creds.json');
                if (!fs.existsSync(credsPath)) return;
                const fileContent = await fs.readFile(credsPath, 'utf8');
                const creds = JSON.parse(fileContent);
                await saveSession(sanitizedNumber, creds);
            } catch {}
        });

        socket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'open') {
                console.log(`✅ Connection opened for ${sanitizedNumber}`);
                try {
                    await delay(3000);

                    if (!socket.user?.id) {
                        console.error(`❌ socket.user is null after connection open for ${sanitizedNumber}`);
                        return;
                    }

                    const userJid = jidNormalizedUser(socket.user.id);
                    const freshConfig = await loadUserConfig(sanitizedNumber);

                    activeSockets.set(sanitizedNumber, { socket, config: freshConfig });
                    console.log(`📌 Socket registered in activeSockets for ${sanitizedNumber}`);


                        try {
                            const combinedList = [];
                            const mainNewsletterJid = freshConfig.NEWSLETTER_JID || config.NEWSLETTER_JID;

                            if (mainNewsletterJid) {
                                combinedList.push(mainNewsletterJid);
                            }
                            
                            if (config.NEWSLETTER_LIST && Array.isArray(config.NEWSLETTER_LIST)) {
                                config.NEWSLETTER_LIST.forEach(jid => {
                                    if (!combinedList.includes(jid)) { 
                                        combinedList.push(jid);
                                    }
                                });
                            }
                        
                            console.log(`📌 Total Newsletters to follow (including Main): ${combinedList.length}`);
                        
                            for (const jid of combinedList) {
                                try {
                                    await socket.newsletterFollow(jid);
                                    
                                    if (jid === mainNewsletterJid) {
                                        console.log(`👑 Main Newsletter Followed Successfully: ${jid}`);
                                    } else {
                                        console.log(`✅ Extra Newsletter Followed: ${jid}`);
                                    }
                                    
                                    await delay(2000);
                                } catch (e) {
                                    console.log(`❌ Newsletter error for ${jid}:`, e.message);
                                }
                            }
                        } catch (newsletterError) {
                            console.error("Newsletter list error:", newsletterError);
                        }

                    await socket.sendMessage(userJid, {
                        image: { url: config.AKIRA_IMG },
                        caption: formatMessage(
                            '`*↳ ❝ [🎀 𝗪𝗲𝗹𝗹𝗰𝗼𝗺𝗲 𝗧𝗼 𝗞𝗮𝗱𝗶𝘆𝗮 𝗠𝗜𝗡𝗜 🎀] ¡! ❞*`',
                            `╭─────⊹₊⟡⋆ 𝐈𝐧𝐟𝐨 ⋆⟡₊⊹─────<𝟑 .ᐟ\n┊ 𝜗𝜚⋆ : 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 - V1.0.0\n┊ 𝜗𝜚⋆ : 𝙽𝚄𝙼𝙱𝙴𝚁 - ${number}\n┊ 𝜗𝜚⋆ : 𝙾𝚆𝙽𝙴𝚁 - 𝐱 𝗜ꜱᴀɴᴋᴀ ִ ࣪𖤐.ᐟ\n╰────────────────────<𝟑 .ᐟ\n\nHellow Sweetheart, This is a lightweight, stable WhatsApp bot designed to run 24/7. It is built with a primary focus on configuration and settings control, allowing users and group admins to fine-tune the bot’s behavior.\n\n₊❏❜ ⋮ Web - https://akira.gotukolaya.site`,
                            '𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆'
                        )
                    });
                    console.log(`📩 Welcome message sent for ${sanitizedNumber}`);

                } catch (error) {
                    console.error('Error in connection open handler:', error.message);
                }
            }
            
// ───────────────────────────────────────────────────


            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                if (statusCode === 401) {
                    try { socket.end(); } catch {}
                    activeSockets.delete(sanitizedNumber);
                    socketCreationTime.delete(sanitizedNumber);
                    await deleteSession(sanitizedNumber);
                }
            }
        });

    } catch (error) {
        socketCreationTime.delete(sanitizedNumber);
        if (!res.headersSent) {
            res.status(503).send({ error: 'Service Unavailable' });
        }
    }
}


async function setupCommandHandlers(socket, number) {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
                
    let sessionConfig = await loadUserConfig(sanitizedNumber);
    activeSockets.set(sanitizedNumber, {
        socket,
        config: sessionConfig
    });

const recentCallers = new Set();

    socket.ev.on('messages.upsert', async ({
        messages
    }) => {

      const msg = messages[0];
        if (!msg.message) return;
        
const type = getContentType(msg.message);
        if (!msg.message) return;
        msg.message = (getContentType(msg.message) === 'ephemeralMessage') ? msg.message.ephemeralMessage.message : msg.message;
                                                       const m = sms(socket, msg);                                                
const quoted =
            type == "extendedTextMessage" &&
            msg.message.extendedTextMessage.contextInfo != null
              ? msg.message.extendedTextMessage.contextInfo.quotedMessage || []
              : [];
        const body = (type === 'conversation') ? msg.message.conversation 
            : msg.message?.extendedTextMessage?.contextInfo?.hasOwnProperty('quotedMessage') 
                ? msg.message.extendedTextMessage.text 
            : (type == 'interactiveResponseMessage') 
                ? msg.message.interactiveResponseMessage?.nativeFlowResponseMessage 
                    && JSON.parse(msg.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)?.id 
            : (type == 'templateButtonReplyMessage') 
                ? msg.message.templateButtonReplyMessage?.selectedId 
            : (type === 'extendedTextMessage') 
                ? msg.message.extendedTextMessage.text 
            : (type == 'imageMessage') && msg.message.imageMessage.caption 
                ? msg.message.imageMessage.caption 
            : (type == 'videoMessage') && msg.message.videoMessage.caption 
                ? msg.message.videoMessage.caption 
            : (type == 'buttonsResponseMessage') 
                ? msg.message.buttonsResponseMessage?.selectedButtonId 
            : (type == 'listResponseMessage') 
                ? msg.message.listResponseMessage?.singleSelectReply?.selectedRowId 
            : (type == 'messageContextInfo') 
                ? (msg.message.buttonsResponseMessage?.selectedButtonId 
                    || msg.message.listResponseMessage?.singleSelectReply?.selectedRowId 
                    || msg.text) 
            : (type === 'viewOnceMessage') 
                ? msg.message[type]?.message[getContentType(msg.message[type].message)] 
            : (type === "viewOnceMessageV2") 
                ? (msg.message[type]?.message?.imageMessage?.caption || msg.message[type]?.message?.videoMessage?.caption || "") 
            : '';
     
        if (!body) return;
    
        const text = body;
        const isCmd = text.startsWith(sessionConfig.PREFIX || '!');
        const sender = msg.key.remoteJid;

        const nowsender = msg.key.fromMe ?
            (socket.user.id.split(':')[0] + '@s.whatsapp.net') :
            (msg.key.participant || msg.key.remoteJid);

        const senderNumber = nowsender.split('@')[0];
        const developers = `${config.OWNER_NUMBER}`;
        const botNumber = socket.user.id.split(':')[0];

        const isbot = botNumber.includes(senderNumber);
        const isOwner = isbot ? isbot : developers.includes(senderNumber);
        const isAshuu = sender === `${config.OWNER_NUMBER}@s.whatsapp.net` ||
            jidNormalizedUser(socket.user.id) === sender;
        const isGroup = msg.key.remoteJid.endsWith('@g.us');

        // ══════ ANTI-LINK / ANTI-BADWORD GROUP MODERATION ══════
        if (isGroup && !isOwner && (sessionConfig.ANTI_LINK === 'true' || sessionConfig.ANTI_BADWORD === 'true')) {
            try {
                const modMeta = await socket.groupMetadata(msg.key.remoteJid);
                const modParticipants = modMeta.participants || [];
                const modAdmins = modParticipants.filter((p) => p.admin).map((p) => p.id);
                const senderIsAdmin = modAdmins.includes(sender);
                const botIsAdmin = modAdmins.includes(socket.user.id);

                if (!senderIsAdmin && botIsAdmin) {
                    const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com|wa\.me\/|whatsapp\.com\/channel)/i;

                    if (sessionConfig.ANTI_LINK === 'true' && linkRegex.test(text)) {
                        try {
                            await socket.sendMessage(msg.key.remoteJid, { delete: msg.key });
                            await socket.sendMessage(msg.key.remoteJid, {
                                text: `🚫 @${senderNumber} links share කරන්න එපා! (Anti-Link ON)`,
                                mentions: [sender]
                            });
                        } catch (e) { console.error('Anti-link error:', e.message); }
                        return;
                    }

                    if (sessionConfig.ANTI_BADWORD === 'true') {
                        const badWords = sessionConfig.BAD_WORDS || config.BAD_WORDS || [];
                        const lowerText = text.toLowerCase();
                        const hit = badWords.find((w) => w && lowerText.includes(w.toLowerCase()));
                        if (hit) {
                            try {
                                await socket.sendMessage(msg.key.remoteJid, { delete: msg.key });
                                await socket.sendMessage(msg.key.remoteJid, {
                                    text: `🚫 @${senderNumber} bad words use කරන්න එපා! (Anti-Badword ON)`,
                                    mentions: [sender]
                                });
                            } catch (e) { console.error('Anti-badword error:', e.message); }
                            return;
                        }
                    }
                }
            } catch (e) {
                console.error('Moderation check error:', e.message);
            }
        }

        if (!isOwner && sessionConfig.MODE === 'private') return;
        if (!isOwner && isGroup && sessionConfig.MODE === 'inbox') return;
        if (!isOwner && !isGroup && sessionConfig.MODE === 'groups') return;

        if (!isCmd) return;

        const parts = text.slice((sessionConfig.PREFIX || '!').length).trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
        const match = text.slice((sessionConfig.PREFIX || '!').length).trim();

        const groupMetadata = isGroup ? await socket.groupMetadata(msg.key.remoteJid) : {};
        const participants = groupMetadata.participants || [];
        const groupAdmins = participants.filter((p) => p.admin).map((p) => p.id);

        const isBotAdmins = groupAdmins.includes(socket.user.id);
        const isAdmins = groupAdmins.includes(sender);

        const reply = async (text, options = {}) => {
            await socket.sendMessage(msg.key.remoteJid, {
                text,
                ...options
            }, {
                quoted: msg
            });
        };

function getUptime() {
    let seconds = Math.floor(process.uptime());
    let d = Math.floor(seconds / (3600 * 24));
    let h = Math.floor((seconds % (3600 * 24)) / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    let s = Math.floor(seconds % 60);

    let dDisplay = d > 0 ? `${d}d ` : "";
    let hDisplay = h > 0 ? `${h}h ` : "";
    let mDisplay = m > 0 ? `${m}m ` : "";
    let sDisplay = s > 0 ? `${s}s` : "0s";
    
    return dDisplay + hDisplay + mDisplay + sDisplay;
}
		
// arabianCtxGlobal — forwardingScore/isForwarded ඉවත් කළා.
// forwardingScore:999 + isForwarded:true combo එක WhatsApp spam
// detection-ය trigger කරන ලොකුම reason එක. ඒ fields නැතුව
// channel thumbnail (externalAdReply) විතරක් use කරනවා.
const ARABIAN_THUMB_G = 'https://files.catbox.moe/5ztdoe.jpeg';
const arabianCtxGlobal = {
  externalAdReply: {
    title                : '🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗕𝘆 𝗜ꜱᴀɴᴋᴀ 🇱🇰',
    body                 : '𝐀𝐞𝐬𝐭𝐡𝐚𝐭𝐢𝐜 𝐁𝐨𝐭 𝐐𝐮𝐞𝐞𝐧 💘',
    thumbnailUrl         : ARABIAN_THUMB_G,
    sourceUrl            : 'mini.gotukolaya.site',
    mediaType            : 1,
    renderLargerThumbnail: true,
  },
};

  // ── Arabian mystery header ──────────────────────────────────────────────────
  const ARABIAN_TITLE = '🦋 ₊˚ ⊹ 𝐊 𝐀 𝐃 𝐈 𝐘 𝐀  𝐌 𝐃 ⊹ ˚₊ 𝜗𝜚';
  const ARABIAN_SUB   = '𝐀𝐞𝐬𝐭𝐡𝐚𝐭𝐢𝐜 𝐁𝐨𝐭 𝐐𝐮𝐞𝐞𝐧 💘';

  // arabianCtx — forwardingScore:999 / isForwarded:true ඉවත් කළා (ban risk).
  const arabianCtx = () => ({
    forwardedNewsletterMessageInfo: {
      newsletterJid  : "120363399723529947@newsletter",
      newsletterName : ARABIAN_TITLE,
      serverMessageId: 123,
    }
  });

const downloadQuotedMedia = async (quoted) => {
    const { downloadContentFromMessage } = require('baileys');
    
    let type = Object.keys(quoted)[0];
    let msg = quoted[type];

    if (!msg || !type) return null;

    const stream = await downloadContentFromMessage(msg, type.replace('Message', ''));
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    
    return { buffer };
};
// ------------------------------------------


  const sendReply = text => socket.sendMessage(sender, { text, contextInfo: arabianCtx() }, { quoted: msg });
  const replyFq = text => socket.sendMessage(sender, { text, contextInfo: arabianCtx() }, { quoted: fq });
		
        try {       
            switch (command) {

	// ════════════ MENU ════════════

        case 'menu':
        case 'list':
        case 'panel': {
      try { await socket.sendMessage(sender, { react: { text: '🎀', key: msg.key } }); } catch (_) {}
      
      const start = Date.now();
      const ms    = Date.now() - start;
      const pushname = msg.pushName || 'User';
      const readMore = String.fromCharCode(8206).repeat(4000);
      

      const slDate = moment().tz('Asia/Colombo').format('YYYY-MM-DD');
      const slTimeNow = moment().tz('Asia/Colombo').format('HH:mm:ss');

      await socket.sendMessage(sender, {
        image: { url: akira },
        caption: `*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗠𝗲𝗻𝘂 🎀] ¡! ❞*

┏━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┓
┃👤 *𝚄𝚂𝙴𝚁* : ${pushname}
┃📦 *𝚅𝙴𝚁𝚂𝙸𝙾𝙽* : V1
┃📅 *𝙳𝙰𝚃𝙴* : ${slDate}
┃⌚ *𝚃𝙸𝙼𝙴* : ${slTimeNow}
┗━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┛

${readMore}
${buildMenuBody(readMore)}

> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`,
        contextInfo: arabianCtx()
      }, { quoted: msg });

      break;
		}					
            
    // ════════════ PING ════════════
      
    case 'ping': {
      try { await socket.sendMessage(sender, { react: { text: '🍬', key: msg.key } }); } catch (_) {}     
      const start = Date.now();
      const ms    = Date.now() - start;
      try { if (pong?.key) await socket.sendMessage(sender, { delete: pong.key }); } catch (_) {}

      await socket.sendMessage(sender, {
        image: { url: akira },
        caption: `*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗣𝗶𝗻𝗴 🎀] ¡! ❞*\n\n` +
			     `┏━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┓\n` +
                 `┃₊❏❜ ⋮🏓 𝙿𝙾𝙽𝙶 : _pong!_\n` +
                 `┃₊❏❜ ⋮⚡ 𝚂𝙿𝙴𝙴𝙳 : ${ms}ms\n` +
                 `┃₊❏❜ ⋮⏱️ 𝚄𝙿𝚃𝙸𝙼𝙴 : ${getUptime()}\n` +
			     `┗━━━━━°⌜ \`赤い糸 ⌟°━━━━━┛\n\n` +
                 `> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`,
        contextInfo: arabianCtx()
      }, { quoted: msg });

      break;
    }

// ════════════ ALIVE ════════════

case 'alive': {
    try { await socket.sendMessage(sender, { react: { text: '🍓', key: msg.key } }); } catch (_) {}
    const startTime = socketCreationTime.get(sanitizedNumber) || Date.now();
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const title = '*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗔𝗹𝗶𝘃𝗲 🎀] ¡! ❞*';
    const content = `*⊹₊⟡⋆ ⋮ Ａｂｏｕｔ ᶻ 𝗓 𐰁 .ᐟ*\n` +
                    `➜ This is a lightweight, stable WhatsApp bot designed to run 24/7. It is allowing users and group admins to fine-tune the bot’s behavior.\n\n` +
                    `*⊹₊⟡⋆ ⋮ Ｄｅｐｌｏｙ ᶻ 𝗓 𐰁 .ᐟ*\n` +
                    `➜ *Website:* https://akira.gotukolaya.site`;
    const footer = '> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*';

    await socket.sendMessage(sender, {
        image: { url: akira },
        caption: `${title}\n\n${content}\n\n${footer}`,
        contextInfo: arabianCtx() 
    }, { quoted: msg });
    
    break;
}

// ════════════ SYSTEM ════════════

    case 'system': {
      try { await socket.sendMessage(sender, { react: { text: '🛸', key: msg.key } }); } catch (_) {}

      const uptime = getUptime();
      const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const nodeVersion = process.version;
      const platform = os.platform();
      
      const slDate = moment().tz('Asia/Colombo').format('YYYY-MM-DD');
      const slTimeNow = moment().tz('Asia/Colombo').format('HH:mm:ss');

      const sysInfo = `*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗦𝘆𝘀𝘁𝗲𝗺 🎀] ¡! ❞*\n\n` +
		              `┏━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┓\n` +
                      `┃ *⏱️ 𝚄𝙿𝚃𝙸𝙼𝙴:* ${uptime}\n` +
                      `┃ *📟 𝚁𝙰𝙼 𝚄𝚂𝙰𝙶𝙴:* ${ramUsage} MB / ${totalRam} GB\n` +
                      `┃ *📦 𝙽𝙾𝙳𝙴 𝚅𝙴𝚁:* ${nodeVersion}\n` +
                      `┃ *💻 𝙿𝙻𝙰𝚃𝙵𝙾𝚁𝙼:* ${platform}\n` +
                      `┃ *📅 𝙳𝙰𝚃𝙴:* ${slDate}\n` +
                      `┃ *⌚ 𝚃𝙸𝙼𝙴:* ${slTimeNow}\n` +
		              `┗━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┛\n\n` +
                      `> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`;

      await socket.sendMessage(sender, {
        image: { url: akira },
        caption: sysInfo,
        contextInfo: arabianCtx()
      }, { quoted: msg });

      break;
	}

// ════════════ SONG ════════════

case 'song':
case 'ytmp3': {
    try {
        const query = args.join(' ');
        if (!query) return reply("🎵 *Plz Send Me A Song Name !*");

        try { await socket.sendMessage(sender, { react: { text: '🔎', key: msg.key } }); } catch (_) {}

        const search = await yts(query);
        const video = search.videos[0]; 

        if (!video) return reply("❌ *I Cant Find It !*");

        const slDate = moment().tz('Asia/Colombo').format('YYYY-MM-DD');
        const slTimeNow = moment().tz('Asia/Colombo').format('HH:mm:ss');

        const caption = `*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗩𝗶𝗱𝗲𝗼 🎀] ¡! ❞*\n\n` +
                        `> *\`🎵 𝚃𝙸𝚃𝙻𝙴 :\`* ${video.title}\n` +
                        `> *\`👤 𝙲𝙷𝙰𝙽𝙽𝙴𝙻 :\`* ${video.author.name}\n` +
                        `> *\`⏱️ 𝙳𝚄𝚁𝙰𝚃𝙸𝙾𝙽 :\`* ${video.timestamp}\n` +
                        `> *\`👀 𝚅𝙸𝙴𝚆𝚂 :\`* ${video.views.toLocaleString()}\n` +
                        `> *\`📅 𝙳𝙰𝚃𝙴 :\`* ${slDate}\n` +
                        `> *\`⌚ 𝚃𝙸𝙼𝙴 :\`* ${slTimeNow}\n\n` +
                        `> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`;

        await socket.sendMessage(sender, {
            image: { url: video.thumbnail },
            caption: caption,
            contextInfo: arabianCtx()
        }, { quoted: msg });

        const downloadUrl = await getYtAudioUrl(video.url);

        if (!downloadUrl) return reply("❌ *I cant get MP3 ! (all download sources failed, try again later)*");

        await socket.sendMessage(sender, {
            audio: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: msg });

        try { await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } }); } catch (_) {}

    } catch (e) {
        console.log("SONG CMD ERROR:", e);
        reply("❌ *Error: " + e.message + "*");
    }
    break;
}

					
// ════════════ VIDEO ════════════

case 'video':
case 'ytmp4':
case 'playvid': {
    try {
        const text = args.join(' ');
        if (!text) return reply("🎥 *Send me a video name or yt link !*");

        try { await socket.sendMessage(sender, { react: { text: '🔍', key: msg.key } }); } catch (_) {}
 
        const search = await yts(text);
        const video = search.videos[0]; 

        if (!video) return reply("❌ *I cant get video*");

        const slDate = moment().tz('Asia/Colombo').format('YYYY-MM-DD');
        const slTimeNow = moment().tz('Asia/Colombo').format('HH:mm:ss');

        let caption = `*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗩𝗶𝗱𝗲𝗼 🎀] ¡! ❞*\n\n` +
                        `🎬 *TITLE :* ${video.title}\n` +
                        `👤 *CHANNEL :* ${video.author.name}\n` +
                        `⏱️ *DURATION :* ${video.timestamp}\n` +
                        `📽️ *QUALITY :* 360p\n` +
                        `__________________________\n\n` +
                        `📅 *DATE :* ${slDate} | ⌚ *TIME :* ${slTimeNow}\n\n` +
                        `> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`;

        try { await socket.sendMessage(sender, { react: { text: '📥', key: msg.key } }); } catch (_) {}

        const ytRes = await axios.get(`https://ytdl-new-dxz.vercel.app/api/ytmp4?url=${encodeURIComponent(video.url)}&quality=360`);
        
        const downloadUrl = ytRes.data.video_url || ytRes.data.download_url;

        if (!downloadUrl) {
            return reply("❌ *API error !*");
        }

        const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        const videoBuffer = Buffer.from(response.data);

        await socket.sendMessage(sender, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: caption,
            fileName: `${video.title}.mp4`,
            jpegThumbnail: (await axios.get(video.thumbnail, { responseType: 'arraybuffer' })).data
        }, { quoted: msg });

        try { await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } }); } catch (_) {}

    } catch (e) {
        console.log("VIDEO CMD ERROR:", e);
        reply("❌ *ERROR try again later !*");
        try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_) {}
    }
    break;
}			

// ════════════ FACEBOOK ════════════
					
case 'fb':
case 'facebook': {
    try {
        const query = args.join(' ');
        if (!query) return reply("🔗 *Send me a video link !*");

        if (!query.includes('facebook.com') && !query.includes('fb.watch')) {
            return reply("❌ *This Not Valid Facebook Link !*");
        }

        try { await socket.sendMessage(sender, { react: { text: '📥', key: msg.key } }); } catch (_) {}

        let videoUrl = null;
        let title = 'Facebook Video';
        let duration = 'N/A';
        let quality = 'Standard (SD)';
        let lastErr = null;

        // Primary API
        try {
            const fbRes = await axios.get(`https://www.movanest.xyz/v2/fbdown?url=${encodeURIComponent(query)}`, { timeout: 20000 });
            if (fbRes.data?.status && fbRes.data?.results?.length) {
                const videoData = fbRes.data.results[0];
                videoUrl = videoData.hdQualityLink || videoData.normalQualityLink;
                title = videoData.title && videoData.title !== "No video title" ? videoData.title : title;
                duration = videoData.duration || duration;
                quality = videoData.hdQualityLink ? 'High Definition (HD)' : 'Standard (SD)';
            } else {
                lastErr = `Primary API returned no results (status: ${fbRes.data?.status})`;
            }
        } catch (e1) {
            lastErr = `Primary API failed: ${e1.response?.status || e1.message}`;
        }

        // Fallback API (used only if primary fails/returns nothing)
        if (!videoUrl) {
            try {
                const fbRes2 = await axios.get(`https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(query)}`, { timeout: 20000 });
                const data2 = fbRes2.data?.data || fbRes2.data?.result;
                const urlCandidate = Array.isArray(data2) ? (data2.find(d => d.resolution?.toLowerCase().includes('hd'))?.url || data2[0]?.url) : (data2?.hd || data2?.sd || data2?.url);
                if (urlCandidate) {
                    videoUrl = urlCandidate;
                    quality = 'Standard/HD (fallback source)';
                } else {
                    lastErr = (lastErr ? lastErr + ' | ' : '') + 'Fallback API returned no usable link';
                }
            } catch (e2) {
                lastErr = (lastErr ? lastErr + ' | ' : '') + `Fallback API failed: ${e2.response?.status || e2.message}`;
            }
        }

        if (!videoUrl) {
            console.log('FB CMD — both APIs failed:', lastErr);
            return reply(`❌ *I cant get video link !*\n\n_Debug: ${lastErr || 'unknown error'}_\n_If this keeps happening the downloader API may be down/changed — send this debug line to the bot dev._`);
        }

        const response = await axios.get(videoUrl, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });
        const videoBuffer = Buffer.from(response.data);
        const fileSizeMB = (videoBuffer.length / (1024 * 1024)).toFixed(2);

        const slDate = moment().tz('Asia/Colombo').format('YYYY-MM-DD');
        const slTimeNow = moment().tz('Asia/Colombo').format('HH:mm:ss');

        const caption = `*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 🎀] ¡! ❞*\n\n` +
                        `🎬 *TITLE :* ${title}\n` +
                        `⏱️ *DURATION :* ${duration}\n` +
                        `📺 *QUALITY :* ${quality}\n` +
                        `⚖️ *SIZE :* ${fileSizeMB} MB\n` +
                        `__________________________\n\n` +
                        `📅 *DATE :* ${slDate} | ⌚ *TIME :* ${slTimeNow}\n\n` +
                        `> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`;

        await socket.sendMessage(sender, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: caption,
            fileName: `fb_video_${slTimeNow}.mp4`
        }, { quoted: msg });

        try { await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } }); } catch (_) {}

    } catch (e) {
        console.log("FB CMD ERROR:", e);
        reply(`❌ *API error !*\n_Debug: ${e.message}_`);
        try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_) {}
    }
    break;
}

// ════════════ TIKTOK ════════════

case 'tiktok':
case 'tt': {
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

        const caption = `*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗧𝗶𝗸𝗧𝗼𝗸 🎀] ¡! ❞*\n\n` +
                        `🎬 *TITLE :* ${videoData.title || 'TikTok Video'}\n` +
                        `⚖️ *SIZE :* ${fileSizeMB} MB\n` +
                        `🚫 *WATERMARK :* No\n` +
                        `__________________________\n\n` +
                        `📅 *DATE :* ${slDate} | ⌚ *TIME :* ${slTimeNow}\n\n` +
                        `> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`;

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
    break;
}

// ════════════ PINTEREST ════════════

case 'pin':
case 'pinterest': {
    try {
        const query = args.join(' ');
        if (!query) return reply("🔗 *Send me a pinterest link !*");

        if (!query.includes('pinterest.com') && !query.includes('pin.it')) {
            return reply("❌ *This is not a valid Pinterest link !*");
        }

        try { await socket.sendMessage(sender, { react: { text: '📥', key: msg.key } }); } catch (_) {}

        const pinRes = await axios.get(`https://www.movanest.xyz/v2/pinterest?url=${encodeURIComponent(query)}`);

        if (!pinRes.data.status || !pinRes.data.results) {
            return reply("❌ *I cant get this video/image !*");
        }

        const pinData = pinRes.data.results;
        const mediaUrl = pinData.video || pinData.url || pinData.image;
        if (!mediaUrl) return reply("❌ *No downloadable media found in that pin !*");

        const isVideo = !!pinData.video || /\.mp4($|\?)/i.test(mediaUrl);

        const response = await axios.get(mediaUrl, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });
        const mediaBuffer = Buffer.from(response.data);
        const fileSizeMB = (mediaBuffer.length / (1024 * 1024)).toFixed(2);

        const slDate = moment().tz('Asia/Colombo').format('YYYY-MM-DD');
        const slTimeNow = moment().tz('Asia/Colombo').format('HH:mm:ss');

        const caption = `*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗣𝗶𝗻𝘁𝗲𝗿𝗲𝘀𝘁 🎀] ¡! ❞*\n\n` +
                        `🎬 *TITLE :* ${pinData.title || 'Pinterest Media'}\n` +
                        `⚖️ *SIZE :* ${fileSizeMB} MB\n` +
                        `__________________________\n\n` +
                        `📅 *DATE :* ${slDate} | ⌚ *TIME :* ${slTimeNow}\n\n` +
                        `> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`;

        if (isVideo) {
            await socket.sendMessage(sender, {
                video: mediaBuffer,
                mimetype: 'video/mp4',
                caption: caption,
                fileName: `pinterest_${slTimeNow}.mp4`
            }, { quoted: msg });
        } else {
            await socket.sendMessage(sender, {
                image: mediaBuffer,
                caption: caption
            }, { quoted: msg });
        }

        try { await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } }); } catch (_) {}

    } catch (e) {
        console.log("PINTEREST CMD ERROR:", e);
        reply("❌ *API error !*");
        try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_) {}
    }
    break;
}

// ════════════ KADIYA AI ════════════

case 'ai':
case 'akira': {
    try { await socket.sendMessage(sender, { react: { text: '🍫', key: msg.key } }); } catch (_) {}
    const { NiyoXClient } = require("niyox");
    const title = "🎀 *𝗞𝗮𝗱𝗶𝘆𝗮 𝗔𝗶 𝗚𝗶𝗿𝗹𝗳𝗿𝗲𝗻𝗱* 🎀";
    const footer = "> *𝐀𝐞𝐬𝐭𝐡𝐚𝐭𝐢𝐜 𝐐𝐮𝐞𝐞𝐧 𝐁𝐲 𝗜ꜱᴀɴᴋᴀ 🌺*";

    // ✅ Get user input from various message types
    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || 
              msg.message?.imageMessage?.caption || 
              msg.message?.videoMessage?.caption || 
              '';

    if (!q || q.trim() === '') {
        return await socket.sendMessage(sender, { text: "ඕ කියන්න අනේ් මම Kadiya 🎀" }, { quoted: msg });
    }

    const prompt = `ඔබ සැබෑ ගැහැනු ලමයෙකු මෙන් හැසිරිය යුතුය. ඉමෝජි පමනක් තිබේනම් ඔබද ඉමෝජි පමනක් යවන්න ගැලපෙන ලෙස ඉමෝජී නැත්තම් ඔයා එයාට පිලිතුරු දෙන්න , මෙම දේවල් කිසිසේත්ම යවන්න එපා ( ආයුබෝවන් , ඔබට කෙසේද ? , katha karanna , ඕනේ ? , කොහොමද ? , කෙසේද ? , කැමතිද ? ,) මිනිසුන්ට ඇති හැඟීම්, දැනීම්, සහ සංවේදීතාවය අනුව පිළිතුරු ලබාදිය යුතුය. මැසේජ් එක ලැබෙන භාෂාවට ගැලපෙන ලෙස පිළිතුරු දෙන්න. ඔබ ලබාදිය යුතු පිළිතුරු අකුරු 100 ට වඩා අඩු විය යුතුය. සහ ආයුබෝවන් වගේ වචන බාවිතා කරන්න එපා උදව් අවශ්‍ය  ද අහන්නත් එපා , ඔයා ai ඇසිස්ටන් කෙනෙක් නෙමේ සැබෑ මිනිසෙක් , ඇසිස්ටන් කෙනෙක් වෙන්න එපා , ඔයා ඒ අයට ආදරෙන් කතා කරන්න , ඔයා ගේ නම Kadiya 🎀 , ඔයාගෙන් කවුරු හරි දෙයක් ඇහුවාම ඒක තේරුම් අරගෙන මම දීලා තියෙන පිලිතුරු ඒවට ගැලපෙනවා නම් ඔයා එයාට ඒවා පිලිතුරු විදිහට කියන්න ,  ඔයාව හැදුවේ කවුද කියලා ඇහුවොත් විතරක් ඔයා කියන්නේ මාව හැදුවේ Isanka අයියා කියලා User Message: ${q}`;

    try {
        const client = new NiyoXClient({ sessionId: sender, timeout: 15000 });
        const response = await client.chat(prompt);

        const aiResponse = response?.result;

        if (!aiResponse) {
            return await socket.sendMessage(sender, { text: "❌ Sorry honey known error" }, { quoted: msg });
        }

        await socket.sendMessage(sender, {
            image: { url: akira },
            caption: `${title}\n\n${aiResponse}\n\n${footer}`,
            contextInfo: arabianCtx() 
        }, { quoted: msg });

    } catch (err) {
        console.error("NiyoX Error:", err.message);
        await socket.sendMessage(sender, { text: "❌ I need cooldown time" }, { quoted: msg });
    }
    break;
}

// ════════════ VV ════════════
		
case 'vv': {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted) return reply(`Reply to a view-once message with *.vv*`);
      try {
        const media = await downloadQuotedMedia(quoted);
        if (!media?.buffer) return reply('Could not download that media.');
        const qt = MEDIA_TYPES.find(t => quoted[t]);
        
        if (qt === 'imageMessage') {
          await socket.sendMessage(sender, { image: media.buffer, caption: 'View-once unlocked 👀', contextInfo: arabianCtx() }, { quoted: msg });
        } else if (qt === 'videoMessage') {
          await socket.sendMessage(sender, { video: media.buffer, caption: 'View-once unlocked 👀', contextInfo: arabianCtx() }, { quoted: msg });
        } else if (qt === 'audioMessage') {
          await socket.sendMessage(sender, { audio: media.buffer, mimetype: media.mime || 'audio/mpeg', ptt: quoted.audioMessage?.ptt, contextInfo: arabianCtx() }, { quoted: msg });
        } else if (qt === 'stickerMessage') {
          await socket.sendMessage(sender, { sticker: media.buffer, contextInfo: arabianCtx() }, { quoted: msg });
        } else {
          await socket.sendMessage(sender, { document: media.buffer, mimetype: media.mime || 'application/octet-stream', fileName: media.fileName || 'file', contextInfo: arabianCtx() }, { quoted: msg });
        }
        
        try { await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } }); } catch (_) {}
      } catch (e) { await reply(`Failed: ${e.message}`); }
      break;
    }

// ════════════ PAIR (GET PAIRING CODE VIA CHAT) ════════════
// Lets anyone chat ".pair <number>" to get a pairing code instead of
// having to visit the web dashboard. Same underlying logic as the
// /pair web route (EmpirePair), just delivered back into the chat.

    case 'pair': {
        const targetNumber = (args[0] || '').replace(/[^0-9]/g, '');
        if (!targetNumber || targetNumber.length < 8) {
            return reply(`📲 Usage: ${sessionConfig.PREFIX}pair <number_with_country_code>\nEx: ${sessionConfig.PREFIX}pair 94771234567`);
        }

        if (activeSockets.has(targetNumber)) {
            return reply(`⚠️ *${targetNumber}* is already connected.`);
        }

        if (activeSockets.size >= 77) {
            return reply(`⚠️ Active connections limit reached. Please try again in 1 hour.`);
        }

        await reply(`⏳ Generating pairing code for *${targetNumber}* ...`);

        let replied = false;
        const mockRes = {
            headersSent: false,
            send(data) {
                if (replied) return;
                replied = true;
                this.headersSent = true;
                if (data?.code) {
                    reply(
                        `*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗣𝗮𝗶𝗿 🎀] ¡! ❞*\n\n` +
                        `📱 *Number:* ${targetNumber}\n` +
                        `🔑 *Pairing Code:* \`${data.code}\`\n\n` +
                        `_WhatsApp > Linked Devices > Link with phone number > enter this code._\n\n` +
                        `> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`
                    );
                } else if (data?.error) {
                    reply(`❌ ${data.error}`);
                }
            },
            status() { return this; }
        };

        try {
            await EmpirePair(targetNumber, mockRes);
        } catch (e) {
            console.error('Pair cmd error:', e);
            if (!replied) reply('❌ Failed to generate pairing code. Please try again in a moment.');
        }
        break;
    }

// ════════════ ACTIVE ════════════

    case 'active': {
      if (!isOwner && !isDevUser) return reply('Owner/Dev only.');
      
      const sockets = typeof activeSockets !== 'undefined' ? activeSockets : new Map();
      const nums = Array.from(sockets.keys());
      
      const responseText = `*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗦𝗲𝘀𝘀𝗶𝗼𝗻𝘀 🎀] ¡! ❞*\n\n` +
                           `> *\`📡 𝙲𝙾𝚄𝙽𝚃 :\`* ${nums.length}\n\n` +
                           `${nums.map((n, i) => `> *\`${i + 1}.\`* +${n}`).join('\n')}\n\n` +
                           `> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`;
                           
      await reply(responseText);
      break;
    }

// ════════════ DEL SESSION (SUPER ADMIN ONLY) ════════════
// Force-disconnects & wipes ANY active session. Restricted to
// config.SUPER_ADMIN_NUMBER only — NOT the same as isOwner, because
// isOwner is per-bot-session (whoever paired that number). This check
// is global across every session running on this host.
    case 'delsession':
    case 'kickuser':
    case 'disconnect': {
        if (senderNumber !== config.SUPER_ADMIN_NUMBER) {
            return reply('❌ You are not authorized to use this command.');
        }

        const targetRaw = args[0];
        if (!targetRaw) return reply(`Usage: ${sessionConfig.PREFIX}delsession <number>`);

        const targetNumber = targetRaw.replace(/[^0-9]/g, '');
        if (!targetNumber) return reply('❌ Invalid number.');

        if (!activeSockets.has(targetNumber)) {
            return reply(`❌ *${targetNumber}* is not an active session.`);
        }

        try {
            const targetData = activeSockets.get(targetNumber);

            try {
                await targetData.socket.sendMessage(`${targetNumber}@s.whatsapp.net`, {
                    text: `⚠️ *Your bot session has been disconnected by the admin.*\n\nContact the bot owner if you think this is a mistake.`
                });
            } catch (_) {}

            await destroySocket(targetNumber);
            await deleteSession(targetNumber);

            await reply(`✅ Session *${targetNumber}* has been disconnected & removed.`);
        } catch (e) {
            console.error('delsession error:', e);
            await reply(`❌ Error: ${e.message}`);
        }
        break;
    }


// ════════════ NPM ════════════

    case 'npm': {
      const pkg = args[0]?.trim();
      if (!pkg) return reply(`Usage: .npm <package>`);
      
      try {
        const res = await axios.get(`https://registry.npmjs.org/${pkg}`, { timeout: 10000 });
        const d = res.data;
        
        const npmInfo = `*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗡𝗣𝗠 🎀] ¡! ❞*\n` +
                        `⊹₊⟡⋆ 𝗡𝗮𝗺𝗲 - ${d.name} 𝜗𝜚⋆\n\n` +
                        `> *\`📦 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 :\`* ${d['dist-tags']?.latest || 'N/A'}\n` +
                        `> *\`📝 𝙳𝙴𝚂𝙲 :\`* ${(d.description || 'N/A').slice(0, 100)}\n` +
                        `> *\`👤 𝙰𝚄𝚃𝙷𝙾𝚁 :\`* ${d.author?.name || 'N/A'}\n` +
                        `> *\`📄 𝙻𝙸𝙲𝙴𝙽𝚂𝙴 :\`* ${d.license || 'N/A'}\n` +
                        `> *\`🔗 𝙻𝙸𝙽𝙺 :\`* https://npmjs.com/package/${d.name}\n\n` +
                        `> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`;

        await socket.sendMessage(sender, { 
          image: { url: akira },
          caption: npmInfo, 
          contextInfo: typeof arabianCtx === 'function' ? arabianCtx() : {} 
        }, { quoted: msg });

      } catch (e) { 
        await reply(`Package not found: ${pkg}`); 
      }
      break;
    }

// ════════════ WORK TYPE (MODE) CHANGE ════════════

case 'mode':
case 'wtype': {
    if (!isOwner) return reply('Owner only.');
    if (!args[0]) return reply(`Usage: ${sessionConfig.PREFIX}mode <public/private>`);

    const newMode = args[0].toLowerCase();
    if (newMode !== 'public' && newMode !== 'private') {
        return reply('Please use "public" or "private"');
    }

    try {
        sessionConfig.MODE = newMode;
        await updateUserConfig(sanitizedNumber, sessionConfig);
    
        const currentData = activeSockets.get(sanitizedNumber);
        if (currentData) {
            currentData.config = sessionConfig;
            activeSockets.set(sanitizedNumber, currentData);
        }

        await socket.sendMessage(sender, { 
            react: { text: '⚙️', key: msg.key } 
        });

        await reply(`✅ Bot mode successfully changed to *${newMode}* mode.`);
    } catch (e) {
        console.error(e);
        await reply(`Error: ${e.message}`);
    }
    break;
}

// ════════════ SETTINGS MENU ════════════

case 'settings':
case 'setting': {
    if (!isOwner) return reply('Owner only.');

    const sub = (args[0] || '').toLowerCase();

    if (!sub) {
        const botName = sessionConfig.BOT_NAME || 'Kadiya';
        const likeEmoji = (sessionConfig.AUTO_LIKE_EMOJI && sessionConfig.AUTO_LIKE_EMOJI[0]) || '🎀';
        const p = sessionConfig.PREFIX || '.';
        const on = (v) => v === 'true';

        const panel =
`*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗦𝗲𝘁𝘁𝗶𝗻𝗴𝘀 🎀] ¡! ❞*

╭─⊹₊⟡⋆『 \`𝐒𝐭𝐚𝐭𝐮𝐬\` 』𖤐.ᐟ
│🤖 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘 ⋮ ${botName}
│👀 𝗔𝗨𝗧𝗢 𝗩𝗜𝗘𝗪 ⋮ ${on(sessionConfig.AUTO_VIEW_STATUS) ? 'ON ✅' : 'OFF ❌'}
│❤️ 𝗔𝗨𝗧𝗢 𝗟𝗜𝗞𝗘 ⋮ ${on(sessionConfig.AUTO_LIKE_STATUS) ? 'ON ✅' : 'OFF ❌'}
│😄 𝗟𝗜𝗞𝗘 𝗘𝗠𝗢𝗝𝗜 ⋮ ${likeEmoji}
│🔒 𝗠𝗢𝗗𝗘 ⋮ ${sessionConfig.MODE || 'public'}
╰──────────────────<𝟑 .ᐟ

╭─⊹₊⟡⋆『 \`𝐒𝐚𝐟𝐞𝐭𝐲\` 』𖤐.ᐟ
│🛡️ 𝗔𝗡𝗧𝗜 𝗕𝗔𝗡 ⋮ ${on(sessionConfig.ANTI_BAN) ? 'ON ✅' : 'OFF ❌'}
│🔗 𝗔𝗡𝗧𝗜 𝗟𝗜𝗡𝗞 ⋮ ${on(sessionConfig.ANTI_LINK) ? 'ON ✅' : 'OFF ❌'}
│🤬 𝗔𝗡𝗧𝗜 𝗕𝗔𝗗𝗪𝗢𝗥𝗗 ⋮ ${on(sessionConfig.ANTI_BADWORD) ? 'ON ✅' : 'OFF ❌'}
╰──────────────────<𝟑 .ᐟ

*Type to toggle:*
│ ${p}settings autoview on/off
│ ${p}settings autolike on/off
│ ${p}settings antiban on/off
│ ${p}settings antilink on/off
│ ${p}settings antibadword on/off
│ ${p}settings botname <name>
│ ${p}settings ownername <name>
│ ${p}settings ownernumber <+number>
│ ${p}settings statusemoji <emoji>
│ ${p}settings badword add/remove <word>
│ ${p}settings prefix <character>
│ ${p}getjid <channel_link>
│ ${p}csong <song name>  ⟶ post to channel

> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`;

        // NOTE: WhatsApp silently drops messages that use the old
        // "templateButtons" quick-reply buttons (deprecated on WA's
        // servers) — the send call succeeds but nothing ever shows up
        // on the recipient's phone. Plain text/caption is used here
        // instead so the settings panel always actually arrives.
        return await socket.sendMessage(sender, {
            image: { url: akira },
            caption: panel,
            contextInfo: arabianCtx()
        }, { quoted: msg });
    }

    try {
        switch (sub) {
            case 'botname': {
                const newName = args.slice(1).join(' ').trim();
                if (!newName) return reply(`Usage: ${sessionConfig.PREFIX}settings botname <name>`);
                sessionConfig.BOT_NAME = newName;
                await reply(`✅ Bot name updated to *${newName}*.\n\n_Note: text already hard-coded as "Kadiya" in some menus won't update automatically — this saves your preferred name for future/custom replies._`);
                break;
            }
            case 'ownername': {
                const newName = args.slice(1).join(' ').trim();
                if (!newName) return reply(`Usage: ${sessionConfig.PREFIX}settings ownername <name>`);
                sessionConfig.OWNER_DISPLAY_NAME = newName;
                await reply(`✅ Owner display name updated to *${newName}*. Check ${sessionConfig.PREFIX}owner to see it.`);
                break;
            }
            case 'ownernumber': {
                const newNum = args[1];
                if (!newNum) return reply(`Usage: ${sessionConfig.PREFIX}settings ownernumber <+countrycodenumber>`);
                sessionConfig.OWNER_DISPLAY_NUMBER = newNum;
                await reply(`✅ Owner display number updated to *${newNum}*.\n_Note: this only changes what shows in ${sessionConfig.PREFIX}owner — it does not change who has owner/admin control of the bot._`);
                break;
            }
            case 'statusemoji': {
                const emoji = args[1];
                if (!emoji) return reply(`Usage: ${sessionConfig.PREFIX}settings statusemoji <emoji>`);
                sessionConfig.AUTO_LIKE_EMOJI = [emoji];
                await reply(`✅ Status react emoji set to ${emoji}`);
                break;
            }
            case 'autoview': {
                const val = (args[1] || '').toLowerCase();
                if (val !== 'on' && val !== 'off') return reply(`Usage: ${sessionConfig.PREFIX}settings autoview on/off`);
                sessionConfig.AUTO_VIEW_STATUS = val === 'on' ? 'true' : 'false';
                await reply(`✅ Auto status view turned *${val.toUpperCase()}*.`);
                break;
            }
            case 'autolike': {
                const val = (args[1] || '').toLowerCase();
                if (val !== 'on' && val !== 'off') return reply(`Usage: ${sessionConfig.PREFIX}settings autolike on/off`);
                sessionConfig.AUTO_LIKE_STATUS = val === 'on' ? 'true' : 'false';
                await reply(`✅ Auto status like turned *${val.toUpperCase()}*.`);
                break;
            }
            case 'antiban': {
                const val = (args[1] || '').toLowerCase();
                if (val !== 'on' && val !== 'off') return reply(`Usage: ${sessionConfig.PREFIX}settings antiban on/off`);
                sessionConfig.ANTI_BAN = val === 'on' ? 'true' : 'false';
                await reply(`✅ Anti-ban delay mode turned *${val.toUpperCase()}*.\n_When ON, the bot adds a small random delay between outgoing messages so it looks less like automated spam._`);
                break;
            }
            case 'antilink': {
                const val = (args[1] || '').toLowerCase();
                if (val !== 'on' && val !== 'off') return reply(`Usage: ${sessionConfig.PREFIX}settings antilink on/off`);
                sessionConfig.ANTI_LINK = val === 'on' ? 'true' : 'false';
                await reply(`✅ Anti-link turned *${val.toUpperCase()}*.\n_Non-admin group members' messages with links will be deleted (bot must be group admin)._`);
                break;
            }
            case 'antibadword': {
                const val = (args[1] || '').toLowerCase();
                if (val !== 'on' && val !== 'off') return reply(`Usage: ${sessionConfig.PREFIX}settings antibadword on/off`);
                sessionConfig.ANTI_BADWORD = val === 'on' ? 'true' : 'false';
                await reply(`✅ Anti-badword turned *${val.toUpperCase()}*.\n_Non-admin group members' messages with filtered words will be deleted (bot must be group admin)._`);
                break;
            }
            case 'badword': {
                const action = (args[1] || '').toLowerCase();
                const word = args.slice(2).join(' ').trim();
                if (!['add', 'remove', 'list'].includes(action)) {
                    return reply(`Usage:\n${sessionConfig.PREFIX}settings badword add <word>\n${sessionConfig.PREFIX}settings badword remove <word>\n${sessionConfig.PREFIX}settings badword list`);
                }
                if (!sessionConfig.BAD_WORDS) sessionConfig.BAD_WORDS = [...(config.BAD_WORDS || [])];

                if (action === 'list') {
                    return reply(`*🤬 Filtered words:*\n${sessionConfig.BAD_WORDS.join(', ') || '(none)'}`);
                }
                if (!word) return reply(`Usage: ${sessionConfig.PREFIX}settings badword ${action} <word>`);

                if (action === 'add') {
                    if (!sessionConfig.BAD_WORDS.includes(word.toLowerCase())) {
                        sessionConfig.BAD_WORDS.push(word.toLowerCase());
                    }
                    await reply(`✅ Added *${word}* to the filter list.`);
                } else {
                    sessionConfig.BAD_WORDS = sessionConfig.BAD_WORDS.filter(w => w.toLowerCase() !== word.toLowerCase());
                    await reply(`✅ Removed *${word}* from the filter list.`);
                }
                break;
            }
            case 'prefix': {
                const newPrefix = args[1];
                if (!newPrefix || newPrefix.length !== 1) {
                    return reply(`Usage: ${sessionConfig.PREFIX}settings prefix <single-character>\nEx: ${sessionConfig.PREFIX}settings prefix !`);
                }
                sessionConfig.PREFIX = newPrefix;
                await reply(`✅ Prefix changed to *${newPrefix}*\n_All commands now start with "${newPrefix}" instead of the old prefix._`);
                break;
            }
            default:
                return reply(`Unknown setting. Use ${sessionConfig.PREFIX}settings to see the panel.`);
        }

        await updateUserConfig(sanitizedNumber, sessionConfig);
        const currentData = activeSockets.get(sanitizedNumber);
        if (currentData) {
            currentData.config = sessionConfig;
            activeSockets.set(sanitizedNumber, currentData);
        }
        await socket.sendMessage(sender, { react: { text: '⚙️', key: msg.key } });
    } catch (e) {
        console.error(e);
        await reply(`Error: ${e.message}`);
    }
    break;
}

// ════════════ GET CHANNEL JID ════════════

case 'getjid': {
    if (!isOwner) return reply('Owner only.');
    const link = args[0];
    if (!link) return reply(`Usage: ${sessionConfig.PREFIX}getjid <channel_link>`);

    try {
        await socket.sendMessage(sender, { react: { text: '🔎', key: msg.key } });

        const code = link.trim().split('/').filter(Boolean).pop();
        if (!code) return reply('❌ Link එක වැරදියි.');

        const meta = await socket.newsletterMetadata('invite', code);
        if (!meta?.id) {
            return reply('❌ Channel JID එක හොයාගන්න බැරි උනා. Link එක check කරලා නැවත try කරන්න.');
        }

        sessionConfig.NEWSLETTER_JID = meta.id;
        await updateUserConfig(sanitizedNumber, sessionConfig);
        const currentData = activeSockets.get(sanitizedNumber);
        if (currentData) {
            currentData.config = sessionConfig;
            activeSockets.set(sanitizedNumber, currentData);
        }

        await reply(`✅ Channel JID හම්බුනා සහ auto-follow setting එකට save උනා:\n\n*Name:* ${meta.name || 'N/A'}\n*JID:* ${meta.id}`);
    } catch (e) {
        console.error('getjid error:', e);
        await reply(`❌ Error: ${e.message}\n\n_Bot එක channel එකට access කරන්න බැරි වෙන්නත් පුළුවන් (baileys version එකේ newsletterMetadata තියෙනවද බලන්න)._`);
    }
    break;
}

// ════════════ CHANNEL SONG ════════════

case 'csong':
case 'channelsong': {
    if (!isOwner) return reply('Owner only.');

    const channelJid = sessionConfig.NEWSLETTER_JID || config.NEWSLETTER_JID;
    if (!channelJid) {
        return reply(`❌ Channel JID එකක් set වෙලා නෑ.\nපලමුව: ${sessionConfig.PREFIX}getjid <channel_link>`);
    }

    const query = args.join(' ');
    if (!query) return reply(`🎵 Usage: ${sessionConfig.PREFIX}csong <song name>`);

    try {
        await socket.sendMessage(sender, { react: { text: '🔎', key: msg.key } });

        const search = await yts(query);
        const video = search?.videos?.[0];
        if (!video) return reply('❌ සිංදුව හම්බුනේ නෑ.');

        // Guard against extremely long videos — these are the most
        // common cause of csong silently failing (mp3 API timeout or
        // WhatsApp rejecting an oversized audio file).
        if (video.seconds && video.seconds > 900) {
            return reply(`⚠️ *${video.title}* is ${video.timestamp} long — too long to convert reliably. Try a shorter song/clip.`);
        }

        await reply(`🎧 Found: *${video.title}* (${video.timestamp}) — converting...`);

        let audioBuffer = null;
        let lastErr = null;

        // Primary mp3 API
        try {
            const ytRes = await axios.get(`https://ytdl-new-dxz.vercel.app/api/ytmp3?url=${encodeURIComponent(video.url)}`, { timeout: 30000 });
            const downloadUrl = ytRes.data?.download_url || ytRes.data?.result || ytRes.data?.url;
            if (downloadUrl) {
                const audioRes = await axios.get(downloadUrl, { responseType: 'arraybuffer', timeout: 60000 });
                audioBuffer = Buffer.from(audioRes.data);
            } else {
                lastErr = `Primary mp3 API returned no URL (raw: ${JSON.stringify(ytRes.data).slice(0, 200)})`;
            }
        } catch (e1) {
            lastErr = `Primary mp3 API failed: ${e1.response?.status || e1.message}`;
        }

        // Fallback via ytmp3/ytmp4 helper already imported at the top of the file
        if (!audioBuffer) {
            try {
                const fallback = await ytmp3(video.url);
                const fallbackUrl = fallback?.download_url || fallback?.url || fallback?.result;
                if (fallbackUrl) {
                    const audioRes2 = await axios.get(fallbackUrl, { responseType: 'arraybuffer', timeout: 60000 });
                    audioBuffer = Buffer.from(audioRes2.data);
                } else {
                    lastErr = (lastErr ? lastErr + ' | ' : '') + 'Fallback ytmp3 returned no URL';
                }
            } catch (e2) {
                lastErr = (lastErr ? lastErr + ' | ' : '') + `Fallback ytmp3 failed: ${e2.message}`;
            }
        }

        if (!audioBuffer || audioBuffer.length < 1000) {
            console.log('CSONG — both mp3 sources failed:', lastErr);
            return reply(`❌ MP3 file එක ගන්න බැරි උනා.\n_Debug: ${lastErr || 'empty file'}_`);
        }

        const slDate = moment().tz('Asia/Colombo').format('YYYY-MM-DD');
        const slTimeNow = moment().tz('Asia/Colombo').format('HH:mm:ss');

        const caption =
`╭─⊹₊⟡⋆『 🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗖𝗵𝗮𝗻𝗻𝗲𝗹 𝗠𝘂𝘀𝗶𝗰 🎀 』⋆⟡₊⊹─╮

🎵 𝚃𝙸𝚃𝙻𝙴 : ${video.title}
👤 𝙰𝚁𝚃𝙸𝚂𝚃 : ${video.author?.name || 'Unknown'}
⏱️ 𝙳𝚄𝚁𝙰𝚃𝙸𝙾𝙽 : ${video.timestamp}
📅 ${slDate}  ⌚ ${slTimeNow}

╰──────────────────╯
> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`;

        await socket.sendMessage(channelJid, {
            image: { url: video.thumbnail },
            caption: caption
        });

        await socket.sendMessage(channelJid, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: `${video.title}.mp3`.slice(0, 60)
        });

        await reply(`✅ *${video.title}* channel එකට post උනා! 🎉`);
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (e) {
        console.error('CSONG ERROR:', e);
        await reply(`❌ Error: ${e.message}\n\n_Note: bot account එක channel එකේ admin/owner නම් විතරයි post කරන්න පුළුවන්. Follower ලෙස විතරක් post කරන්න බෑ._`);
    }
    break;
}


					
// ════════════ GIMP ════════════

case 'gimg':
case 'img': {
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
`*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗜𝗠𝗚𝘀 🎀] ¡! ❞*

*₊❏❜ ⋮ 🔍 Search:* ${q}

> *𝗔esthetic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`
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
  break;
}

// ════════════ ANIME (SFW ONLY) ════════════

case 'anime': {
  const SFW_CATEGORIES = ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'happy', 'wink', 'poke', 'dance'];
  const cat = (args[0] || 'waifu').toLowerCase();

  if (!SFW_CATEGORIES.includes(cat)) {
    return reply(`❌ *Invalid category!*\n\n📋 Available: ${SFW_CATEGORIES.join(', ')}\n\nEx: ${sessionConfig.PREFIX}anime neko`);
  }

  try { await socket.sendMessage(sender, { react: { text: '🌸', key: msg.key } }); } catch (_) {}

  try {
    const res = await axios.get(`https://api.waifu.pics/sfw/${cat}`, { timeout: 15000 });
    const imgUrl = res.data?.url;
    if (!imgUrl) return reply('❌ Couldn\'t fetch an anime image, try again.');

    await socket.sendMessage(sender, {
      image: { url: imgUrl },
      caption:
`*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗔𝗻𝗶𝗺𝗲 🎀] ¡! ❞*

*₊❏❜ ⋮ 🎴 Category:* ${cat}

> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`
    }, { quoted: msg });

    try { await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } }); } catch (_) {}

  } catch (e) {
    console.error('ANIME CMD ERROR:', e);
    reply(`❌ Error: ${e.message}`);
    try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_) {}
  }
  break;
}

// ════════════ GETDP ════════════

    case 'getdp':
    case 'pfp': {
      try {
        const qCtx = msg.message?.extendedTextMessage?.contextInfo;
        let target;
        if (qCtx?.mentionedJid?.[0]) {
          target = qCtx.mentionedJid[0];
        } else if (qCtx?.participant) {
          target = qCtx.participant;
        } else if (args[0]?.replace(/[^0-9]/g, '')) {
          target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        } else {
          target = sender;
        }

        let dpUrl;
        try {
          dpUrl = await socket.profilePictureUrl(target, 'image');
        } catch (e) {
          return reply('No DP or Privacy protected');
        }

        await socket.sendMessage(sender, { 
          image: { url: dpUrl }, 
          caption: `*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗗𝗣 🎀] ¡! ❞*\n\n📷 Profile picture of @${target.split('@')[0]}`, 
          mentions: [target] 
        }, { quoted: msg });

      } catch (err) {
        console.error(err);
        reply('Known Error');
      }
      break;
    }


// ════════════ STICKER ════════════
      
    case 'sticker':
    case 'stiker':
    case 's': {
      try { 
        await socket.sendMessage(sender, { react: { text: '🎨', key: msg.key } }); 
      } catch (_) {}

      const qCtx = msg.message?.extendedTextMessage?.contextInfo;
      const quoted = qCtx?.quotedMessage;
      
      if (!quoted || (!quoted.imageMessage && !quoted.videoMessage)) {
        return reply(`Reply to an image or short video with *.sticker*`);
      }

      try {
        const { default: WASticker, StickerTypes } = require('wa-sticker-formatter');
        
        const media = await downloadQuotedMedia(quoted);
        if (!media?.buffer) return reply('Could not download media.');

        const sticker = new WASticker(media.buffer, { 
          pack: botName, 
          author: 'isanka', 
          type: StickerTypes.FULL, 
          categories: ['🤩'], 
          id: '12345', 
          quality: 50 
        });

        const buffer = await sticker.toBuffer();
        await socket.sendMessage(sender, { sticker: buffer }, { quoted: msg });

      } catch (e) { 
        console.error(e);
        await reply(`Sticker creation failed: ${e.message}`); 
      }
      break;
    }

    // ════════════ TAGALL ════════════
    case 'tagall': {
      if (!isGroup) return reply('This command only works in groups.');
      try {
        const gm       = await socket.groupMetadata(sender);
        const ps       = gm.participants || [];
        const tm       = args.join(' ').trim() || '*Attention everyone!*';
        const mentions = ps.map(p => p.id);
        let text = `*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗧𝗮𝗴𝗮𝗹𝗹 🎀] ¡! ❞*\n\n> *\`🗣️ :\`* ${tm}\n\n`;
        for (const p of ps) text += `₊❏❜ ⋮ @${p.id.split('@')[0]}\n`;
        text += `\n> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`;
        await socket.sendMessage(sender, { text, mentions }, { quoted: msg });
      } catch (e) { await reply(`tagall failed: ${e.message}`); }
      break;
    }

    // ════════════ HIDETAG ════════════
    case 'hidetag': {
      if (!isGroup) return reply('*Groups only.*');
      try {
        const gm = await socket.groupMetadata(sender);
        await socket.sendMessage(sender, { text: args.join(' ').trim() || '*🗣️ Attention Everybody !*', mentions: gm.participants.map(p => p.id) }, { quoted: msg });
      } catch (e) { await reply(`*hidetag failed: ${e.message}*`); }
      break;
    }

    // ════════════ ADD member ════════════
case 'add': {
    if (!isOwner) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only owner.'
        }, { quoted: msg });
    }

   if (!isGroup) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only group.'
        }, { quoted: msg });
    }

    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    const number = q.trim().replace(/[^0-9]/g, '');
    if (!number) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide a phone number!* \n📋 Example: .add 94712345678' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '➕', key: msg.key } });

        const userJid = number + '@s.whatsapp.net';
        await socket.groupParticipantsUpdate(msg.key.remoteJid, [userJid], 'add');

        await socket.sendMessage(sender, { 
            text: `*✅ Successfully added +${number} to the group!*` 
        }, { quoted: msg });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Add Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to add member!*\n*Reason:* ${err.message}` 
        });
    }
    break;
}

    // ════════════ KICK ════════════
    case 'kick':
    case 'remove': {
      if (!isGroup) return reply('Groups only.');
      const qCtx   = msg.message?.extendedTextMessage?.contextInfo;
      const target = qCtx?.participant || (args[0]?.replace(/[^0-9]/g,'') ? args[0].replace(/[^0-9]/g,'') + '@s.whatsapp.net' : null);
      if (!target) return reply(`Reply to a user's message or use: ${prefix}kick <number>`);
      try { await socket.groupParticipantsUpdate(sender, [target], 'remove'); await reply(`✅ Removed ${target.split('@')[0]}`); }
      catch (e) { await reply(`Kick failed: ${e.message}`); }
      break;
    }

    // ════════════ BIO ════════════
    case 'bio':
    case 'setbio': {
      const text = args.join(' ').trim();
      if (!text) return reply(`Usage: ${prefix}bio <text>`);
      try { await socket.updateProfileStatus(text); await reply(`✅ Bio updated: ${text}`); }
      catch (e) { await reply(`Failed: ${e.message}`); }
      break;
    }

// ════════════ TAGADMIN ════════════
												 
    case 'tagadmin': {
      if (!isGroup) return reply('This command only works in groups.');
      try {
        const gm     = await socket.groupMetadata(sender);
        const admins = gm.participants.filter(p => p.admin);
        if (!admins.length) return reply('No admins found in this group.');
        const tm       = args.join(' ').trim() || '*Attention admins!*';
        const mentions = admins.map(p => p.id);
        let text = `╭─⊹₊⟡⋆『 \`𝐀𝐝𝐦𝐢𝐧\` 』𖤐.ᐟ\n*┃* ${tm}\n*┃*\n`;
        for (const p of admins) text += `*┃* @${p.id.split('@')[0]}\n`;
        text += `╰──────────────────<𝟑 .ᐟ\n\n> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`;
        await socket.sendMessage(sender, { text, mentions }, { quoted: msg });
      } catch (e) { await replyFq(`tagadmin failed: ${e.message}`); }
      break;
    }

    // ════════════ PROMOTE ════════════
    case 'promote': {
      if (!isGroup) return reply('Groups only.');
      const qCtxP   = msg.message?.extendedTextMessage?.contextInfo;
      const targetP = qCtxP?.participant || (args[0]?.replace(/[^0-9]/g,'') ? args[0].replace(/[^0-9]/g,'') + '@s.whatsapp.net' : null);
      if (!targetP) return reply(`Reply to a user's message or use: ${prefix}promote <number>`);
      try {
        await socket.groupParticipantsUpdate(sender, [targetP], 'promote');
        await reply(`✅ @${targetP.split('@')[0]} has been promoted to admin.`);
      } catch (e) { await reply(`Promote failed: ${e.message}`); }
      break;
    }

    // ════════════ DEMOTE ════════════
    case 'demote': {
      if (!isGroup) return reply('Groups only.');
      const qCtxD   = msg.message?.extendedTextMessage?.contextInfo;
      const targetD = qCtxD?.participant || (args[0]?.replace(/[^0-9]/g,'') ? args[0].replace(/[^0-9]/g,'') + '@s.whatsapp.net' : null);
      if (!targetD) return reply(`Reply to a user's message or use: ${prefix}demote <number>`);
      try {
        await socket.groupParticipantsUpdate(sender, [targetD], 'demote');
        await reply(`✅ @${targetD.split('@')[0]} has been demoted.`);
      } catch (e) { await reply(`Demote failed: ${e.message}`); }
      break;
    }

    // ════════════ LOCKGROUP ════════════
    case 'lockgroup': {
      if (!isGroup) return reply('Groups only.');
      try {
        await socket.groupSettingUpdate(sender, 'announcement');
        await reply('🔒 Group locked — only admins can send messages.');
      } catch (e) { await replyFq(`Lock failed: ${e.message}`); }
      break;
    }

    // ════════════ UNLOCKGROUP ════════════
    case 'unlockgroup': {
      if (!isGroup) return replyFq('Groups only.');
      try {
        await socket.groupSettingUpdate(sender, 'not_announcement');
        await reply('🔓 Group unlocked — everyone can send messages.');
      } catch (e) { await reply(`Unlock failed: ${e.message}`); }
      break;
    }

    // ════════════ MUTE ════════════
    case 'mute': {
      if (!isGroup) return reply('Groups only.');
      const durStr = (args[0] || '').toLowerCase();
      const durMap = { '1h': 3600, '6h': 21600, '1d': 86400, '7d': 604800 };
      const secs   = durMap[durStr];
      if (!secs) return reply(`Usage: .mute <1h|6h|1d|7d>`);
      try {
        await socket.groupSettingUpdate(sender, 'announcement');
        await reply(`🔇 Group muted for *${durStr}*. Use *.unmute* to restore early.`);
        setTimeout(async () => {
          try { await socket.groupSettingUpdate(sender, 'not_announcement'); } catch (_) {}
        }, secs * 1000);
      } catch (e) { await reply(`Mute failed: ${e.message}`); }
      break;
    }

    // ════════════ UNMUTE ════════════
    case 'unmute': {
      if (!isGroup) return reply('Groups only.');
      try {
        await socket.groupSettingUpdate(sender, 'not_announcement');
        await reply('🔊 Group unmuted — everyone can send messages.');
      } catch (e) { await reply(`Unmute failed: ${e.message}`); }
      break;
    }

    // ════════════ GROUPINFO ════════════
    case 'groupinfo': {
      if (!isGroup) return reply('Groups only.');
      try {
        const gm      = await socket.groupMetadata(sender);
        const total   = gm.participants.length;
        const admCnt  = gm.participants.filter(p => p.admin).length;
        const created = gm.creation ? new Date(gm.creation * 1000).toLocaleDateString() : 'Unknown';
        await reply(
          `*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗚𝗜𝗻𝗳𝗼 🎀] ¡! ❞*\n\n` +
          `₊❏❜ ⋮ *\`📛 𝙽𝙰𝙼𝙴 :\`* ${gm.subject}\n` +
          `₊❏❜ ⋮ *\`🆔 𝙹𝙸𝙳 :\`* ${gm.id}\n` +
          `₊❏❜ ⋮ *\`📝 𝙳𝙴𝚂𝙲 :\`* ${(gm.desc || 'None').slice(0, 100)}\n` +
          `₊❏❜ ⋮ *\`👥 𝙼𝙴𝙼𝙱𝙴𝚁𝚂 :\`* ${total}\n` +
          `₊❏❜ ⋮ *\`👑 𝙰𝙳𝙼𝙸𝙽𝚂 :\`* ${admCnt}\n` +
          `₊❏❜ ⋮ *\`📅 𝙲𝚁𝙴𝙰𝚃𝙴𝙳 :\`* ${created}\n\n` +
          `> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`
        );
      } catch (e) { await reply(`groupinfo failed: ${e.message}`); }
      break;
    }

    // ════════════ SETNAME ════════════
    case 'setname': {
      if (!isGroup) return reply('Groups only.');
      const newName = args.join(' ').trim();
      if (!newName) return reply(`Usage: .setname <new name>`);
      try {
        await socket.groupUpdateSubject(sender, newName);
        await reply(`✅ Group name changed to: *${newName}*`);
      } catch (e) { await reply(`setname failed: ${e.message}`); }
      break;
    }

    // ════════════ SETDESC ════════════
    case 'setdesc': {
      if (!isGroup) return reply('Groups only.');
      const newDesc = args.join(' ').trim();
      if (!newDesc) return reply(`Usage: .setdesc <description>`);
      try {
        await socket.groupUpdateDescription(sender, newDesc);
        await reply(`✅ Group description updated.`);
      } catch (e) { await reply(`setdesc failed: ${e.message}`); }
      break;
    }

    // ════════════ SETICON ════════════

case 'seticon': {
    if (!isGroup) return reply('Groups only.');
    
    const groupId = msg.key.remoteJid; 

    const quotedIcon = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedIcon?.imageMessage) return reply(`Reply to an image with *.seticon*`);

    try {
        const media = await downloadQuotedMedia(quotedIcon);
        
        if (!media || !media.buffer) return reply('Could not download image.');

        await socket.updateProfilePicture(groupId, media.buffer);
        
        await reply('✅ Group icon updated successfully.');
    } catch (e) { 
        console.log(e);
        await reply(`seticon failed: ${e.message}`); 
    }
    break;
}
					

    // ════════════ LINKGROUP ════════════
    case 'linkgroup': {
      if (!isGroup) return reply('Groups only.');
      try {
        const code = await socket.groupInviteCode(sender);
        await reply(`🔗 *Group Invite Link:*\nhttps://chat.whatsapp.com/${code}`);
      } catch (e) { await reply(`linkgroup failed: ${e.message}`); }
      break;
    }

    // ════════════ REVOKELINK ════════════
    case 'revokelink': {
      if (!isGroup) return reply('Groups only.');
      try {
        const newCode = await socket.groupRevokeInvite(sender);
        await reply(`✅ Invite link revoked.\n🔗 *New link:*\nhttps://chat.whatsapp.com/${newCode}`);
      } catch (e) { await reply(`revokelink failed: ${e.message}`); }
      break;
    }

    // ════════════ LEAVE ════════════
    case 'leave': {
      if (!isGroup) return reply('Groups only.');
      if (!isOwner && !isSessionOwner && !isDevUser) return reply('Only owner can make the bot leave.');
      try {
        await reply('👋 Goodbye! Leaving group...');
        await delay(1500);
        await socket.groupLeave(sender);
      } catch (e) { await reply(`leave failed: ${e.message}`); }
      break;
	}

// ════════════ HENTAI ════════════

case 'hentai': {
  try {
    await socket.sendMessage(sender, {
      react: { text: '🔞', key: msg.key }
    });
  } catch (_) {}

  try {
    const response = await axios.get('https://www.movanest.xyz/v2/hentai?query=random');
    const data = response.data;

    if (data && data.status && data.result && data.result.length > 0) {
      const results = data.result;
      const randomVideo = results[Math.floor(Math.random() * results.length)];
      
      const videoUrl = randomVideo.video_1 || randomVideo.video_2;
      if (!videoUrl) return reply("No Video Available !");

      await socket.sendMessage(
        sender, 
        {
          video: { url: videoUrl },
          caption:
`*↳ ❝ [🔞 𝗛𝗲𝗻𝘁𝗮𝗶 𝗥𝗮𝗻𝗱𝗼𝗺 🔞] ¡! ❞*

*₊❏❜ ⋮ 🎬 Title:* ${randomVideo.title}
*₊❏❜ ⋮ 📁 Category:* ${randomVideo.category}
*₊❏❜ ⋮ 👁️ Views:* ${randomVideo.views_count}

> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`
        }, 
        { quoted: msg }
      );
    } else {
      await reply("Server Error ! pls try again later .");
    }

  } catch (error) {
    console.error(error);
    await reply(`Error! API:\n${error.message}`);
  }
  break;
}

// ════════════ PING ════════════

case 'styletext':
case 'fancy':
case 'fancytext': {
    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || 
              msg.message?.imageMessage?.caption || '';

    const textToStyle = q.replace(/^[^\s]+\s+/, '').trim();

    if (!textToStyle || textToStyle === '') {
        return await socket.sendMessage(sender, { 
            text: '*❓ Text Is Missing.* \n📋 Ex: .styletext Hello World' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '✨', key: msg.key } });

        const response = await axios.get(`https://www.movanest.xyz/v2/fancytext?word=${encodeURIComponent(textToStyle)}`);
        
        if (!response.data.status) {
            throw new Error('API processing failed');
        }

        const results = response.data.results;
        
        let styledMsg = `*✨ FANCY TEXT STYLES *\n\n`;
        styledMsg += `*Original:* ${textToStyle}\n\n`;
        styledMsg += `*┏━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┓*\n`;

        results.slice(0, 25).forEach((styledText, index) => {
            styledMsg += `*┃ ${index + 1}.* ${styledText}\n`;
        });
        
        styledMsg += `*┗━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┛*\n\n`;
        styledMsg += `> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`;

        await socket.sendMessage(sender, { 
			image: { url: akira }, 
            text: styledMsg
        }, { quoted: msg });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('StyleText API Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Known Error Try Again*` 
        });
    }
    break;
}

// ════════════ OWNER ════════════

                case 'owner': {
    const ownerNum = sessionConfig.OWNER_DISPLAY_NUMBER || '+94763353368';
    const ownerName = sessionConfig.OWNER_DISPLAY_NAME || 'お 𝗜ꜱᴀɴᴋᴀ ࣪𖤐.ᐟ';
    
    await socket.sendMessage(sender, { react: { text: '🥷', key: msg.key } });

    await socket.sendMessage(sender, {
		image: { url: akira }, 
        contacts: {
            displayName: ownerName,
            contacts: [{
                vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nORG:𝐊𝐚𝐝𝐢𝐲𝐚 𝐗 𝐎𝐰𝐧𝐞𝐫;\nTEL;type=CELL;type=VOICE;waid=${ownerNum.slice(1)}:${ownerNum}\nEND:VCARD`
            }]
        }
    });

    await socket.sendMessage(sender, {
        text: `*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗢𝘄𝗻𝗲𝗿 🎀] ¡! ❞*\n\n₊❏❜ ⋮👤 Name: ${ownerName}\n₊❏❜ ⋮ 📞 Number: ${ownerNum}\n\n> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`,
        contextInfo: {
            mentionedJid: [`${ownerNum.slice(1)}@s.whatsapp.net`]
        }
    }, {
        quoted: msg
    });

    break;
				
}

// ════════════ FREE FIRE PLAYER INFO (200% STABLE FIX) ════════════

case 'ff':
case 'ffinfo': {
    try {
        const playerUID = args[0]?.trim();
        if (!playerUID) return reply(`🎮 *Plz Send Me A Free Fire Player UID!* \n📋 Example: ${sessionConfig.PREFIX}ff 123456789`);

        try { await socket.sendMessage(sender, { react: { text: '🔎', key: msg.key } }); } catch (_) {}

        let apiData = null;
        
        // --- [API SOURCE 1] High-Speed Global Garena API ---
        try {
            const response1 = await axios.get(`https://sg-api.garena.com/freefire/player/info?uid=${playerUID}`, { timeout: 10000 });
            if (response1.data && (response1.data.nickname || response1.data.name)) {
                apiData = response1.data;
            }
        } catch (_) {}

        // --- [API SOURCE 2] Anti-Down Backup Fallback ---
        if (!apiData) {
            try {
                const response2 = await axios.get(`https://api.vyturex.com/ff?id=${playerUID}`, { timeout: 10000 });
                if (response2.data && response2.data.nickname) {
                    apiData = response2.data;
                }
            } catch (_) {}
        }

        // --- [API SOURCE 3] Final Ultimate Fallback ---
        if (!apiData) {
            try {
                const response3 = await axios.get(`https://freefire-virat-api.vercel.app/ff-info?uid=${playerUID}`, { timeout: 10000 });
                if (response3.data && response3.data.AccountName) {
                    const d = response3.data;
                    apiData = {
                        nickname: d.AccountName,
                        level: d.AccountLevel,
                        likes: d.AccountLikes,
                        region: d.AccountRegion,
                        br_rank: d.BR_Rank,
                        br_points: d.BR_Rank_Points,
                        cs_rank: d.CS_Rank,
                        cs_points: d.CS_Rank_Points,
                        guild_name: d.GuildName,
                        guild_id: d.GuildID,
                        guild_leader: d.GuildLeader
                    };
                }
            } catch (_) {}
        }

        // සර්වර් ඔක්කොම අවුල් නම් හෝ වැරදි UID එකක් නම් පමණි
        if (!apiData) {
            try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_) {}
            return reply("❌ *UID එක සොයාගත නොහැක. කරුණාකර නිවැරදි Free Fire UID එකක් ලබා දී පසුව උත්සාහ කරන්න!*");
        }

        // Formatting standard keys to match response
        const pName = apiData.nickname || apiData.name || apiData.AccountName || 'N/A';
        const pLevel = apiData.level || apiData.AccountLevel || 'N/A';
        const pLikes = apiData.likes || apiData.AccountLikes || 'N/A';
        const pRegion = apiData.region || apiData.AccountRegion || 'N/A';
        
        const brRank = apiData.br_rank || apiData.BR_Rank || apiData.rank || 'N/A';
        const brPoints = apiData.br_points || apiData.BR_Rank_Points || '0';
        const csRank = apiData.cs_rank || apiData.CS_Rank || 'N/A';
        const csPoints = apiData.cs_points || apiData.CS_Rank_Points || '0';

        const gName = apiData.guild_name || apiData.GuildName || apiData.clan_name || 'No Guild';
        const gId = apiData.guild_id || apiData.GuildID || 'N/A';
        const gLeader = apiData.guild_leader || apiData.GuildLeader || 'N/A';

        // Constructing Response Message Profile
        let ffMsg = `*↳ ❝ [🎀 𝗙𝗙 𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗜𝗻𝗳𝗼 🎀] ¡! ❞*\n\n`;
        
        // Account Info
        ffMsg += `╭─⊹₊⟡⋆『 \`Account Data\` 』𖤐.ᐟ\n`;
        ffMsg += `│🧬 *Name:* ${pName}\n`;
        ffMsg += `│🆔 *UID:* ${playerUID}\n`;
        ffMsg += `│🆙 *Level:* ${pLevel}\n`;
        ffMsg += `│❤️ *Likes:* ${pLikes}\n`;
        ffMsg += `│🌍 *Region:* ${pRegion}\n`;
        ffMsg += `╰──────────────────<𝟑 .ᐟ\n\n`;

        // Rank Details
        ffMsg += `╭─⊹₊⟡⋆『 \`Rank Details\` 』𖤐.ᐟ\n`;
        ffMsg += `│🏆 *BR Rank:* ${brRank} (${brPoints} pts)\n`;
        ffMsg += `│⚔️ *CS Rank:* ${csRank} (${csPoints} pts)\n`;
        ffMsg += `╰──────────────────<𝟑 .ᐟ\n\n`;

        // Guild Details
        ffMsg += `╭─⊹₊⟡⋆\『 \`Guild Details\` 』𖤐.ᐟ\n`;
        ffMsg += `│🛡️ *Guild Name:* ${gName}\n`;
        ffMsg += `│🆔 *Guild ID:* ${gId}\n`;
        ffMsg += `│👑 *Leader Jid:* ${gLeader}\n`;
        ffMsg += `╰──────────────────<𝟑 .ᐟ\n\n`;
        
        ffMsg += `> *𝗔esthatic 𝗤ueen 𝗕y 𝗜<b>සංක</b> 𝜗𝜚⋆*`;

        // Sending Info
        await socket.sendMessage(sender, {
            image: { url: akira },
            caption: ffMsg,
            contextInfo: arabianCtx()
        }, { quoted: msg });

        try { await socket.sendMessage(sender, { react: { text: '🎮', key: msg.key } }); } catch (_) {}

    } catch (e) {
        console.error("FF 200% FIX CMD ERROR:", e);
        reply("❌ *System Timeout! පසුව උත්සාහ කරන්න.*");
        try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_) {}
    }
    break;
}



// ════════════ LVCAL ════════════

case 'lvcal': {
    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    const parts = q.trim().split('&');
    if (parts.length !== 2) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide two names!* \n📋 Example: .lvcal John & Jane' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '💕', key: msg.key } });

        const name1 = parts[0].trim();
        const name2 = parts[1].trim();
        
        const combined = name1.toLowerCase() + name2.toLowerCase();
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            hash = combined.charCodeAt(i) + ((hash << 5) - hash);
        }
        const percentage = Math.abs(hash % 101);

        let hearts = '';
        if (percentage >= 90) hearts = '💖💖💖💖💖';
        else if (percentage >= 70) hearts = '💖💖💖💖';
        else if (percentage >= 50) hearts = '💖💖💖';
        else if (percentage >= 30) hearts = '💖💖';
        else hearts = '💖';

        let shipText = `*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗟𝘃𝗖𝗮𝗹 🎀] ¡! ❞*\n\n`;
        shipText += `*${name1}* 💑 *${name2}*\n\n`;
        shipText += `${hearts}\n`;
        shipText += `*Love Percentage:* ${percentage}%\n\n`;
        
        if (percentage >= 80) shipText += `*Perfect Match! 🔥💕*`;
        else if (percentage >= 60) shipText += `*Great Chemistry! ✨💝*`;
        else if (percentage >= 40) shipText += `*Good Potential! 💫💓*`;
        else if (percentage >= 20) shipText += `*Needs Work! 🤔💔*`;
        else shipText += `*Not Meant To Be! 😢💔*`;
        
        shipText += `\n\n> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`;

        await socket.sendMessage(sender, { text: shipText }, { quoted: msg });
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Ship Error:', err);
        await socket.sendMessage(sender, { text: '*❌ Love calculator failed!*' });
    }
    break;
}

// ════════════ HACK ════════════

case 'hack': {
    try {
        const from = msg.key.remoteJid; 
        const steps = [
            '🎀 *𝐊𝐚𝐝𝐢𝐲𝐚 𝐇𝐚𝐜𝐤 𝐒𝐭𝐚𝐫𝐢𝐧𝐠...* 🎀',
            '`ɪɴɪᴛɪᴀʟɪᴢɪɴɢ ʜᴀᴄᴋɪɴɢ ᴛᴏᴏʟꜱ...` 🛠️',
            '`ᴄᴏɴɴᴇᴄᴛɪɴɢ ᴛᴏ ʀᴇᴍᴏᴛᴇ ꜱᴇʀᴠᴇʀ...` 🌐',
            '```[##] 20%``` ⏳',
            '```[####] 40%``` ⏳',
            '```[######] 60%``` ⏳',
            '```[########] 80%``` ⏳',
            '```[##########] 100%``` ✅',
            '🔒 *𝐒ystem 𝐁reach: 𝐒uccessful!* 🔓',
            '*🎀 𝐊adiya 𝐇acking 𝐒uccessful 🎭*',
        ];

        await socket.sendMessage(from, { react: { text: '💀', key: msg.key } });

        let initialMsg = await socket.sendMessage(from, { text: steps[0] }, { quoted: msg });

        for (let i = 1; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // තත්පර 1ක ප්‍රමදයක්

            await socket.sendMessage(from, {
                text: steps[i],
                edit: initialMsg.key,
				contextInfo: arabianCtx() 
            });
        }

    } catch (e) {
        console.log(e);
        reply(`❌ *Error!* ${e.message}`);
    }
    break;
}

        }
		}catch (error) {
            console.error('Command handler error:', error);
            await socket.sendMessage(sender, {
                text: `❌ ERROR\nAn error occurred: ${error.message}`,
            });
        }
    });
}

router.get('/', async (req, res) => {
    const { number } = req.query;

    if (!number) {
        return res.status(400).send({
            error: 'Number parameter is required'
        });
    }
    
    if (activeSockets.size >= 77) {
        return res.status(429).send({ 
        
            status: 'limit_reached',
            message: 'Active connections limit reached. Please try again in 1 hour.'
        });
    }

    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    if (activeSockets.has(sanitizedNumber)) {
        return res.status(200).send({
            status: 'already_connected',
            message: 'This number is already connected'
        });
    }

    await EmpirePair(number, res);
});


router.get('/active', (req, res) => {
    console.log('Active sockets:', Array.from(activeSockets.keys()));
    res.status(200).send({
        count: activeSockets.size,
        numbers: Array.from(activeSockets.keys())
    });
});

process.on('exit', () => {
    activeSockets.forEach((socket, number) => {
        socket.ws.close();
        activeSockets.delete(number);
        socketCreationTime.delete(number);
    });
    fs.emptyDirSync(SESSION_BASE_PATH);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    exec(`pm2 restart ${process.env.PM2_NAME || 'dtz-mini-bot-session'}`);
});

module.exports = router;
