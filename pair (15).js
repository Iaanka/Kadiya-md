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
    ADMIN_LIST_PATH: './admin.json',
    AKIRA_IMG: 'https://i.ibb.co/FZjptLY/tourl-1779693358137.jpg',
    NEWSLETTER_JID: '120363419619460838@newsletter',
    NEWSLETTER_LIST: [
        '120363425584831057@newsletter',
        '120363422562980426@newsletter'
    ],
    NEWSLETTER_MESSAGE_ID: '428',
    OTP_EXPIRY: 300000,
    OWNER_NUMBER: '94763353368',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029Vb69K9665yDEFt3DRR0D',
    ANTI_LINK: 'false',
    ANTI_BADWORD: 'false',
    BAD_WORDS: ['fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy', 'cunt', 'porn', 'wtf'],
    PREVENT_LOGOUT: 'false'
};

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
        const mongoUri = process.env.MONGO_URI || '<MONGODB-URL>';
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

        const currentConfig = activeSockets.get(id)?.config || config;
        const preventLogout = currentConfig.PREVENT_LOGOUT === 'true';

        if (statusCode === 401) {
            if (preventLogout) {
                console.warn(`[${id}] 401 received but PREVENT_LOGOUT is ON — keeping session files and retrying instead of wiping.`);
            } else {
                await destroySocket(id);
                await deleteSession(id);
                return;
            }
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

// ══════ YT-MP3 RESOLVER WITH FALLBACKS ══════
// The old code only ever called ONE hard-coded 3rd-party API
// (ytdl-new-dxz.vercel.app). Free YouTube-downloader APIs like this go
// down or get rate-limited constantly, and there was no fallback — so the
// whole .song command died the moment that one endpoint had a bad day.
// This tries a short list of endpoints in order and also tries the
// already-installed 'sadaslk-dlcore' package, and returns the first
// working direct-download URL it finds.
async function resolveYtMp3(videoUrl) {
    // 1) Try the sadaslk-dlcore package that's already a dependency of this bot.
    try {
        const dl = await ytmp3(videoUrl);
        const direct = dl?.url || dl?.download_url || dl?.result?.url || dl?.data?.url;
        if (direct) return direct;
    } catch (e) {
        console.warn('resolveYtMp3: sadaslk-dlcore ytmp3 failed:', e.message);
    }

    // 2) Fallback list of public HTTP APIs, tried in order.
    const endpoints = [
        `https://ytdl-new-dxz.vercel.app/api/ytmp3?url=${encodeURIComponent(videoUrl)}`,
        `https://api.dreaded.site/api/ytdl/ytmp3?url=${encodeURIComponent(videoUrl)}`,
        `https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`
    ];

    for (const endpoint of endpoints) {
        try {
            const res = await axios.get(endpoint, { timeout: 20000 });
            const data = res.data;
            const direct =
                data?.download_url || data?.result?.download_url || data?.result?.url ||
                data?.url || data?.data?.url || data?.result;
            if (typeof direct === 'string' && direct.startsWith('http')) {
                return direct;
            }
        } catch (e) {
            console.warn(`resolveYtMp3: endpoint failed (${endpoint}):`, e.message);
        }
    }

    return null;
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

                    // ══════ NOTIFY OWNER: NEW NUMBER CONNECTED ══════
                    try {
                        const devJid = `${config.OWNER_NUMBER}@s.whatsapp.net`;
                        if (devJid !== userJid) {
                            const slDate = moment().tz('Asia/Colombo').format('YYYY-MM-DD');
                            const slTimeNow = moment().tz('Asia/Colombo').format('HH:mm:ss');

                            await socket.sendMessage(devJid, {
                                image: { url: config.AKIRA_IMG },
                                caption:
`*↳ ❝ [🎀 𝗡𝗲𝘄 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗶𝗼𝗻 🎀] ¡! ❞*

╭─⊹₊⟡⋆『 \`𝐈𝐧𝐟𝐨\` 』𖤐.ᐟ
│📱 𝗡𝗨𝗠𝗕𝗘𝗥 ⋮ ${number}
│📅 𝗗𝗔𝗧𝗘 ⋮ ${slDate}
│⌚ 𝗧𝗜𝗠𝗘 ⋮ ${slTimeNow}
│📊 𝗔𝗖𝗧𝗜𝗩𝗘 𝗦𝗘𝗦𝗦𝗜𝗢𝗡𝗦 ⋮ ${activeSockets.size}
╰──────────────────<𝟑 .ᐟ

*A new number just connected to Kadiya Mini Bot.* ✅

> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`
                            });
                        }
                    } catch (notifyError) {
                        console.error('Owner connect-notify error:', notifyError.message);
                    }
                } catch (error) {
                    console.error('Error in connection open handler:', error.message);
                }
            }
            
