const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

const styleMap = {
 "1": "flux.1-schnell",
 "2": "flux.1-dev",
 "3": "flux.1-pro"
};

async function getApiUrl() {
 return "http://87.106.100.187:6401";
}

module.exports = {
 config: {
 name: "flux",
 aliases: [],
 author: "Chitron Bhattacharjee",
 version: "1.0",
 cooldowns: 5,
 role: 0,
 shortDescription: "Generate images with FLUX API (-m 1/2/3 for model style)",
 longDescription:
 "Generates 4 images based on a prompt and model style, combines them, and lets you select one.",
 category: "𝗔𝗜 & 𝗚𝗣𝗧",
 guide: {
 en: "{pn} <prompt> [-m 1/2/3]\nModels:\n1: flux.1-schnell\n2: flux.1-dev\n3: flux.1-pro",
 },
 },

 onStart: async function ({ message, globalData, args, api, event }) {
 api.setMessageReaction("⏳", event.messageID, () => {}, true);

 try {
 let prompt = "";
 let model = "1";

 for (let i = 0; i < args.length; i++) {
 if ((args[i] === "-m" || args[i] === "--model") && args[i + 1]) {
 model = args[i + 1];
 i++;
 } else {
 prompt += args[i] + " ";
 }
 }
 prompt = prompt.trim();

 if (!prompt) {
 return message.reply("❌ | Missing required parameters: prompt");
 }

 if (!styleMap[model]) {
 api.setMessageReaction("❌", event.messageID, () => {}, true);
 return message.reply("❌ | Invalid model style. Choose 1, 2, or 3.");
 }

 // 💸 Coin Cost Notice with anime emojis
 message.reply(
 "🌸 𝓣𝓱𝓲𝓼 𝓬𝓸𝓶𝓶𝓪𝓷𝓭 𝔀𝓲𝓵𝓵 𝓬𝓸𝓼𝓽 ❺×❹ = ❷⓿ 𝓬𝓸𝓲𝓷𝓼~\n💫 𝓘𝓽 𝔀𝓲𝓵𝓵 𝓫𝓮 𝓭𝓮𝓭𝓾𝓬𝓽𝓮𝓭 𝓯𝓻𝓸𝓶 𝔂𝓸𝓾𝓻 𝓫𝓪𝓵𝓪𝓷𝓬𝓮!"
 );

 const apiUrl = await getApiUrl();

 const cacheFolderPath = path.join(__dirname, "/tmp");
 if (!fs.existsSync(cacheFolderPath)) fs.mkdirSync(cacheFolderPath);

 const modelParam = Array(4).fill(styleMap[model]).join("/");

 const { data } = await axios.get(`${apiUrl}/api/flux`, {
 params: { prompt, model: modelParam },
 });

 if (!data || !data.results || data.results.length < 4) {
 api.setMessageReaction("❌", event.messageID, () => {}, true);
 return message.reply("❌ | API did not return enough images.");
 }

 const imageUrls = data.results.slice(0, 4).map((res) => res.data[0].url);

 const images = await Promise.all(
 imageUrls.map(async (imageURL, index) => {
 const imagePath = path.join(
 cacheFolderPath,
 `image_${index + 1}_${Date.now()}.jpg`
 );
 const writer = fs.createWriteStream(imagePath);

 const imageResponse = await axios({
 url: imageURL,
 method: "GET",
 responseType: "stream",
 });

 imageResponse.data.pipe(writer);

 await new Promise((resolve, reject) => {
 writer.on("finish", resolve);
 writer.on("error", reject);
 });

 return imagePath;
 })
 );

 const loadedImages = await Promise.all(images.map((img) => loadImage(img)));
 const width = loadedImages[0].width;
 const height = loadedImages[0].height;

 const canvas = createCanvas(width * 2, height * 2);
 const ctx = canvas.getContext("2d");

 ctx.drawImage(loadedImages[0], 0, 0, width, height);
 ctx.drawImage(loadedImages[1], width, 0, width, height);
 ctx.drawImage(loadedImages[2], 0, height, width, height);
 ctx.drawImage(loadedImages[3], width, height, width, height);

 const combinedImagePath = path.join(
 cacheFolderPath,
 `image_combined_${Date.now()}.jpg`
 );
 const buffer = canvas.toBuffer("image/jpeg");
 fs.writeFileSync(combinedImagePath, buffer);

 api.setMessageReaction("✅", event.messageID, () => {}, true);

 const reply = await message.reply({
 body: `🖼️ Select an image by replying with 1, 2, 3, or 4.`,
 attachment: fs.createReadStream(combinedImagePath),
 });

 const dataForReply = {
 commandName: this.config.name,
 messageID: reply.messageID,
 images: images,
 combinedImage: combinedImagePath,
 author: event.senderID,
 };

 global.GoatBot.onReply.set(reply.messageID, dataForReply);
 } catch (error) {
 api.setMessageReaction("❌", event.messageID, () => {}, true);
 console.error("Error in flux command:", error.response ? error.response.data : error.message);
 message.reply("❌ | Failed to generate images.");
 }
 },

 onReply: async function ({ message, event }) {
 const replyData = global.GoatBot.onReply.get(event.messageReply.messageID);

 if (!replyData || replyData.author !== event.senderID) {
 return;
 }

 try {
 const index = parseInt(event.body.trim());
 if (isNaN(index) || index < 1 || index > 4) {
 return message.reply("❌ | Invalid selection. Please reply with a number between 1 and 4.");
 }

 const selectedImagePath = replyData.images[index - 1];
 await message.reply({
 attachment: fs.createReadStream(selectedImagePath),
 });
 } catch (error) {
 console.error("Error in flux onReply:", error.message);
 message.reply("❌ | Failed to send selected image.");
 }
 },
};