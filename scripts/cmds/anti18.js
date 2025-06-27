const fs = require("fs-extra");
const path = require("path");
const https = require("https");

const imageLinks = [
 "https://i.imgur.com/B6G3NlF.jpeg",
 "https://i.imgur.com/T7RtKlp.gif",
 "https://i.imgur.com/BmGxEFs.gif",
 "https://i.imgur.com/MEdpECT.jpeg",
 "https://i.imgur.com/KU8N4Ca.jpeg",
 "https://i.imgur.com/roBS6oX.gif",
 "https://i.imgur.com/SkfGapy.jpeg",
 "https://i.imgur.com/GGQv16z.jpeg",
 "https://i.imgur.com/VAf5Eue.gif",
 "https://i.imgur.com/ZZpapGi.jpeg",
 "https://i.imgur.com/4LvXywY.jpeg",
 "https://i.imgur.com/NZ5iyCh.jpeg",
 "https://i.imgur.com/BkrKZ8b.jpeg",
 "https://i.imgur.com/Yf1LRak.jpeg",
 "https://i.imgur.com/1fsJf6B.jpeg",
 "https://i.imgur.com/MR2h7jw.jpeg",
 "https://i.imgur.com/K9fFzgm.jpeg",
 "https://i.imgur.com/Se05IOn.jpeg",
 "https://i.imgur.com/h1Yhryc.jpeg",
 "https://i.imgur.com/sUgF4oQ.jpeg",
 "https://i.imgur.com/8oHuIf8.jpeg",
 "https://i.imgur.com/fiH5dUv.jpeg",
 "https://i.imgur.com/FSKnHZt.jpeg",
 "https://i.imgur.com/80YYI12.jpeg",
 "https://i.imgur.com/ibd1j8n.jpeg",
 "https://i.imgur.com/J8vbW7x.jpeg",
 "https://i.imgur.com/fOmuOKl.jpeg",
 "https://i.imgur.com/qDwypw6.jpeg",
 "https://i.imgur.com/9dVyEEe.gif",
 "https://i.imgur.com/d3yM7FX.jpeg",
 "https://i.imgur.com/JToFUJo.jpeg",
 "https://i.imgur.com/aJ5sbvo.jpeg",
 "https://i.imgur.com/09qesDj.gif",
 "https://i.imgur.com/HES8mee.jpeg",
 "https://i.imgur.com/ovETysm.jpeg",
 "https://i.imgur.com/mpCMAYQ.jpeg",
 "https://i.imgur.com/iQV82Jq.jpeg",
 "https://i.imgur.com/qkM2t0l.jpeg", // Original image added back
 "https://i.imgur.com/VAf5Eue.gif"
];

const downloadedImages = [];
let lastSent = null;

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

 onStart: async function () {},

 onChat: async function ({ event, message }) {
 const badWords = [
 "fuck", "fuk", "f*ck", "phuck", "phuk", "fawk",
 "sex", "s3x", "s ex", "seggs", "sxx", "sx",
 "cum", "cumm",
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
 "jewra", "joray", "dhan", "dhon", "vodai", "vodar", "bira", "biral", "kutta", "baccha", "shuyor", "dhon", "bal", "shawa", "heda", "lawra", "putki", "pukki", "mara", "magi", "khanki", "bessha", "nunu", "tuntuni",
 "bang", "loda", "lora", "boner", "horny",
 "চোদ", "চুদ", "চুদা", "চুদি", "গুদের", "গুদ", "যোনি", "যৌন", "বাঁড়া", "ভোদা", "ভোদ", "ফাক", "ধন", "স্তন", "মাস্টারবেট", "মাল",
 "ভোদার", "দুধ", "কাম", "ঝার", "হস্তমৈথুন", "সেক্স", "চুষ"
 ];

 if (!event.body) return;

 const normalize = str => str.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
 const text = normalize(event.body);

 const matched = badWords.some(word =>
 text.includes(word.replace(/[^a-zA-Zঅ-ৣ]/g, ""))
 );

 if (!matched) return;

 const cacheFolder = path.join(__dirname, "cache/anti18");
 if (!fs.existsSync(cacheFolder)) fs.mkdirSync(cacheFolder, { recursive: true });

 for (let url of imageLinks) {
 const fileName = path.basename(url);
 const fullPath = path.join(cacheFolder, fileName);
 if (!fs.existsSync(fullPath)) {
 await new Promise((resolve, reject) => {
 https.get(url, res => {
 const stream = fs.createWriteStream(fullPath);
 res.pipe(stream);
 stream.on("finish", () => stream.close(resolve));
 }).on("error", reject);
 });
 }
 if (!downloadedImages.includes(fullPath)) downloadedImages.push(fullPath);
 }

 const available = downloadedImages.filter(img => img !== lastSent);
 const selected = available[Math.floor(Math.random() * available.length)];
 lastSent = selected;

 message.reply({
 body: "বন্ধু😭 ভালো হয়ে যা!😞",
 attachment: fs.createReadStream(selected)
 });
 }
};