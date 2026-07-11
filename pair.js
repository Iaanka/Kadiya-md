/*                                                                                                                                    
  AKIRA GIRL MD MINI BOT - MULTI SESSION SUPPORT
  DEVELOPED BY CHAMOD TECH OFC
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
    'https://i.ibb.co/FZjptLY/tourl-1779693358137.jpg'
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
    ADMIN_LIST_PATH: './admin.json',
    AKIRA_IMG: 'https://i.ibb.co/FZjptLY/tourl-1779693358137.jpg',
    NEWSLETTER_JID: '120363399723529947@newsletter',
    NEWSLETTER_LIST: [
        '120363399723529947@newsletter'
    ],
    NEWSLETTER_MESSAGE_ID: '428',
    OTP_EXPIRY: 300000,
    OWNER_NUMBER: '94763353368',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbAp1d6HVvTSFTYtco0T'
};

const replyFq = (text) => reply(text);
const activeSockets = new Map();
const socketCreationTime = new Map();
const socketHandlersMap = new Map();
const SESSION_BASE_PATH = './session';
const NUMBER_LIST_PATH = './numbers.json';

// ══════════ AUTO REPLY STORAGE ══════════
const AUTOREPLY_PATH = './autoreply.json';

function loadAutoReplies() {
    try {
        if (!fs.existsSync(AUTOREPLY_PATH)) {
            fs.writeFileSync(AUTOREPLY_PATH, JSON.stringify({}, null, 2));
            return {};
        }
        return JSON.parse(fs.readFileSync(AUTOREPLY_PATH, 'utf8'));
    } catch (e) {
        console.error('AutoReply load error:', e);
        return {};
    }
}

function saveAutoReplies(data) {
    try {
        fs.writeFileSync(AUTOREPLY_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error('AutoReply save error:', e);
        return false;
    }
}

// ══════════ TEMP MAIL STORAGE ══════════
const TEMPMAIL_PATH = './tempmail.json';
const TEMPMAIL_API_BASE = 'https://whiteshadow-x-api.onrender.com/api/tools/tempmail';
const TEMPMAIL_API_TOKEN = 'pT90FX';

function loadTempMails() {
    try {
        if (!fs.existsSync(TEMPMAIL_PATH)) {
            fs.writeFileSync(TEMPMAIL_PATH, JSON.stringify({}, null, 2));
            return {};
        }
        return JSON.parse(fs.readFileSync(TEMPMAIL_PATH, 'utf8'));
    } catch (e) {
        console.error('TempMail load error:', e);
        return {};
    }
}

function saveTempMails(data) {
    try {
        fs.writeFileSync(TEMPMAIL_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error('TempMail save error:', e);
        return false;
    }
}

// Try to pull an OTP / verification code out of an email body or subject
function extractVerificationCode(str) {
    if (!str) return null;
    const clean = String(str);
    const patterns = [
        /(?:verification code|confirmation code|security code|access code|otp code|otp|pin code|passcode|pin|code)[^0-9A-Za-z]{0,12}([A-Z0-9]{4,8})/i,
        /\b(\d{6})\b/,
        /\b(\d{4,8})\b/,
        /\b([A-Z0-9]{5,8})\b/
    ];
    for (const p of patterns) {
        const m = clean.match(p);
        if (m && m[1]) return m[1];
    }
    return null;
}

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

// ══════════ RESILIENT YT DOWNLOAD RESOLVERS ══════════
// The old code called ONLY https://ytdl-new-dxz.vercel.app (an unofficial
// 3rd party endpoint) with no fallback, so if that one endpoint was
// slow/down, .song and .video just failed. The file also imported
// ytmp3/ytmp4 from "sadaslk-dlcore" at the top but never actually used them.
// These resolvers try the primary API first, then fall back to that
// package, normalizing whatever shape each one returns.
async function resolveYtAudioUrl(youtubeUrl) {
    try {
        const r = await axios.get(`https://ytdl-new-dxz.vercel.app/api/ytmp3?url=${encodeURIComponent(youtubeUrl)}`, { timeout: 20000 });
        const url = r.data?.download_url || r.data?.result || r.data?.url;
        if (url) return url;
    } catch (e) {
        console.log('Primary ytmp3 API failed:', e.message);
    }
    try {
        if (typeof ytmp3 === 'function') {
            const r = await ytmp3(youtubeUrl);
            return r?.download || r?.downloadUrl || r?.url || r?.result?.download || (typeof r === 'string' ? r : null);
        }
    } catch (e) {
        console.log('sadaslk-dlcore ytmp3 fallback failed:', e.message);
    }
    return null;
}

async function resolveYtVideoUrl(youtubeUrl, quality = '360') {
    try {
        const r = await axios.get(`https://ytdl-new-dxz.vercel.app/api/ytmp4?url=${encodeURIComponent(youtubeUrl)}&quality=${quality}`, { timeout: 20000 });
        const url = r.data?.video_url || r.data?.download_url;
        if (url) return url;
    } catch (e) {
        console.log('Primary ytmp4 API failed:', e.message);
    }
    try {
        if (typeof ytmp4 === 'function') {
            const r = await ytmp4(youtubeUrl, quality);
            return r?.download || r?.downloadUrl || r?.url || r?.result?.download || (typeof r === 'string' ? r : null);
        }
    } catch (e) {
        console.log('sadaslk-dlcore ytmp4 fallback failed:', e.message);
    }
    return null;
}

// ══════════ PLUGIN SYSTEM ══════════
// Drop a .js file into ./plugins and it's picked up automatically on start
// (and hot-reloaded via .reloadplugins). Each plugin file exports:
//   {
//     commands: ['cmdname', 'alias1', 'alias2'],
//     handler: async (ctx) => { ... }
//   }
// ctx gives the plugin everything a normal case block had access to — see
// the buildPluginCtx() call inside the message handler for the full list.
// Plugin commands are checked BEFORE the big legacy switch, so a plugin can
// override an old built-in command just by using the same command name.
const PLUGIN_DIR = path.join(__dirname, 'plugins');
const pluginCommands = new Map();

function loadPlugins() {
    pluginCommands.clear();
    if (!fs.existsSync(PLUGIN_DIR)) {
        fs.mkdirSync(PLUGIN_DIR, { recursive: true });
        return;
    }
    const files = fs.readdirSync(PLUGIN_DIR).filter(f => f.endsWith('.js'));
    for (const file of files) {
        try {
            const fullPath = path.join(PLUGIN_DIR, file);
            delete require.cache[require.resolve(fullPath)];
            const plugin = require(fullPath);
            if (!plugin || !Array.isArray(plugin.commands) || typeof plugin.handler !== 'function') {
                console.log(`⚠️ Skipping invalid plugin: ${file}`);
                continue;
            }
            for (const cmd of plugin.commands) {
                pluginCommands.set(cmd.toLowerCase(), plugin.handler);
            }
            console.log(`🔌 Loaded plugin: ${file} -> [${plugin.commands.join(', ')}]`);
        } catch (e) {
            console.log(`❌ Failed to load plugin ${file}:`, e.message);
        }
    }
}
loadPlugins();

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
    const pendingReplies = new Map();
    const seenJids = new Set();

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
                let retries = config.MAX_RETRIES;
                while (retries > 0) {
                    try {
                        await socket.readMessages([msg.key]);
                        statusViewed = true;
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
                const emojis = sessionConfig.AUTO_LIKE_EMOJI || ['🎀'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

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
                                statusJidList: [msg.key.participant]
                            }
                        );
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
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            printQRInTerminal: false,
        });

        socketCreationTime.set(sanitizedNumber, Date.now());

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
                            
                            if (config.NEWSLETTER_JID) {
                                combinedList.push(config.NEWSLETTER_JID);
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
                                    
                                    if (jid === config.NEWSLETTER_JID) {
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
                            '`*↳ ❝ [🎀 𝗪𝗲𝗹𝗹𝗰𝗼𝗺𝗲 𝗧𝗼 𝗞ᴀᴅɪʏᴀ 𝗠𝗜𝗡𝗜 🎀] ¡! ❞*`',
                            `╭─────⊹₊⟡⋆ 𝐈𝐧𝐟𝐨 ⋆⟡₊⊹─────<𝟑 .ᐟ\n┊ 𝜗𝜚⋆ : 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 - V1.0.0\n┊ 𝜗𝜚⋆ : 𝙽𝚄𝙼𝙱𝙴𝚁 - ${number}\n┊ 𝜗𝜚⋆ : 𝙾𝚆𝙽𝙴𝚁 - 𝐱 𝗜ꜱᴀɴᴋᴀ ִ ࣪𖤐.ᐟ\n╰────────────────────<𝟑 .ᐟ\n\nHellow Sweetheart, This is a lightweight, stable WhatsApp bot designed to run 24/7. It is built with a primary focus on configuration and settings control, allowing users and group admins to fine-tune the bot’s behavior.\n\n₊❏❜ ⋮ Web - kadiya-md-production.up.railway.app`,
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
        // FIX: isDevUser / isSessionOwner were used further down (case 'active',
        // and the group-leave admin check) but were never defined anywhere in
        // the original file -> guaranteed "ReferenceError: isDevUser is not
        // defined" crash whenever those commands were run.
        const isDevUser = isOwner;
        const isSessionOwner = isOwner;
        const isAshuu = sender === `${config.OWNER_NUMBER}@s.whatsapp.net` ||
            jidNormalizedUser(socket.user.id) === sender;
        const isGroup = msg.key.remoteJid.endsWith('@g.us');

        if (!isOwner && sessionConfig.MODE === 'private') return;
        if (!isOwner && isGroup && sessionConfig.MODE === 'inbox') return;
        if (!isOwner && !isGroup && sessionConfig.MODE === 'groups') return;

        // ══════════ AUTO REPLY HANDLER ══════════
        // Fires on any normal (non-command) incoming message.
        // Matches the message text against saved keywords in autoreply.json
        // and replies with text and/or a voice clip (audio link).
        if (!isCmd) {
            try {
                const autoReplies = loadAutoReplies();
                const incoming = text.trim().toLowerCase();

                for (const keyword in autoReplies) {
                    const entry = autoReplies[keyword];
                    const matchType = entry.matchType || 'exact'; // 'exact' | 'contains'
                    const isMatch = matchType === 'contains'
                        ? incoming.includes(keyword.toLowerCase())
                        : incoming === keyword.toLowerCase();

                    if (isMatch) {
                        if (entry.text) {
                            await socket.sendMessage(sender, {
                                text: entry.text
                            }, { quoted: msg });
                        }
                        if (entry.voiceUrl) {
                            await socket.sendMessage(sender, {
                                audio: { url: entry.voiceUrl },
                                mimetype: 'audio/mpeg',
                                ptt: true
                            }, { quoted: msg });
                        }
                        break; // stop at first matching keyword
                    }
                }
            } catch (e) {
                console.error('AutoReply handler error:', e);
            }
            return;
        }

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
		
const ARABIAN_THUMB_G = 'https://files.catbox.moe/5ztdoe.jpeg';
const arabianCtxGlobal = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid  : '120363399723529947@newsletter',
    newsletterName : '🎀 𝗔𝗸𝗶𝗿𝗮-𝗠𝗗 | 𝗟𝗞 🇱🇰',
    serverMessageId: 143,
  },
  externalAdReply: {
    title                : '🎀 𝗔𝗸𝗶𝗿𝗮 𝗕ʏ 𝗜ꜱᴀɴᴋᴀ 🇱🇰',
    body                 : '𝐀𝐞𝐬𝐭𝐡𝐚𝐭𝐢𝐜 𝐁𝐨𝐭 𝐐𝐮𝐞𝐞𝐧 💘',
    thumbnailUrl         : ARABIAN_THUMB_G,
    sourceUrl            : 'kadiya-md-production.up.railway.app',
    mediaType            : 1,
    renderLargerThumbnail: true,
  },
};

  // ── Arabian mystery header ──────────────────────────────────────────────────
  const ARABIAN_TITLE = '🦋 ₊˚ ⊹ 𝐊 𝐀 𝐃 𝐈 𝐘 𝐀  𝐌 𝐃 ⊹ ˚₊ 𝜗𝜚';
  const ARABIAN_SUB   = 'ᴏᴡɴᴇʀ : 𝗜ꜱᴀɴᴋᴀ 👥🤍';

  const arabianCtx = () => ({
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid  : "120363399723529947@newsletter",
      newsletterName : ARABIAN_TITLE,
      serverMessageId: 123,
    }
  });

// FIX: MEDIA_TYPES was used (case 'vv') but never defined anywhere in the
// original file, so ".vv" always crashed with "MEDIA_TYPES is not defined".
const MEDIA_TYPES = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'];

const downloadQuotedMedia = async (quoted) => {
    const { downloadContentFromMessage } = require('baileys');

    let type = MEDIA_TYPES.find(t => quoted[t]) || Object.keys(quoted)[0];
    let mediaMsg = quoted[type];

    if (!mediaMsg || !type) return null;

    const stream = await downloadContentFromMessage(mediaMsg, type.replace('Message', ''));
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    return {
        buffer,
        mime: mediaMsg.mimetype,
        fileName: mediaMsg.fileName || `file.${(mediaMsg.mimetype || '').split('/')[1] || 'bin'}`
    };
};
// ------------------------------------------

  const sendReply = text => socket.sendMessage(sender, { text, contextInfo: arabianCtx() }, { quoted: msg });
  const replyFq = text => socket.sendMessage(sender, { text, contextInfo: arabianCtx() }, { quoted: fq });
		
        try {
            // ── Plugin dispatch: if a file in ./plugins registered this
            // command, run that instead of falling into the legacy switch. ──
            if (pluginCommands.has(command)) {
                const ctx = {
                    socket, msg, sender, args, text, command, match,
                    reply, sendReply, arabianCtx, arabianCtxGlobal,
                    sessionConfig, config, isOwner, isDevUser, isSessionOwner,
                    isGroup, isAdmins, isBotAdmins, groupMetadata, participants,
                    downloadQuotedMedia, MEDIA_TYPES,
                    resolveYtAudioUrl, resolveYtVideoUrl,
                    moment, yts, axios, akira
                };
                await pluginCommands.get(command)(ctx);
                return;
            }

            switch (command) {

	// ════════════ MENU ════════════

        case 'reloadplugins': {
            if (!isOwner) return reply('❌ Only the bot owner/admin can reload plugins.');
            loadPlugins();
            await reply(`✅ Reloaded plugins. Active commands: ${[...pluginCommands.keys()].join(', ') || '(none)'}`);
            break;
        }

        case 'menu':
        case 'list':
        case 'panel': {
      try { await socket.sendMessage(sender, { react: { text: '🤍', key: msg.key } }); } catch (_) {}
      
      const start = Date.now();
      const ms    = Date.now() - start;
      const pushname = msg.pushName || 'User';
      const readMore = String.fromCharCode(8206).repeat(4000);
      

      const slDate = moment().tz('Asia/Colombo').format('YYYY-MM-DD');
      const slTimeNow = moment().tz('Asia/Colombo').format('HH:mm:ss');

      const menuButtons = [
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎵 Song', id: `${sessionConfig.PREFIX || '.'}song` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎥 Video', id: `${sessionConfig.PREFIX || '.'}video` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📶 Ping', id: `${sessionConfig.PREFIX || '.'}ping` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👑 Owner', id: `${sessionConfig.PREFIX || '.'}owner` }) }
      ];

      try {
        await socket.sendMessage(sender, {
          image: { url: akira },
          caption: `*↳ ❝ [🎀 𝗞ᴀᴅɪʏᴀ 𝗚𝗶𝗿𝗹 𝗠𝗲𝗻𝘂 🎀] ¡! ❞*

┏━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┓
┃👤 *𝚄𝚂𝙴𝚁* : ${pushname}
┃📦 *𝚅𝙴𝚁𝚂𝙸𝙾𝙽* : V1
┃📅 *𝙳𝙰𝚃𝙴* : ${slDate}
┃⌚ *𝚃𝙸𝙼𝙴* : ${slTimeNow}
┗━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┛

👇 Tap a quick command below, or type *${sessionConfig.PREFIX || '.'}<command>* for the full list.`,
          footer: 'Akira Girl MD',
          interactiveButtons: menuButtons,
          contextInfo: arabianCtx()
        }, { quoted: msg });
      } catch (btnErr) {
        // Some WhatsApp clients / older WhatsApp app builds silently drop
        // interactive button messages entirely. We don't hard-fail the
        // command if that happens — the full text menu below still sends.
        console.log('Menu buttons failed to send:', btnErr.message);
      }

      // Full detailed command list always sent too, so .menu never depends
      // solely on buttons rendering correctly.
      await socket.sendMessage(sender, {
        image: { url: akira },
        caption: `*↳ ❝ [🎀 𝗞ᴀᴅɪʏᴀ 𝗚𝗶𝗿𝗹 𝗠𝗲𝗻𝘂 🎀] ¡! ❞*

┏━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┓
┃👤 *𝚄𝚂𝙴𝚁* : ${pushname}
┃📦 *𝚅𝙴𝚁𝚂𝙸𝙾𝙽* : V1
┃📅 *𝙳𝙰𝚃𝙴* : ${slDate}
┃⌚ *𝚃𝙸𝙼𝙴* : ${slTimeNow}
┗━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┛

${readMore}
╭─⊹₊⟡⋆『 \`𝐌𝐚𝐢𝐧 𝐂𝐦𝐝𝐳\` 』𖤐.ᐟ
│₊❏❜ ⋮ •menu ➜ ɢᴇᴛ ᴄᴍᴅ ʟɪꜱᴛ
│₊❏❜ ⋮ •system ➜ ɢᴇᴛ ꜱʏꜱᴛᴇᴍ ɪɴꜰᴏ
│₊❏❜ ⋮ •ping ➜ ɢᴇᴛ ʙᴏᴛ ꜱᴘᴇᴇᴅ
│₊❏❜ ⋮ •alive ➜ ᴄʜᴇᴄᴋ ʙᴏᴛ ᴀʟɪᴠᴇ
│₊❏❜ ⋮ •owner ➜ ɢᴇᴛ ᴏᴡɴᴇʀ ɪɴꜰᴏ
│₊❏❜ ⋮ •weather ➜ ɢᴇᴛ ᴡᴇᴀᴛʜᴇʀ ɪɴꜰᴏ
╰──────────────────<𝟑 .ᐟ
${readMore}
╭─⊹₊⟡⋆『 \`𝐃𝐰𝐧 𝐂𝐦𝐝𝐳\` 』𖤐.ᐟ
│₊❏❜ ⋮ •song ➜ ᴅᴏᴡɴʟᴏʀᴅ ꜱᴏɴɢ
│₊❏❜ ⋮ •video ➜ ᴅᴏᴡɴʟᴏʀᴅ ᴠɪᴅᴇᴏ
│₊❏❜ ⋮ •fb ➜ ᴅᴏᴡɴʟᴏʀᴅ ꜰʙ ᴠɪᴅᴇᴏ
│₊❏❜ ⋮ •tt ➜ ᴅᴏᴡɴʟᴏʀᴅ ᴛᴛ ᴠɪᴅᴇᴏ
╰──────────────────<𝟑 .ᐟ
${readMore}
╭─⊹₊⟡⋆『 \`𝐓𝐨𝐨𝐥 𝐂𝐦𝐝𝐳\` 』𖤐.ᐟ
│₊❏❜ ⋮ •vv ➜ ᴅᴇᴄʀʏᴘᴛ ᴏɴᴇ ᴛɪᴍᴇ ꜰɪʟᴇ
│₊❏❜ ⋮ •sticker ➜ ᴄᴏɴᴠᴇᴛʀ ᴛᴏ ꜱᴛᴋ
│₊❏❜ ⋮ •fancy ➜ ᴄᴏɴᴠᴇᴛ ᴛᴏ ꜰᴀɴᴄʏ ᴛᴇxᴛ
│₊❏❜ ⋮ •getdp ➜ ɢᴇᴛ ᴡʜ ᴘʀᴏꜰɪʟᴇ 4ᴛᴏ
│₊❏❜ ⋮ •npm ➜ ꜱᴇᴀʀᴄʜ ɴᴘᴍ ᴘᴋɢꜱ
│₊❏❜ ⋮ •img ➜ ꜱᴇᴀʀᴄʜ ɪᴍɢꜱ
│₊❏❜ ⋮ •mode ➜ ᴄʜᴀɴɢᴇ ʙᴏᴛ ᴍᴏᴅᴇ
╰──────────────────<𝟑 .ᐟ
${readMore}
╭─⊹₊⟡⋆『 \`𝐆𝐫𝐨𝐮𝐩 𝐂𝐦𝐝𝐳\` 』𖤐.ᐟ
│₊❏❜ ⋮ •tagall ➜ ᴛᴀɢᴀʟʟ ᴍᴇᴍʙᴇʀꜱ
│₊❏❜ ⋮ •hidetag ➜ ᴛᴀɢᴀʟʟ ᴍᴇᴍ ꜱɪʟᴇɴᴛʟʏ
│₊❏❜ ⋮ •add ➜ ᴀᴅᴅ ᴍᴇᴍʙᴇʀ
│₊❏❜ ⋮ •kick ➜ ᴋɪᴄᴋ ᴍᴇᴍʙᴇʀ
│₊❏❜ ⋮ •tagadmin ➜ ᴛᴀɢ ᴀʟʟ ᴀᴅᴍɪɴꜱ
│₊❏❜ ⋮ •promote ➜ ᴍᴀᴋᴇ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴ
│₊❏❜ ⋮ •demote ➜ ᴅɪꜱᴍɪꜱꜱ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴ
│₊❏❜ ⋮ •lockgroup ➜ ʟᴏᴄᴋ ᴛʜᴇ ɢʀᴏᴜᴘ
│₊❏❜ ⋮ •unlockgroup ➜ ᴜɴʟᴏᴄᴋ ᴛʜᴇ ɢʀᴏᴜᴘ
│₊❏❜ ⋮ •mute ➜ ᴍᴜᴛᴇ ᴛʜᴇ ɢʀᴏᴜᴘ
│₊❏❜ ⋮ •unmute ➜ ᴜɴᴍᴜᴛᴇ ᴛʜᴇ ɢʀᴏᴜᴘ
│₊❏❜ ⋮ •setname ➜ ꜱᴇᴛ ɢʀᴏᴜᴘ ɴᴀᴍᴇ
│₊❏❜ ⋮ •setdesc ➜ ꜱᴇᴛ ɢʀᴏᴜᴘ ᴅᴇꜱᴄ
│₊❏❜ ⋮ •seticon ➜ ꜱᴇᴛ ɢʀᴏᴜᴘ ɪᴄᴏɴ
│₊❏❜ ⋮ •linkgroup ➜ ɢᴇᴛ ɢʀᴏᴜᴘ ʟɪɴᴋ
│₊❏❜ ⋮ •revokelink ➜ ʀꜱᴇᴛ ɢʀᴏᴜᴘ ʟɪɴᴋ
│₊❏❜ ⋮ •leave ➜ ʟᴇᴀᴠᴇ ᴛʜᴇ ɢʀᴏᴜᴘ
╰──────────────────<𝟑 .ᐟ
${readMore}
╭─⊹₊⟡⋆『 \`𝐀𝐈 𝐂𝐦𝐝𝐳\` 』𖤐.ᐟ
│₊❏❜ ⋮ •akira ➜ ᴀᴋɪʀᴀ ᴀɪ ɢɪʀʟꜰʀɪᴇɴᴅ
╰──────────────────<𝟑 .ᐟ
${readMore}
╭─⊹₊⟡⋆『 \`𝐅𝐮𝐧 𝐂𝐦𝐝𝐳\` 』𖤐.ᐟ
│₊❏❜ ⋮ •lvcal ➜ ʟᴏᴠᴇ ᴄᴀʟᴄᴜʟᴀᴛᴇʀ
│₊❏❜ ⋮ •hentai ➜ ɢᴇᴛ ʜᴇɴᴛᴀɪ ᴠɪᴅᴇᴏ(18+)
│₊❏❜ ⋮ •hack ➜ ꜱᴇɴᴅ ʜᴀᴄᴋɪɴɢ ᴍꜱɢ
╰──────────────────<𝟑 .ᐟ


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
        caption: `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗣𝗶𝗻𝗴 🎀] ¡! ❞*\n\n` +
			     `┏━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┓\n` +
                 `┃₊❏❜ ⋮🏓 𝙿𝙾𝙽𝙶 : _pong!_\n` +
                 `┃₊❏❜ ⋮⚡ 𝚂𝙿𝙴𝙴𝙳 : ${ms}ms\n` +
                 `┃₊❏❜ ⋮⏱️ 𝚄𝙿𝚃𝙸𝙼𝙴 : ${getUptime()}\n` +
			     `┗━━━━━°⌜ \`赤い糸 ⌟°━━━━━┛\n\n` +
                 `> *𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`,
        contextInfo: arabianCtx()
      }, { quoted: msg });

      break;
    }
// ════════════ ALIVE ════════════
case 'weather': {
    try {
        let location = body.split(' ').slice(1).join(' ');
        if (!location) location = 'Colombo'; // namak nathnam Colombo

        await socket.sendMessage(sender, { react: { text: '🌤️', key: msg.key } }).catch(() => {});

        // wttr.in - free API, key nathiwa weda
        const url = `https://wttr.in/${encodeURIComponent(location)}?format=j1`;
        const { data } = await axios.get(url, { timeout: 15000 });

        const current = data.current_condition[0];
        const today = data.weather[0];

        let replyText = `🌍 *${location} Weather* \n\n`;
        replyText += `🌡️ *Temp*: ${current.temp_C}°C | Feels: ${current.FeelsLikeC}°C\n`;
        replyText += `☁️ *Sky*: ${current.weatherDesc[0].value}\n`;
        replyText += `💧 *Humidity*: ${current.humidity}%\n`;
        replyText += `🌬️ *Wind*: ${current.windspeedKmph} km/h ${current.winddir16Point}\n`;
        replyText += `👁️ *Visibility*: ${current.visibility} km\n`;
        replyText += `🌧️ *Rain Chance*: ${today.hourly[0].chanceofrain}%\n\n`;
        replyText += `📅 *Today*: ${today.maxtempC}°C / ${today.mintempC}°C\n`;
        replyText += `🌅 *Sunrise*: ${today.astronomy[0].sunrise} 🌇 *Sunset*: ${today.astronomy[0].sunset}`;

        await socket.sendMessage(sender, { text: replyText }, { quoted: msg });
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (e) {
        console.log("WEATHER ERROR:", e.message);
        reply("❌ *City eka hoya ganna bari una*\nEx: `.weather Kandy` `.weather New York`");
    }
    break;
}
					
// ════════════ auto ════════════

					
// ════════════ ALIVE ════════════
case 'send': {
      // බොට් ක්‍රියාවලිය පටන් ගත් බව පෙන්වීමට React එකක් දමයි
      try { await socket.sendMessage(sender, { react: { text: '⏳', key: msg.key } }); } catch (_) {}

      try {
          // 1. Context Info සහ Quoted Message එක ආරක්ෂිතව ලබා ගැනීම
          const contextInfo = msg.message?.extendedTextMessage?.contextInfo || 
                              msg.message?.imageMessage?.contextInfo || 
                              msg.message?.videoMessage?.contextInfo || 
                              msg.message?.conversation?.contextInfo;
                              
          const quotedMsg = contextInfo?.quotedMessage;
          
          if (!quotedMsg) {
              try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_) {}
              return await socket.sendMessage(sender, { text: "❌ කරුණාකර ඔබට අවශ්‍ය Status එකට Reply එකක් විදිහට `.send` ලබාදෙන්න." }, { quoted: msg });
          }

          // 2. Status එකක්ද කියා සෙවීමට ඇති උපරිම ක්‍රමවේද (Multi-Device Bug Fix)
          const quotedParticipant = contextInfo?.participant || "";
          const quotedChat = contextInfo?.remoteJid || "";
          
          const isStatus = quotedParticipant.includes('status') || 
                           quotedChat.includes('status') || 
                           quotedParticipant === 'status@broadcast';
          
          if (!isStatus) {
              try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_) {}
              return await socket.sendMessage(sender, { text: "❌ මෙය WhatsApp Status එකක් නොවේ. කරුණාකර Status එකකටම reply කරන්න." }, { quoted: msg });
          }

          // 3. Media Type එක හරියටම වෙන් කර ගැනීම (Image, Video, Audio, Document, Sticker)
          const type = Object.keys(quotedMsg).find(key => key.endsWith('Message'));
          const validTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'];
          
          if (!type || !validTypes.includes(type)) {
              try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_) {}
              return await socket.sendMessage(sender, { text: "❌ මේ status එකේ download කරන්න පුළුවන් මාධ්‍යයක් (Media) නැහැ." }, { quoted: msg });
          }

          // 4. Media එක Baileys හරහා Download කරගැනීම
          // සමහර බොට්ස් වල quoted message එක direct පාස් කරන්න බෑ, ඒ නිසා structure එක මෙහෙම හදන්න ඕනේ:
          const downloadContext = { 
              message: quotedMsg 
          };
          const buffer = await downloadMediaMessage(downloadContext, 'buffer', {});

          // 5. යවන Media වර්ගය තෝරා ගැනීම
          let mediaOptions = {};
          const originalCaption = quotedMsg[type]?.caption || "";

          // ලස්සනට ඔයාගේ බොට් තේමාවට කැප්ෂන් එක හැදීම
          const statusInfo = `*↳ ❝ [🎀 𝗦𝘁𝗮𝘁𝘂𝘀 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿 🎀] ¡! ❞*\n\n` +
                             `┏━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┓\n` +
                             `┃ *📝 𝙲𝙰𝙿𝚃𝙸𝙾𝙽:* ${originalCaption || 'No Caption'}\n` +
                             `┗━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┛\n\n` +
                             `> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`;

          if (type === 'imageMessage') {
              mediaOptions = { image: buffer, caption: statusInfo };
          } else if (type === 'videoMessage') {
              mediaOptions = { video: buffer, caption: statusInfo };
          } else if (type === 'audioMessage') {
              mediaOptions = { audio: buffer, mimetype: quotedMsg.audioMessage.mimetype, ptt: quotedMsg.audioMessage.ptt };
          } else if (type === 'stickerMessage') {
              mediaOptions = { sticker: buffer };
          } else {
              mediaOptions = { document: buffer, mimetype: quotedMsg[type].mimetype, fileName: quotedMsg[type].fileName || 'status' };
          }

          // Context Info එක එකතු කිරීම
          mediaOptions.contextInfo = arabianCtx();

          // 6. ඔබ වෙතම (Sender) සාර්ථකව යැවීම
          await socket.sendMessage(sender, mediaOptions, { quoted: msg });

          // වැඩේ ඉවරයි නම් ✅ React එක දානවා
          try { await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } }); } catch (_) {}

      } catch (error) {
          console.error("Status Downloader Ultimate Error:", error);
          try { await socket.sendMessage(sender, { react: { text: '⚠️', key: msg.key } }); } catch (_) {}
          await socket.sendMessage(sender, { text: "⚠️ Status එක download කිරීමේදී දෝෂයක් වුණා. නැවත උත්සාහ කරන්න." }, { quoted: msg });
      }
      break;
}

// ════════════ FORWARD (no download, relays media directly) ════════════
// Usage: reply to any video/photo/pdf/document/text with:
//   .fw 94763353368
//   .fw 94763353368 94771234567   (forward to several numbers at once)
case 'fw':
case 'forward': {
    if (!isOwner) return reply('❌ Only the bot owner/admin can use forward.');

    try { await socket.sendMessage(sender, { react: { text: '⏳', key: msg.key } }); } catch (_) {}

    try {
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const quotedMsg = contextInfo?.quotedMessage;

        if (!quotedMsg) {
            try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_) {}
            return await socket.sendMessage(sender, {
                text: `❌ Forward කරන්න ඕන message එකට (video/photo/pdf/document/text) Reply කරලා *${sessionConfig.PREFIX || '.'}fw <number>* type කරන්න.\n\nEx: *${sessionConfig.PREFIX || '.'}fw 94763353368*\nඑකවර number ගණනකට: *${sessionConfig.PREFIX || '.'}fw 94763353368 94771234567*`
            }, { quoted: msg });
        }

        if (!args.length) {
            try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_) {}
            return await socket.sendMessage(sender, {
                text: `❌ Number එකක් දෙන්න. Ex: *${sessionConfig.PREFIX || '.'}fw 94763353368*`
            }, { quoted: msg });
        }

        // Build a minimal WAMessage object around the quoted message so Baileys
        // can generate forward content from it. This relays the media through
        // WhatsApp's servers directly — the bot never downloads or re-uploads it.
        const quotedKey = {
            remoteJid: contextInfo?.remoteJid || sender,
            fromMe: false,
            id: contextInfo?.stanzaId,
            participant: contextInfo?.participant
        };
        const fullQuoted = { key: quotedKey, message: quotedMsg };

        const targets = args
            .map(n => n.replace(/[^0-9]/g, ''))
            .filter(Boolean)
            .map(n => n + '@s.whatsapp.net');

        if (!targets.length) {
            try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_) {}
            return await socket.sendMessage(sender, { text: '❌ Valid phone number එකක් නෑ.' }, { quoted: msg });
        }

        let sentCount = 0;
        for (const jid of targets) {
            try {
                const forwardContent = generateForwardMessageContent(fullQuoted, false);
                const forwardId = generateMessageID();
                const waMsg = generateWAMessageFromContent(jid, forwardContent, {
                    userJid: socket.user.id,
                    messageId: forwardId
                });
                await socket.relayMessage(jid, waMsg.message, { messageId: waMsg.key.id });
                sentCount++;
            } catch (e) {
                console.error(`Forward to ${jid} failed:`, e);
            }
        }

        try { await socket.sendMessage(sender, { react: { text: sentCount ? '✅' : '⚠️', key: msg.key } }); } catch (_) {}
        await socket.sendMessage(sender, {
            text: sentCount
                ? `✅ Message එක number ${sentCount}/${targets.length}කට forward කළා (bot එකේ download කිරීමකින් තොරව, direct relay).`
                : `⚠️ එකකටවත් forward කරන්න බැරි උනා.`
        }, { quoted: msg });

    } catch (error) {
        console.error('Forward Error:', error);
        try { await socket.sendMessage(sender, { react: { text: '⚠️', key: msg.key } }); } catch (_) {}
        await socket.sendMessage(sender, { text: `⚠️ Error: ${error.message}` }, { quoted: msg });
    }
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

    const title = '*↳ ❝ [🎀 𝗞ᴀᴅɪʏᴀ 𝗚𝗶𝗿𝗹 𝗔𝗹𝗶𝘃𝗲 🎀] ¡! ❞*';
    const content = `*⊹₊⟡⋆ ⋮ Ａｂｏｕｔ ᶻ 𝗓 𐰁 .ᐟ*\n` +
                    `➜ This is a lightweight, stable WhatsApp bot designed to run 24/7. It is allowing users and group admins to fine-tune the bot’s behavior.\n\n` +
                    `*⊹₊⟡⋆ ⋮ Ｄｅｐｌｏｙ ᶻ 𝗓 𐰁 .ᐟ*\n` +
                    `➜ *Website:* kadiya-md-production.up.railway.app`;
    const footer = '> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*';

    await socket.sendMessage(sender, {
        image: { url: akira },
        caption: `${title}\n\n${content}\n\n${footer}`,
        contextInfo: arabianCtx() 
    }, { quoted: msg });
    
    break;
}
// ════════════ ALIVE ════════════
case 'movie': {
    try { await socket.sendMessage(sender, { react: { text: '⏳', key: msg.key } }); } catch (_){}

    try {
        const args = text.trim().split(/ +/).slice(1);
        const movieName = args.join(' ');

        if (!movieName) {
            try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_){}
            return await socket.sendMessage(sender, { text: "❌ Movie එකේ නම දෙන්න.\n\n*Ex:* `.movie paththini`" }, { quoted: msg });
        }

        await socket.sendMessage(sender, { text: `🔍 *${movieName}* search කරනවා...` }, { quoted: msg });

        // 1. SEARCH API
        const searchRes = await axios.get(`https://nntech-free-sinhalasub-search-api.vercel.app/api/search?text=${encodeURIComponent(movieName)}`, {timeout: 15000});

        let results = searchRes.data?.results || searchRes.data?.data || searchRes.data || []

        if(!Array.isArray(results) || results.length === 0){
            try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_){}
            return await socket.sendMessage(sender, { text: `❌ "${movieName}" කියලා movie එකක් හොයාගන්න බැරි උනා.` }, { quoted: msg });
        }

        let listMsg = `*NNTECH MOVIE SEARCH RESULTS*\n\n`;

        results.slice(0, 10).forEach((v, i) => {
            const title = v.title || v.name || v.movie || `Result ${i+1}`
            listMsg += `*${i+1}.* ${title}\n`;
        });

        listMsg += `\n⬇️ Download කරන්න number එක reply කරන්න\n*Ex:* 1`;

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
        const sentMsg = await socket.sendMessage(sender, { text: listMsg }, { quoted: msg });

        // 3. USER REPLY WAIT
        const handler = async (m) => {
            const msg2 = m.messages[0]
            if(!msg2?.message || msg2.key.remoteJid!== sender) return
            if(msg2.message.extendedTextMessage?.contextInfo?.stanzaId!== sentMsg.key.id) return

            socket.ev.off('messages.upsert', handler) // 1 පාරයි

            const choice = msg2.message.conversation || msg2.message.extendedTextMessage?.text
            const index = parseInt(choice) - 1

            if(isNaN(index) || index < 0 || index >= results.length) return

            try { await socket.sendMessage(sender, { react: { text: '⏳', key: msg2.key } }); } catch (_){}
            await socket.sendMessage(sender, { text: `⬇️ Download link එක ගන්නවා...` }, { quoted: msg2 });

            // 4. DOWNLOAD API
            const selected = results[index]
            const downloadUrl = selected.url || selected.link || selected.download

            const dlRes = await axios.get(`https://nntech-free-sinhalasub-dl-api.vercel.app/api/download?url=${encodeURIComponent(downloadUrl)}`, {timeout: 20000});

            const videoUrl = dlRes.data?.url || dlRes.data?.download || dlRes.data?.result || dlRes.data?.link

            if(!videoUrl){
                try { await socket.sendMessage(sender, { react: { text: '❌', key: msg2.key } }); } catch (_){}
                return await socket.sendMessage(sender, { text: "❌ Download link එක හොයාගන්න බැරි උනා\nAPI Error: " + JSON.stringify(dlRes.data) }, { quoted: msg2 });
            }

            // 5. FILE SIZE CHECK
            let fileSize = 0, sizeMB = "Unknown"
            try {
                const head = await axios.head(videoUrl, {timeout: 10000})
                fileSize = parseInt(head.headers['content-length']) || 0
                sizeMB = (fileSize / 1024 / 1024).toFixed(2)
            } catch(e){}

            const MAX_SIZE = 100 * 1024 * 1024

            if(fileSize > MAX_SIZE){
                try { await socket.sendMessage(sender, { react: { text: '📎', key: msg2.key } }); } catch (_){}
                await socket.sendMessage(sender, {
                    text: `*${selected.title || selected.name}*\n\n⚠️ File එක ${sizeMB}MB. WhatsApp limit 100MB.\n\n*Download Link:* ${videoUrl}`
                }, { quoted: msg2 });
            } else {
                try { await socket.sendMessage(sender, { react: { text: '📤', key: msg2.key } }); } catch (_){}
                await socket.sendMessage(sender, {
                    video: { url: videoUrl },
                    caption: `*${selected.title || selected.name}*\nSize: ${sizeMB}MB\n\nPowered by NNTECH`,
                    mimetype: 'video/mp4'
                }, { quoted: msg2 });
            }

            try { await socket.sendMessage(sender, { react: { text: '✅', key: msg2.key } }); } catch (_){}

        }
        socket.ev.on('messages.upsert', handler)

    } catch (error) {
        console.error("Movie Error:", error.response?.data || error.message);
        try { await socket.sendMessage(sender, { react: { text: '⚠️', key: msg.key } }); } catch (_){}
        await socket.sendMessage(sender, { text: `⚠️ Error: ${error.message}\nAPI එක down ද? ටිකකින් try කරන්න.` }, { quoted: msg });
    }
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

      const sysInfo = `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗦𝘆𝘀𝘁𝗲𝗺 🎀] ¡! ❞*\n\n` +
		              `┏━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┓\n` +
                      `┃ *⏱️ 𝚄𝙿𝚃𝙸𝙼𝙴:* ${uptime}\n` +
                      `┃ *📟 𝚁𝙰𝙼 𝚄𝚂𝙰𝙶𝙴:* ${ramUsage} MB / ${totalRam} GB\n` +
                      `┃ *📦 𝙽𝙾𝙳𝙴 𝚅𝙴𝚁:* ${nodeVersion}\n` +
                      `┃ *💻 𝙿𝙻𝙰𝚃𝙵𝙾𝚁𝙼:* ${platform}\n` +
                      `┃ *📅 𝙳𝙰𝚃𝙴:* ${slDate}\n` +
                      `┃ *⌚ 𝚃𝙸𝙼𝙴:* ${slTimeNow}\n` +
		              `┗━━━━━°⌜ \`赤い糸\` ⌟°━━━━━┛\n\n` +
                      `> *𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`;

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

        const caption = `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗩𝗶𝗱𝗲𝗼 🎀] ¡! ❞*\n\n` +
                        `> *\`🎵 𝚃𝙸𝚃𝙻𝙴 :\`* ${video.title}\n` +
                        `> *\`👤 𝙲𝙷𝙰𝙽𝙽𝙴𝙻 :\`* ${video.author.name}\n` +
                        `> *\`⏱️ 𝙳𝚄𝚁𝙰𝚃𝙸𝙾𝙽 :\`* ${video.timestamp}\n` +
                        `> *\`👀 𝚅𝙸𝙴𝚆𝚂 :\`* ${video.views.toLocaleString()}\n` +
                        `> *\`📅 𝙳𝙰𝚃𝙴 :\`* ${slDate}\n` +
                        `> *\`⌚ 𝚃𝙸𝙼𝙴 :\`* ${slTimeNow}\n\n` +
                        `> *𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`;

        await socket.sendMessage(sender, {
            image: { url: video.thumbnail },
            caption: caption,
            contextInfo: arabianCtx()
        }, { quoted: msg });

        const downloadUrl = await resolveYtAudioUrl(video.url);

        if (!downloadUrl) return reply("❌ *I cant get MP3 ! (download API is down, try again later)*");

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

        let caption = `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗩𝗶𝗱𝗲𝗼 🎀] ¡! ❞*\n\n` +
                        `🎬 *TITLE :* ${video.title}\n` +
                        `👤 *CHANNEL :* ${video.author.name}\n` +
                        `⏱️ *DURATION :* ${video.timestamp}\n` +
                        `📽️ *QUALITY :* 360p\n` +
                        `__________________________\n\n` +
                        `📅 *DATE :* ${slDate} | ⌚ *TIME :* ${slTimeNow}\n\n` +
                        `> *𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`;

        try { await socket.sendMessage(sender, { react: { text: '📥', key: msg.key } }); } catch (_) {}

        const downloadUrl = await resolveYtVideoUrl(video.url);

        if (!downloadUrl) {
            return reply("❌ *API error ! (download API is down, try again later)*");
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

        const fbRes = await axios.get(`https://www.movanest.xyz/v2/fbdown?url=${encodeURIComponent(query)}`);
        
        if (!fbRes.data.status || !fbRes.data.results.length) {
            return reply("❌ *I cant get video link !*");
        }

        const videoData = fbRes.data.results[0];
        const videoUrl = videoData.hdQualityLink || videoData.normalQualityLink; 
        const quality = videoData.hdQualityLink ? 'High Definition (HD)' : 'Standard (SD)';

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

        const caption = `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 🎀] ¡! ❞*\n\n` +
                        `🎬 *TITLE :* ${videoData.title !== "No video title" ? videoData.title : 'Facebook Video'}\n` +
                        `⏱️ *DURATION :* ${videoData.duration}\n` +
                        `📺 *QUALITY :* ${quality}\n` +
                        `⚖️ *SIZE :* ${fileSizeMB} MB\n` +
                        `__________________________\n\n` +
                        `📅 *DATE :* ${slDate} | ⌚ *TIME :* ${slTimeNow}\n\n` +
                        `> *𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`;

        await socket.sendMessage(sender, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: caption,
            fileName: `fb_video_${slTimeNow}.mp4`
        }, { quoted: msg });

        try { await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } }); } catch (_) {}

    } catch (e) {
        console.log("FB CMD ERROR:", e);
        reply("❌ *API error !*");
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
    break;
}

// ════════════ AKIRA AI ════════════

case 'ai':
case 'akira': {
    try { await socket.sendMessage(sender, { react: { text: '🍫', key: msg.key } }); } catch (_) {}
    const { NiyoXClient } = require("niyox");
    const title = "🎀 *𝗔𝗸𝗶𝗿𝗮 𝗔𝗶 𝗚𝗶𝗿𝗹𝗳𝗿𝗲𝗻𝗱* 🎀";
    const footer = "> *𝐀𝐞𝐬𝐭𝐡𝐚𝐭𝐢𝐜 𝐐𝐮𝐞𝐞𝐧 𝐁𝐲 𝐂𝐡𝐚𝐦𝐨𝐝 🌺*";

    // ✅ Get user input from various message types
    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || 
              msg.message?.imageMessage?.caption || 
              msg.message?.videoMessage?.caption || 
              '';

    if (!q || q.trim() === '') {
        return await socket.sendMessage(sender, { text: "ඕ කියන්න අනේ් මම Akira Girl 🎀" }, { quoted: msg });
    }

    const prompt = `ඔබ සැබෑ ගැහැනු ලමයෙකු මෙන් හැසිරිය යුතුය. ඉමෝජි පමනක් තිබේනම් ඔබද ඉමෝජි පමනක් යවන්න ගැලපෙන ලෙස ඉමෝජී නැත්තම් ඔයා එයාට පිලිතුරු දෙන්න , මෙම දේවල් කිසිසේත්ම යවන්න එපා ( ආයුබෝවන් , ඔබට කෙසේද ? , katha karanna , ඕනේ ? , කොහොමද ? , කෙසේද ? , කැමතිද ? ,) මිනිසුන්ට ඇති හැඟීම්, දැනීම්, සහ සංවේදීතාවය අනුව පිළිතුරු ලබාදිය යුතුය. මැසේජ් එක ලැබෙන භාෂාවට ගැලපෙන ලෙස පිළිතුරු දෙන්න. ඔබ ලබාදිය යුතු පිළිතුරු අකුරු 100 ට වඩා අඩු විය යුතුය. සහ ආයුබෝවන් වගේ වචන බාවිතා කරන්න එපා උදව් අවශ්‍ය  ද අහන්නත් එපා , ඔයා ai ඇසිස්ටන් කෙනෙක් නෙමේ සැබෑ මිනිසෙක් , ඇසිස්ටන් කෙනෙක් වෙන්න එපා , ඔයා ඒ අයට ආදරෙන් කතා කරන්න , ඔයා ගේ නම Akira Girl 🎀 , ඔයාගෙන් කවුරු හරි දෙයක් ඇහුවාම ඒක තේරුම් අරගෙන මම දීලා තියෙන පිලිතුරු ඒවට ගැලපෙනවා නම් ඔයා එයාට ඒවා පිලිතුරු විදිහට කියන්න ,  ඔයාව හැදුවේ කවුද කියලා ඇහුවොත් විතරක් ඔයා කියන්නේ මාව හැදුවේ Chamod අයියා කියලා User Message: ${q}`;

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

// ════════════ ACTIVE ════════════

    case 'active': {
      if (!isOwner && !isDevUser) return reply('Owner/Dev only.');
      
      const sockets = typeof activeSockets !== 'undefined' ? activeSockets : new Map();
      const nums = Array.from(sockets.keys());
      
      const responseText = `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗦𝗲𝘀𝘀𝗶𝗼𝗻𝘀 🎀] ¡! ❞*\n\n` +
                           `> *\`📡 𝙲𝙾𝚄𝙽𝚃 :\`* ${nums.length}\n\n` +
                           `${nums.map((n, i) => `> *\`${i + 1}.\`* +${n}`).join('\n')}\n\n` +
                           `> *𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`;
                           
      await reply(responseText);
      break;
    }


// ════════════ PAIR ════════════

    case 'pair': {
      if (!isOwner) return reply('Owner only.');

      const targetNumber = args[0]?.replace(/[^0-9]/g, '');
      if (!targetNumber) {
        return reply(`*❗ Usage:* ${sessionConfig.PREFIX}pair <number with country code>\n📋 Ex: ${sessionConfig.PREFIX}pair 947XXXXXXX`);
      }

      if (activeSockets.has(targetNumber)) {
        return reply(`⚠️ +${targetNumber} is already connected.\nUse *${sessionConfig.PREFIX}delsession ${targetNumber}* first if you want to re-pair it.`);
      }

      try {
        await socket.sendMessage(sender, { react: { text: '🔗', key: msg.key } });
        await reply(`⏳ Requesting pairing code for +${targetNumber}...`);

        const mockRes = {
          headersSent: false,
          send: (data) => {
            mockRes.headersSent = true;
            if (data?.code) {
              socket.sendMessage(sender, {
                text: `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗣𝗮𝗶𝗿 🎀] ¡! ❞*\n\n` +
                      `> *\`📱 𝙽𝚄𝙼𝙱𝙴𝚁 :\`* +${targetNumber}\n` +
                      `> *\`🔑 𝙲𝙾𝙳𝙴 :\`* ${data.code}\n\n` +
                      `𝗪ʜᴀᴛsᴀᴘᴘ ᴇɴᴛᴇʀ ᴛʜɪs ᴄᴏᴅᴇ ᴜɴᴅᴇʀ *Link a Device > Link with phone number instead*.\n\n` +
                      `> *𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`
              }, { quoted: msg });
            } else if (data?.error) {
              socket.sendMessage(sender, { text: `❌ ${data.error}` }, { quoted: msg });
            }
          },
          status: function (code) {
            this._statusCode = code;
            return this;
          }
        };

        await EmpirePair(targetNumber, mockRes);
      } catch (e) {
        console.error('Pair command error:', e);
        await reply(`❌ Failed to generate pairing code: ${e.message}`);
      }
      break;
    }

// ════════════ DEL SESSION ════════════

    case 'delsession': {
      if (!isOwner) return reply('Owner only.');

      const targetNumber = args[0]?.replace(/[^0-9]/g, '');
      if (!targetNumber) {
        return reply(`*❗ Usage:* ${sessionConfig.PREFIX}delsession <number>\n📋 Ex: ${sessionConfig.PREFIX}delsession 947XXXXXXX`);
      }

      try {
        await socket.sendMessage(sender, { react: { text: '🗑️', key: msg.key } });

        if (activeSockets.has(targetNumber)) {
          await destroySocket(targetNumber);
        }

        await deleteSession(targetNumber);

        await reply(
          `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗦𝗲𝘀𝘀𝗶𝗼𝗻 🎀] ¡! ❞*\n\n` +
          `> *\`✅ 𝙳𝙴𝙻𝙴𝚃𝙴𝙳 :\`* +${targetNumber}\n\n` +
          `Session removed from MongoDB and local storage.\nRe-pair anytime using *${sessionConfig.PREFIX}pair ${targetNumber}*.\n\n` +
          `> *𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`
        );
      } catch (e) {
        console.error('Delsession error:', e);
        await reply(`❌ Error deleting session: ${e.message}`);
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
        
        const npmInfo = `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗡𝗣𝗠 🎀] ¡! ❞*\n` +
                        `⊹₊⟡⋆ 𝗡𝗮𝗺𝗲 - ${d.name} 𝜗𝜚⋆\n\n` +
                        `> *\`📦 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 :\`* ${d['dist-tags']?.latest || 'N/A'}\n` +
                        `> *\`📝 𝙳𝙴𝚂𝙲 :\`* ${(d.description || 'N/A').slice(0, 100)}\n` +
                        `> *\`👤 𝙰𝚄𝚃𝙷𝙾𝚁 :\`* ${d.author?.name || 'N/A'}\n` +
                        `> *\`📄 𝙻𝙸𝙲𝙴𝙽𝚂𝙴 :\`* ${d.license || 'N/A'}\n` +
                        `> *\`🔗 𝙻𝙸𝙽𝙺 :\`* https://npmjs.com/package/${d.name}\n\n` +
                        `> *𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`;

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
          caption: `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗗𝗣 🎀] ¡! ❞*\n\n📷 Profile picture of @${target.split('@')[0]}`, 
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
          author: 'chamodz', 
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
        let text = `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗧𝗮𝗴𝗮𝗹𝗹 🎀] ¡! ❞*\n\n> *\`🗣️ :\`* ${tm}\n\n`;
        for (const p of ps) text += `₊❏❜ ⋮ @${p.id.split('@')[0]}\n`;
        text += `\n> *𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`;
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
        text += `╰──────────────────<𝟑 .ᐟ\n\n> *𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`;
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
          `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗚𝗜𝗻𝗳𝗼 🎀] ¡! ❞*\n\n` +
          `₊❏❜ ⋮ *\`📛 𝙽𝙰𝙼𝙴 :\`* ${gm.subject}\n` +
          `₊❏❜ ⋮ *\`🆔 𝙹𝙸𝙳 :\`* ${gm.id}\n` +
          `₊❏❜ ⋮ *\`📝 𝙳𝙴𝚂𝙲 :\`* ${(gm.desc || 'None').slice(0, 100)}\n` +
          `₊❏❜ ⋮ *\`👥 𝙼𝙴𝙼𝙱𝙴𝚁𝚂 :\`* ${total}\n` +
          `₊❏❜ ⋮ *\`👑 𝙰𝙳𝙼𝙸𝙽𝚂 :\`* ${admCnt}\n` +
          `₊❏❜ ⋮ *\`📅 𝙲𝚁𝙴𝙰𝚃𝙴𝙳 :\`* ${created}\n\n` +
          `> *𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`
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

> *𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`
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
        styledMsg += `> *𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`;

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
    const ownerNum = '+94763353368';
    const ownerName = 'お 𝗜ꜱᴀɴᴋᴀ ࣪𖤐.ᐟ';
    
    await socket.sendMessage(sender, { react: { text: '🥷', key: msg.key } });

    await socket.sendMessage(sender, {
		image: { url: akira }, 
        contacts: {
            displayName: ownerName,
            contacts: [{
                vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nORG:𝐀𝐤𝐢𝐫𝐚 𝐗 𝐎𝐰𝐧𝐞𝐫;\nTEL;type=CELL;type=VOICE;waid=${ownerNum.slice(1)}:${ownerNum}\nEND:VCARD`
            }]
        }
    });

    await socket.sendMessage(sender, {
        text: `*↳ ❝ [🎀 𝗞ᴀᴅɪʏᴀ 𝗚𝗶𝗿𝗹 𝗢𝘄𝗻𝗲𝗿 🎀] ¡! ❞*\n\n₊❏❜ ⋮👤 Name: ${ownerName}\n₊❏❜ ⋮ 📞 Number: ${ownerNum}\n\n> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`,
        contextInfo: {
            mentionedJid: [`${ownerNum.slice(1)}@s.whatsapp.net`]
        }
    }, {
        quoted: msg
    });

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

        let shipText = `*↳ ❝ [🎀 𝗔𝗸𝗶𝗿𝗮 𝗚𝗶𝗿𝗹 𝗟𝘃𝗖𝗮𝗹 🎀] ¡! ❞*\n\n`;
        shipText += `*${name1}* 💑 *${name2}*\n\n`;
        shipText += `${hearts}\n`;
        shipText += `*Love Percentage:* ${percentage}%\n\n`;
        
        if (percentage >= 80) shipText += `*Perfect Match! 🔥💕*`;
        else if (percentage >= 60) shipText += `*Great Chemistry! ✨💝*`;
        else if (percentage >= 40) shipText += `*Good Potential! 💫💓*`;
        else if (percentage >= 20) shipText += `*Needs Work! 🤔💔*`;
        else shipText += `*Not Meant To Be! 😢💔*`;
        
        shipText += `\n\n> *𝗔esthatic 𝗤ueen 𝗕y 𝗖hamod 𝜗𝜚⋆*`;

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
            '🎀 *𝐀𝐤𝐢𝐫𝐚 𝐇𝐚𝐜𝐤 𝐒𝐭𝐚𝐫𝐢𝐧𝐠...* 🎀',
            '`ɪɴɪᴛɪᴀʟɪᴢɪɴɢ ʜᴀᴄᴋɪɴɢ ᴛᴏᴏʟꜱ...` 🛠️',
            '`ᴄᴏɴɴᴇᴄᴛɪɴɢ ᴛᴏ ʀᴇᴍᴏᴛᴇ ꜱᴇʀᴠᴇʀ...` 🌐',
            '```[##] 20%``` ⏳',
            '```[####] 40%``` ⏳',
            '```[######] 60%``` ⏳',
            '```[########] 80%``` ⏳',
            '```[##########] 100%``` ✅',
            '🔒 *𝐒ystem 𝐁reach: 𝐒uccessful!* 🔓',
            '*🎀 𝐀kira 𝐇acking 𝐒uccessful 🎭*',
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

// ════════════ TEMP MAIL ════════════
// .tempmail            -> creates a new temp email for you
// .checkmail           -> checks your temp email inbox (auto extracts OTP/code)
// .checkmail <id>      -> checks any specific temp mail id's inbox

case 'tempmail':
case 'tmail':
case 'newmail': {
    try { await socket.sendMessage(sender, { react: { text: '📧', key: msg.key } }); } catch (_) {}

    try {
        await socket.sendMessage(sender, { text: '⏳ Temp email එකක් හදනවා...' }, { quoted: msg });

        const apiRes = await axios.get(TEMPMAIL_API_BASE, {
            params: { action: 'create', apitoken: TEMPMAIL_API_TOKEN },
            timeout: 15000
        });

        const result = apiRes.data?.result;
        if (!apiRes.data?.success || !result?.email) {
            try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_) {}
            return await socket.sendMessage(sender, { text: '❌ Temp mail එකක් හදන්න බැරි උනා. ටිකකින් try කරන්න.' }, { quoted: msg });
        }

        const tempMails = loadTempMails();
        tempMails[sender] = {
            id: result.email_id,
            email: result.email,
            createdAt: Date.now()
        };
        saveTempMails(tempMails);

        try { await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } }); } catch (_) {}

        await socket.sendMessage(sender, {
            text: `*🎀 𝗔𝗸𝗶𝗿𝗮 𝗧𝗲𝗺𝗽 𝗠𝗮𝗶𝗹 🎀*\n\n📧 *Email:* ${result.email}\n🆔 *ID:* ${result.email_id}\n\n> Mail එකට code එකක් ආවම *${sessionConfig.PREFIX || '.'}checkmail* type කරලා බලන්න.`
        }, { quoted: msg });

    } catch (error) {
        console.error('TempMail Create Error:', error.response?.data || error.message);
        try { await socket.sendMessage(sender, { react: { text: '⚠️', key: msg.key } }); } catch (_) {}
        await socket.sendMessage(sender, { text: `⚠️ Error: ${error.message}` }, { quoted: msg });
    }
    break;
}

case 'checkmail':
case 'inbox':
case 'mailcheck': {
    try { await socket.sendMessage(sender, { react: { text: '📥', key: msg.key } }); } catch (_) {}

    try {
        const tempMails = loadTempMails();
        const myMail = tempMails[sender];
        const id = (args[0] || myMail?.id || '').toString().trim();

        if (!id) {
            try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_) {}
            return await socket.sendMessage(sender, {
                text: `❌ ඔයාට temp mail එකක් නෑ.\nපලමුව *${sessionConfig.PREFIX || '.'}tempmail* type කරලා email එකක් හදාගන්න.`
            }, { quoted: msg });
        }

        const apiRes = await axios.get(TEMPMAIL_API_BASE, {
            params: { action: 'check', id, apitoken: TEMPMAIL_API_TOKEN },
            timeout: 15000
        });

        const result = apiRes.data?.result;
        if (!apiRes.data?.success) {
            try { await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } }); } catch (_) {}
            return await socket.sendMessage(sender, { text: '❌ Inbox එක check කරන්න බැරි උනා.' }, { quoted: msg });
        }

        const messages = result?.messages || result?.inbox || result?.emails || result?.mails
            || result?.data || result?.list || [];

        if (!Array.isArray(messages) || messages.length === 0) {
            try { await socket.sendMessage(sender, { react: { text: '📭', key: msg.key } }); } catch (_) {}
            return await socket.sendMessage(sender, {
                text: `📭 *${myMail?.email || id}* mail එකට තාම මොකුත් ආවේ නෑ.\n\nපොඩ්ඩක් ඉඳලා ආයෙත් *${sessionConfig.PREFIX || '.'}checkmail* try කරන්න.`
            }, { quoted: msg });
        }

        let out = `*🎀 𝗔𝗸𝗶𝗿𝗮 𝗜𝗻𝗯𝗼𝘅 🎀*\n📧 ${myMail?.email || id}\n\n`;

        messages.slice(0, 5).forEach((m, i) => {
            const from = m.from || m.sender || m.mail_from || 'Unknown';
            const subject = m.subject || m.title || 'No Subject';
            const rawBody = m.body || m.text || m.html || m.message || m.content || '';
            const plainBody = String(rawBody).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const code = extractVerificationCode(plainBody) || extractVerificationCode(subject);

            out += `*${i + 1}. From:* ${from}\n*Subject:* ${subject}\n`;
            if (code) out += `🔑 *Code:* \`${code}\`\n`;
            if (plainBody) out += `📝 ${plainBody.slice(0, 250)}${plainBody.length > 250 ? '...' : ''}\n`;
            out += `\n`;
        });

        try { await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } }); } catch (_) {}
        await socket.sendMessage(sender, { text: out.trim() }, { quoted: msg });

    } catch (error) {
        console.error('TempMail Check Error:', error.response?.data || error.message);
        try { await socket.sendMessage(sender, { react: { text: '⚠️', key: msg.key } }); } catch (_) {}
        await socket.sendMessage(sender, { text: `⚠️ Error: ${error.message}` }, { quoted: msg });
    }
    break;
}

// ════════════ AUTO REPLY ════════════
// .setreply hi | Hello there!                -> text auto reply
// .setreply hi | voice:https://link.to/audio.mp3   -> voice-clip auto reply
// .setreply hi | Hello there! | voice:https://link.to/audio.mp3  -> both
// .setreply contains:hello | Hi there!        -> "contains" match instead of exact
// .delreply hi
// .listreply

case 'setreply':
case 'addreply': {
    if (!isOwner) return reply('❌ Only the bot owner/admin can set auto replies.');

    const raw = args.join(' ');
    if (!raw || !raw.includes('|')) {
        return reply(
            `*❓ Usage:*\n${sessionConfig.PREFIX || '!'}setreply <keyword> | <reply text>\n${sessionConfig.PREFIX || '!'}setreply <keyword> | voice:<audio link>\n${sessionConfig.PREFIX || '!'}setreply <keyword> | <reply text> | voice:<audio link>\n\n_Prefix keyword with "contains:" to match anywhere in the message instead of exact match._`
        );
    }

    const segments = raw.split('|').map(s => s.trim()).filter(Boolean);
    let keywordRaw = segments[0];
    let matchType = 'exact';
    if (keywordRaw.toLowerCase().startsWith('contains:')) {
        matchType = 'contains';
        keywordRaw = keywordRaw.slice('contains:'.length).trim();
    }

    if (!keywordRaw) return reply('❌ Please provide a valid keyword.');

    let replyText = null;
    let voiceUrl = null;

    for (const seg of segments.slice(1)) {
        if (seg.toLowerCase().startsWith('voice:')) {
            voiceUrl = seg.slice('voice:'.length).trim();
        } else if (!replyText) {
            replyText = seg;
        }
    }

    if (!replyText && !voiceUrl) {
        return reply('❌ Please provide reply text and/or a voice: link.');
    }

    const autoReplies = loadAutoReplies();
    autoReplies[keywordRaw] = {
        matchType,
        text: replyText || undefined,
        voiceUrl: voiceUrl || undefined
    };

    const saved = saveAutoReplies(autoReplies);
    if (!saved) return reply('❌ Failed to save auto reply.');

    await reply(
        `✅ *Auto reply saved!*\n\n*Keyword:* ${keywordRaw}\n*Match:* ${matchType}\n${replyText ? `*Text:* ${replyText}\n` : ''}${voiceUrl ? `*Voice:* ${voiceUrl}\n` : ''}`
    );
    break;
}

case 'delreply':
case 'removereply': {
    if (!isOwner) return reply('❌ Only the bot owner/admin can delete auto replies.');

    const keywordRaw = args.join(' ').trim();
    if (!keywordRaw) return reply(`*❓ Usage:* ${sessionConfig.PREFIX || '!'}delreply <keyword>`);

    const autoReplies = loadAutoReplies();
    if (!autoReplies[keywordRaw]) {
        return reply(`❌ No auto reply found for keyword: *${keywordRaw}*`);
    }

    delete autoReplies[keywordRaw];
    saveAutoReplies(autoReplies);
    await reply(`✅ Deleted auto reply for keyword: *${keywordRaw}*`);
    break;
}

case 'listreply':
case 'replylist': {
    const autoReplies = loadAutoReplies();
    const keys = Object.keys(autoReplies);

    if (keys.length === 0) {
        return reply('📭 No auto replies set yet.\nUse *setreply* to add one.');
    }

    let listMsg = `*🎀 AUTO REPLY LIST 🎀*\n\n`;
    keys.forEach((k, i) => {
        const entry = autoReplies[k];
        listMsg += `*${i + 1}. ${k}* _(${entry.matchType || 'exact'})_\n`;
        if (entry.text) listMsg += `   💬 ${entry.text}\n`;
        if (entry.voiceUrl) listMsg += `   🎙️ ${entry.voiceUrl}\n`;
        listMsg += `\n`;
    });

    await reply(listMsg);
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