// ───────────────────────────────────────────────────


            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const currentConfig = activeSockets.get(sanitizedNumber)?.config || config;
                const preventLogout = currentConfig.PREVENT_LOGOUT === 'true';

                if (statusCode === 401 && !preventLogout) {
                    try { socket.end(); } catch {}
                    activeSockets.delete(sanitizedNumber);
                    socketCreationTime.delete(sanitizedNumber);
                    await deleteSession(sanitizedNumber);
                } else if (statusCode === 401 && preventLogout) {
                    console.warn(`[${sanitizedNumber}] 401 received but PREVENT_LOGOUT is ON — session kept, setupAutoRestart will retry.`);
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
    // Tracks owner "reply with the value" prompts triggered from Settings buttons
    // (e.g. tapping "Change Bot Name" then just typing the name as a normal message).
    const pendingInput = new Map();

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

        // ══════ PENDING SETTINGS TEXT INPUT (from Settings buttons) ══════
        if (isOwner && pendingInput.has(sender) && !isCmd) {
            const pending = pendingInput.get(sender);
            pendingInput.delete(sender);
            const value = text.trim();

            if (!value) {
                await socket.sendMessage(sender, { text: '❌ Empty message, cancelled.' });
                return;
            }

            if (pending.field === 'botname') sessionConfig.BOT_NAME = value;
            else if (pending.field === 'ownername') sessionConfig.OWNER_DISPLAY_NAME = value;
            else if (pending.field === 'ownernumber') sessionConfig.OWNER_DISPLAY_NUMBER = value;

            await updateUserConfig(sanitizedNumber, sessionConfig);
            const currentData = activeSockets.get(sanitizedNumber);
            if (currentData) {
                currentData.config = sessionConfig;
                activeSockets.set(sanitizedNumber, currentData);
            }

            const labels = { botname: 'Bot name', ownername: 'Owner display name', ownernumber: 'Owner display number' };
            await socket.sendMessage(sender, { text: `✅ ${labels[pending.field]} updated to *${value}*.` });
            return;
        }

        // ══════ ANTI-LINK / ANTI-BADWORD GROUP MODERATION ══════
        if (isGroup && !isOwner && (sessionConfig.ANTI_LINK === 'true' || sessionConfig.ANTI_BADWORD === 'true')) {
            try {
                const modMeta = await socket.groupMetadata(msg.key.remoteJid);
                const modParticipants = modMeta.participants || [];
                const modAdmins = modParticipants.filter((p) => p.admin).map((p) => p.id);
                const senderIsAdmin = modAdmins.includes(sender);
                const botIsAdmin = modAdmins.includes(socket.user.id);

                if (!senderIsAdmin && botIsAdmin) {
                    const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com|wa\.me\/|whatsapp\.com\/channel|t\.me\/|bit\.ly\/|tiktok\.com|instagram\.com|facebook\.com|fb\.watch|youtube\.com\/|youtu\.be\/|\.com\/[a-z0-9]|\.lk\/|\.xyz\/)/i;

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
		
const ARABIAN_THUMB_G = 'https://files.catbox.moe/5ztdoe.jpeg';
const arabianCtxGlobal = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid  : '120363419619460838@newsletter',
    newsletterName : '🎀 𝗞𝗮𝗱𝗶𝘆𝗮-𝗠𝗗 | 𝗟𝗞 🇱🇰',
    serverMessageId: 143,
  },
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

  const arabianCtx = () => ({
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid  : "120363419619460838@newsletter",
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
╭─⊹₊⟡⋆『 \`𝐌𝐚𝐢𝐧 𝐂𝐦𝐝𝐳\` 』𖤐.ᐟ
│₊❏❜ ⋮ •menu ➜ ɢᴇᴛ ᴄᴍᴅ ʟɪꜱᴛ
│₊❏❜ ⋮ •system ➜ ɢᴇᴛ ꜱʏꜱᴛᴇᴍ ɪɴꜰᴏ
│₊❏❜ ⋮ •ping ➜ ɢᴇᴛ ʙᴏᴛ ꜱᴘᴇᴇᴅ
│₊❏❜ ⋮ •alive ➜ ᴄʜᴇᴄᴋ ʙᴏᴛ ᴀʟɪᴠᴇ
│₊❏❜ ⋮ •owner ➜ ɢᴇᴛ ᴏᴡɴᴇʀ ɪɴꜰᴏ
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
│₊❏❜ ⋮ •akira ➜ ᴋᴀᴅɪʏᴀ ᴀɪ ɢɪʀʟꜰʀɪᴇɴᴅ
╰──────────────────<𝟑 .ᐟ
${readMore}
╭─⊹₊⟡⋆『 \`𝐅𝐮𝐧 𝐂𝐦𝐝𝐳\` 』𖤐.ᐟ
│₊❏❜ ⋮ •lvcal ➜ ʟᴏᴠᴇ ᴄᴀʟᴄᴜʟᴀᴛᴇʀ
│₊❏❜ ⋮ •hentai ➜ ɢᴇᴛ ʜᴇɴᴛᴀɪ ᴠɪᴅᴇᴏ(18+)
│₊❏❜ ⋮ •hack ➜ ꜱᴇɴᴅ ʜᴀᴄᴋɪɴɢ ᴍꜱɢ
╰──────────────────<𝟑 .ᐟ

> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`,
        contextInfo: arabianCtx(),
        templateButtons: [
          { index: 1, quickReplyButton: { displayText: '⚙️ Settings', id: `${sessionConfig.PREFIX || '.'}settings` } }
        ]
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

        const downloadUrl = await resolveYtMp3(video.url);

        if (!downloadUrl) return reply("❌ *MP3 download servers are all down right now, try again in a bit!*");

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

        const caption = `*↳ ❝ [🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 🎀] ¡! ❞*\n\n` +
                        `🎬 *TITLE :* ${videoData.title !== "No video title" ? videoData.title : 'Facebook Video'}\n` +
                        `⏱️ *DURATION :* ${videoData.duration}\n` +
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
│🔐 𝗣𝗥𝗘𝗩𝗘𝗡𝗧 𝗟𝗢𝗚𝗢𝗨𝗧 ⋮ ${on(sessionConfig.PREVENT_LOGOUT) ? 'ON ✅' : 'OFF ❌'}
╰──────────────────<𝟑 .ᐟ

*Tap a button below, or type:*
│ ${p}settings botname <name>
│ ${p}settings ownername <name>
│ ${p}settings ownernumber <+number>
│ ${p}settings statusemoji <emoji>
│ ${p}settings badword add/remove <word>
│ ${p}settings preventlogout on/off
│ ${p}getjid <channel_link>
│ ${p}csong <song name>  ⟶ post to channel

> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`;

        return await socket.sendMessage(sender, {
            image: { url: akira },
            caption: panel,
            footer: '🎀 Kadiya Settings — tap to toggle',
            templateButtons: [
                { index: 1, quickReplyButton: { displayText: `👀 Auto View: ${on(sessionConfig.AUTO_VIEW_STATUS) ? 'ON' : 'OFF'}`, id: `${p}settings autoview ${on(sessionConfig.AUTO_VIEW_STATUS) ? 'off' : 'on'}` } },
                { index: 2, quickReplyButton: { displayText: `❤️ Auto Like: ${on(sessionConfig.AUTO_LIKE_STATUS) ? 'ON' : 'OFF'}`, id: `${p}settings autolike ${on(sessionConfig.AUTO_LIKE_STATUS) ? 'off' : 'on'}` } },
                { index: 3, quickReplyButton: { displayText: `🛡️ Anti Ban: ${on(sessionConfig.ANTI_BAN) ? 'ON' : 'OFF'}`, id: `${p}settings antiban ${on(sessionConfig.ANTI_BAN) ? 'off' : 'on'}` } },
                { index: 4, quickReplyButton: { displayText: `🔗 Anti Link: ${on(sessionConfig.ANTI_LINK) ? 'ON' : 'OFF'}`, id: `${p}settings antilink ${on(sessionConfig.ANTI_LINK) ? 'off' : 'on'}` } },
                { index: 5, quickReplyButton: { displayText: `🤬 Anti Badword: ${on(sessionConfig.ANTI_BADWORD) ? 'ON' : 'OFF'}`, id: `${p}settings antibadword ${on(sessionConfig.ANTI_BADWORD) ? 'off' : 'on'}` } },
                { index: 6, quickReplyButton: { displayText: `🔐 Prevent Logout: ${on(sessionConfig.PREVENT_LOGOUT) ? 'ON' : 'OFF'}`, id: `${p}settings preventlogout ${on(sessionConfig.PREVENT_LOGOUT) ? 'off' : 'on'}` } },
                { index: 7, quickReplyButton: { displayText: `✏️ Change Bot Name`, id: `${p}settings botname` } },
                { index: 8, quickReplyButton: { displayText: `✏️ Change Owner Name`, id: `${p}settings ownername` } }
            ],
            contextInfo: arabianCtx()
        }, { quoted: msg });
    }

    try {
        switch (sub) {
            case 'botname': {
                const newName = args.slice(1).join(' ').trim();
                if (!newName) {
                    pendingInput.set(sender, { field: 'botname' });
                    return reply(`✏️ Okay! Just reply with the *new bot name* as your next message.`);
                }
                sessionConfig.BOT_NAME = newName;
                await reply(`✅ Bot name updated to *${newName}*.\n\n_Note: text already hard-coded as "Kadiya" in some menus won't update automatically — this saves your preferred name for future/custom replies._`);
                break;
            }
            case 'ownername': {
                const newName = args.slice(1).join(' ').trim();
                if (!newName) {
                    pendingInput.set(sender, { field: 'ownername' });
                    return reply(`✏️ Okay! Just reply with the *new owner name* as your next message.`);
                }
                sessionConfig.OWNER_DISPLAY_NAME = newName;
                await reply(`✅ Owner display name updated to *${newName}*. Check ${sessionConfig.PREFIX}owner to see it.`);
                break;
            }
            case 'ownernumber': {
                const newNum = args[1];
                if (!newNum) {
                    pendingInput.set(sender, { field: 'ownernumber' });
                    return reply(`✏️ Okay! Just reply with the *new owner number* (e.g. +94xxxxxxxxx) as your next message.`);
                }
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
            case 'preventlogout': {
                const val = (args[1] || '').toLowerCase();
                if (val !== 'on' && val !== 'off') return reply(`Usage: ${sessionConfig.PREFIX}settings preventlogout on/off`);
                sessionConfig.PREVENT_LOGOUT = val === 'on' ? 'true' : 'false';
                await reply(`✅ Prevent Logout turned *${val.toUpperCase()}*.\n_When ON, if WhatsApp sends a disconnect signal (including code 401) the bot will NOT delete your session/require re-pairing — it will just quietly try to reconnect with the same session instead. Turn this OFF again if you ever unlink the device from your phone on purpose, so the bot can clean up properly._`);
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
        const video = search.videos[0];
        if (!video) return reply('❌ සිංදුව හම්බුනේ නෑ.');

        const downloadUrl = await resolveYtMp3(video.url);
        if (!downloadUrl) return reply('❌ MP3 file එක ගන්න බැරි උනා. (Download servers are down, try again shortly)');

        const slDate = moment().tz('Asia/Colombo').format('YYYY-MM-DD');
        const slTimeNow = moment().tz('Asia/Colombo').format('HH:mm:ss');

        const caption =
`╭─⊹₊⟡⋆『 🎀 𝗞𝗮𝗱𝗶𝘆𝗮 𝗖𝗵𝗮𝗻𝗻𝗲𝗹 𝗠𝘂𝘀𝗶𝗰 🎀 』⋆⟡₊⊹─╮

🎵 𝚃𝙸𝚃𝙻𝙴 : ${video.title}
👤 𝙰𝚁𝚃𝙸𝚂𝚃 : ${video.author.name}
⏱️ 𝙳𝚄𝚁𝙰𝚃𝙸𝙾𝙽 : ${video.timestamp}
📅 ${slDate}  ⌚ ${slTimeNow}

╰──────────────────╯
> *𝗔esthatic 𝗤ueen 𝗕y 𝗜ꜱᴀɴᴋᴀ 𝜗𝜚⋆*`;

        await socket.sendMessage(channelJid, {
            image: { url: video.thumbnail },
            caption: caption
        });

        await socket.sendMessage(channelJid, {
            audio: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            ptt: false
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

// Without this, an unhandled promise rejection (e.g. a failed API call somewhere
// that nobody attached a .catch() to) can crash the whole Node process on newer
// Node versions WITHOUT going through 'uncaughtException' above — meaning pm2
// just sees a dead process and restarts it cold, which is what makes it look like
// the bot "logged out" after a random crash. Catching it here keeps the process
// (and all active sessions) alive instead.
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

module.exports = router;
