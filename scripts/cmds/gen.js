const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
 config: {
 name: "gen",
 aliases: [],
 author: "Chitron Bhattacharjee",
 version: "1.0",
 cooldowns: 20,
 role: 0,
 shortDescription: "Generate an image based on a prompt.",
 longDescription: "Generates an image using the provided prompt.",
 category: "𝗔𝗜 & 𝗚𝗣𝗧",
 guide: "{p}gen <prompt>",
 },

 onStart: async function ({ message, args, api, event, usersData }) {
 const prompt = args.join(" ");
 const cost = 5;

 if (!prompt) {
 return api.sendMessage("🦆 | Provide a prompt!\nExample: +gen A robot in Tokyo", event.threadID);
 }

 const userData = await usersData.get(event.senderID);
 const current = userData.money || 0;

 if (current < cost) {
 return message.reply(`❌ | You need at least ${cost} coins.\n💰 Your balance: ${current}`);
 }

 await usersData.set(event.senderID, { money: current - cost });

 message.reply("🌸 𝓣𝓱𝓲𝓼 𝓬𝓸𝓼𝓽 5 𝓬𝓸𝓲𝓷𝓼~\n🎨 𝓖𝓮𝓷𝓮𝓻𝓪𝓽𝓲𝓷𝓰 𝓲𝓶𝓪𝓰𝓮...");

 try {
 const url = `https://hopelessmahi.onrender.com/api/image?prompt=${encodeURIComponent(prompt)}`;
 const res = await axios.get(url, { responseType: "arraybuffer" });

 const folder = path.join(__dirname, "cache");
 if (!fs.existsSync(folder)) fs.mkdirSync(folder);

 const file = path.join(folder, `${Date.now()}_gen.png`);
 fs.writeFileSync(file, Buffer.from(res.data, "binary"));

 const stream = fs.createReadStream(file);
 message.reply({
 body: `🖼️ 𝓗𝓮𝓻𝓮'𝓼 𝔂𝓸𝓾𝓻 𝓲𝓶𝓪𝓰𝓮~`,
 attachment: stream
 });

 } catch (err) {
 console.error("gen error:", err);
 message.reply("❌ | Failed to generate image.");
 }
 }
};