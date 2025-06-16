const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
 config: {
 name: "draft",
 version: "2.0.0",
 author: "Your Name & Shaon Ahmed",
 countDown: 5,
 role: 2, // Admin-only
 shortDescription: {
 en: "Upload command files to pastebin"
 },
 longDescription: {
 en: "Upload local command files to a pastebin service and get shareable links"
 },
 category: "developer",
 guide: {
 en: "{pn} [filename]"
 }
 },

 onStart: async function ({ api, event, args, message }) {
 try {
 // Check if filename was provided
 if (!args[0]) {
 return message.reply("📁 Please provide a filename.\nUsage: draft <filename>");
 }

 const fileName = args[0];
 const commandsPath = path.join(__dirname, '..', 'commands');
 
 // Check both with and without .js extension
 let filePath = path.join(commandsPath, fileName);
 if (!fs.existsSync(filePath)) {
 filePath = path.join(commandsPath, fileName + '.js');
 if (!fs.existsSync(filePath)) {
 return message.reply("❌ File not found in commands folder.");
 }
 }

 // Read the file
 const fileContent = fs.readFileSync(filePath, 'utf8');
 
 // Upload to pastebin
 message.reply("📤 Uploading file to PasteBin, please wait...", async (err, info) => {
 try {
 const response = await axios.post('https://pastebin-api.vercel.app/paste', {
 text: fileContent
 });

 if (response.data?.id) {
 const rawUrl = `https://pastebin-api.vercel.app/raw/${response.data.id}`;
 api.unsendMessage(info.messageID);
 return message.reply(`✅ File uploaded successfully:\n🔗 ${rawUrl}`);
 } else {
 throw new Error('Invalid API response');
 }
 } catch (uploadError) {
 console.error("Upload error:", uploadError);
 api.unsendMessage(info.messageID);
 return message.reply("❌ Failed to upload file. Please try again later.");
 }
 });

 } catch (error) {
 console.error("Error:", error);
 return message.reply("❌ An error occurred while processing your request.");
 }
 }
};