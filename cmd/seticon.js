/*
  Auto-extracted from pair.js switch-case during cmd/ refactor.
  Exposes: seticon
*/

module.exports = {
  name: 'seticon',
  aliases: [],
  execute: async (ctx) => {
    const { socket, msg, isGroup, reply, downloadQuotedMedia } = ctx;
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
  }
};
