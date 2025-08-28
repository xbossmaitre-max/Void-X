const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "an1",
    version: "1.0",
    author: "Aryan Chauhan",
    countDown: 5,
    role: 0,
    shortDescription: "Search games on Android1",
    longDescription: "Find and download modded games from Android1 using AryanAPI.",
    category: "search",
    guide: {
      en: "{pn} <game name>\nExample: {pn} free fire"
    }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage(
        "⚠️ Please provide a game name!\nExample: an1 free fire",
        event.threadID,
        event.messageID
      );
    }

    try {
      const { data } = await axios.get(
        `https://aryapio.onrender.com/search/android1?q=${encodeURIComponent(query)}&apikey=aryan123`
      );

      if (!data?.status || !data?.result?.length) {
        return api.sendMessage("❌ No results found.", event.threadID, event.messageID);
      }

      const results = data.result.slice(0, 5); // limit to top 5
      let msg = `🎮 Search results for: ${query}\n\n`;
      const attachments = [];

      for (const game of results) {
        msg += `📌 *${game.name}*\n👤 Dev: ${game.developer}\n⭐ Rating: ${game.rating}\n🔗 Link: ${game.link}\n\n`;

        try {
          const imgPath = path.join(__dirname, `${game.name.replace(/[^a-z0-9]/gi, "_")}.jpg`);
          const imgResp = await axios.get(game.imageUrl, { responseType: "stream" });
          const writer = fs.createWriteStream(imgPath);

          await new Promise((resolve, reject) => {
            imgResp.data.pipe(writer);
            writer.on("finish", resolve);
            writer.on("error", reject);
          });

          attachments.push(fs.createReadStream(imgPath));
        } catch {
        }
      }

      api.sendMessage(
        { body: msg, attachment: attachments },
        event.threadID,
        () => {
        for (const att of attachments) {
            try { fs.unlinkSync(att.path); } catch {}
          }
        },
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error: Unable to fetch results. Please try again later.", event.threadID, event.messageID);
    }
  }
};
