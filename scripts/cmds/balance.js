module.exports = {
 config: {
 name: "balance",
 aliases: ["bal", "money", "tk", "coin"],
 version: "1.3",
 author: "Chitron Bhattacharjee",
 countDown: 3,
 role: 0,
 shortDescription: {
 en: "💖 Check your kawaii balance!"
 },
 longDescription: {
 en: "Show your or others' balance in cute anime style ✨"
 },
 category: "💼 Economy",
 guide: {
 en: "➤ +bal\n➤ +bal @user or +bal <uid>"
 },
 usePrefix: true,
 useChat: true,
 },

 onStart: async function ({ event, args, message, usersData, role }) {
 let targetID = event.senderID;

 if (args.length > 0) {
 if (event.mentions && Object.keys(event.mentions).length > 0) {
 targetID = Object.keys(event.mentions)[0];
 } else if (/^\d{5,20}$/.test(args[0])) {
 if (role === 2) targetID = args[0];
 else return message.reply("🔒 𝙊𝙣𝙡𝙮 𝙗𝙤𝙩 𝙤𝙬𝙣𝙚𝙧 𝙘𝙖𝙣 𝙨𝙚𝙚 𝙤𝙩𝙝𝙚𝙧𝙨' 𝙗𝙖𝙡𝙖𝙣𝙘𝙚!");
 } else if (args[0].toLowerCase() === "history") {
 // We removed history support so ignore
 return message.reply("❌ 𝙃𝙞𝙨𝙩𝙤𝙧𝙮 𝙞𝙨 𝙣𝙤𝙩 𝙨𝙪𝙥𝙥𝙤𝙧𝙩𝙚𝙙 𝙖𝙣𝙮𝙢𝙤𝙧𝙚!");
 }
 }

 const name = await usersData.getName(targetID);
 const balance = (await usersData.get(targetID, "money")) || 0;

 const reply = 
`✨🌸 𝓗𝒆𝓎 𝓉𝒽𝑒𝓇𝑒, 𝓀𝒶𝓌𝒶𝒾𝒾 𝒻𝓇𝒾𝑒𝓃𝒹! 🌸✨
💖 𝑼𝘀𝘦𝘳: 𝑰𝑫: ${targetID}
🍥 𝓝𝓪𝓶𝓮: ${name}
💰 𝓑𝓪𝓵𝓪𝓷𝓬𝓮: ＄${balance.toLocaleString()}
🌸 𝓢𝓽𝓪𝔂 𝓢𝓹𝓪𝓻𝓴𝓵𝓲𝓷𝓰! ✨`;

 message.reply(reply);
 },

 onChat: async function ({ event, message }) {
 const body = event.body?.toLowerCase();
 if (!body) return;

 if (["bal", "balance", "money", "tk", "coin"].includes(body.trim())) {
 message.body = "+balance";
 return this.onStart({ ...arguments[0], args: [], message });
 } else if (body.startsWith("bal ")) {
 const args = body.trim().split(/\s+/).slice(1);
 message.body = "+balance " + args.join(" ");
 return this.onStart({ ...arguments[0], args, message });
 }
 }
};