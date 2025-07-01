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

 onStart: async function ({ message, args, api, event }) {
 const prompt = args.join(" ");

 if (!prompt) {
 return api.sendMessage(
 "🦆 | You need to provide a prompt.\nExample:\n+gen A duck flying over a volcano",
 event.threadID
 );
 }

 // 💸 Coin cost anime notice
 message.reply(
 "🌸 𝓣𝓱𝓲𝓼 𝓬𝓸𝓶𝓶𝓪𝓷𝓭 𝔀𝓲𝓵𝓵 𝓬𝓸𝓼𝓽 ❺ 𝓬𝓸𝓲𝓷𝓼~\n💫 𝓘𝓽 𝔀𝓲𝓵𝓵 𝓫𝓮 𝓭𝓮𝓭𝓾𝓬𝓽𝓮𝓭 𝓯𝓻𝓸𝓶 𝔂𝓸𝓾𝓻 𝓫𝓪𝓵𝓪𝓷𝓬𝓮!"
 );

 api.sendMessage("⏳ | Please wait while I generate your image...", event.threadID, event.messageID);

 try {
 const mrgenApiUrl = `https://hopelessmahi.onrender.com/api/image?prompt=${encodeURIComponent(prompt)}`;

 const mrgenResponse = await axios.get(mrgenApiUrl, {
 responseType: "arraybuffer",
 });

 const cacheFolderPath = path.join(__dirname, "cache");
 if (!fs.existsSync(cacheFolderPath)) {
 fs.mkdirSync(cacheFolderPath);
 }

 const imagePath = path.join(cacheFolderPath, `${Date.now()}_generated_image.png`);
 fs.writeFileSync(imagePath, Buffer.from(mrgenResponse.data, "binary"));

 const stream = fs.createReadStream(imagePath);
 message.reply({
 body: `🖼️ 𝓗𝓮𝓻𝓮 𝓲𝓼 𝔂𝓸𝓾𝓻 𝓰𝓮𝓷𝓮𝓻𝓪𝓽𝓮𝓭 𝓲𝓶𝓪𝓰𝓮!`,
 attachment: stream,
 });
 } catch (error) {
 console.error("Error:", error);
 message.reply("❌ | An error occurred. Please try again later.");
 }
 }
};