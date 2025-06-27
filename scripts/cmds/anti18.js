module.exports = {
 config: {
 name: "anti18",
 version: "1.0",
 author: "Chitron Bhattacharjee",
 role: 0,
 description: {
 en: "Auto-detects 18+ words and sends a warning image"
 },
 category: "protection"
 },

 // Dummy onStart just to satisfy the installer
 onStart: async function () {},

 onChat: async function ({ event, message }) {
 const badWords = [
 "fuck", "fuk", "f*ck", "phuck", "phuk", "fawk",
 "sex", "s3x", "s ex", "seggs", "sxx", "sx",
 "cum", "cumm", "c*m", "c@mm",
 "masturbate", "mastubate", "masterbate", "ma5turbate", "mastabate",
 "dick", "dik", "dyke", "d!ck", "d1ck",
 "boobs", "boob", "b00bs", "bo0bs",
 "pussy", "pusy", "pussee", "puszi",
 "vagina", "vajina", "vaginaa", "v@gin@", "vajenaa",
 "penis", "p3nis", "pns", "pénis",
 "nipple", "nippl",
 "chod", "chud", "choda", "chudi", "chodon",
 "gud", "gudmara", "gudmaar",
 "bokachoda", "gandu", "gando", "bokachudi",
 "jewra", "joray", "dhan", "dhon", "vodai", "vodar", "bira", "biral",
 "bang", "loda", "lora", "boner", "horny",
 "চোদ", "চুদ", "চুদা", "চুদি", "গুদের", "গুদ", "যোনি", "যৌন", "বাঁড়া", "ভোদা", "ভোদ", "ফাক", "ধন", "স্তন", "মাস্টারবেট", "মাল",
 "ভোদার", "দুধ", "কাম", "ঝার", "হস্তমৈথুন", "সেক্স", "চুষ"
 ];

 if (!event.body) return;

 const normalize = str =>
 str.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

 const text = normalize(event.body);

 const matched = badWords.some(word =>
 text.includes(word.replace(/[^a-zA-Zঅ-ৣ]/g, ""))
 );

 if (matched) {
 const fs = require("fs-extra");
 const path = require("path");
 const https = require("https");
 const imgPath = path.join(__dirname, "cache/anti18.jpeg");

 if (!fs.existsSync(imgPath)) {
 await new Promise((resolve, reject) => {
 https.get("https://i.imgur.com/qkM2t0l.jpeg", res => {
 const fileStream = fs.createWriteStream(imgPath);
 res.pipe(fileStream);
 fileStream.on("finish", () => fileStream.close(resolve));
 }).on("error", reject);
 });
 }

 message.reply({
 body: "বন্ধু😭 ভালো হয়ে যা!😞",
 attachment: fs.createReadStream(imgPath)
 });
 }
 }
};