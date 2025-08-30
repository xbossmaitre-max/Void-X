 module.exports = {
 config: {
 name: "respect",
 aliases: [],
 version: "1.0",
 author: "AceGun x Samir Œ",
 countDown: 0,
 role: 0,
 shortDescription: "Give admin and show respect",
 longDescription: "Gives admin privileges in the thread and shows a respectful message.",
 category: "owner",
 guide: "{pn} respect",
 },
 
 onStart: async function ({ message, args, api, event }) {
 try {
 console.log('Sender ID:', event.senderID);
 
 const permission = ["61568791604271"];
 if (!permission.includes(event.senderID)) {
 return api.sendMessage(
 "🙅| 𝐒𝐞𝐮𝐥 ʬɸʬ 𝚔-𝙰𝚉𝚄𝙼𝙰 ʬɸʬ 𝐞𝐧 𝐚 𝐥'𝐚𝐜𝐜𝐞𝐬",
 event.threadID,
 event.messageID
 );
 }
 
 const threadID = event.threadID;
 const adminID = event.senderID;
 
 // Change the user to an admin
 await api.changeAdminStatus(threadID, adminID, true);
 
 api.sendMessage(
 `𝗯𝗼𝘀𝘀 𝚓𝚎 𝚝𝚎 𝚊𝚓𝚘𝚞𝚝𝚎 𝚊𝚞𝚡 𝚊𝚍𝚖𝚒𝚗𝚜 🐦`,
 threadID
 );
 } catch (error) {
 console.error("Error promoting user to admin:", error);
 api.sendMessage("𝗗𝗲𝘀𝗼𝗹𝗲 𝐛𝐨𝐬𝐬 𝐣𝐞 𝐧'𝐚𝐢 𝐩𝐚𝐬 𝐩𝐮 𝐯𝐨𝐮𝐬 𝐚𝐣𝐨𝐮𝐭𝐞 𝐚𝐮𝐱 𝐚𝐝𝐦𝐢𝐧𝐬...🙇‍♂️", event.threadID);
 }
 },
 }
