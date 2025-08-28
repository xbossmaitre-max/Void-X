const axios = require("axios");

module.exports = {
  config: {
    name: "apkcombo",
    version: "1.0",
    author: "Aryan Chauhan",
    countDown: 5,
    role: 0,
    shortDescription: "Search apps from Apkcombo",
    longDescription: "Search and get APK download links from Apkcombo.",
    category: "search",
    guide: {
      en: "{pn} <app name>\nExample: {pn} Free Fire"
    }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage("⚠️ Please provide an app name!\nExample: apkcombo Free Fire", event.threadID, event.messageID);
    }

    try {
      const res = await axios.get(`https://aryapio.onrender.com/search/apkcombo?q=${encodeURIComponent(query)}&apikey=aryan123`);
      const data = res.data;

      if (!data.status || !data.result || data.result.length === 0) {
        return api.sendMessage("❌ No results found.", event.threadID, event.messageID);
      }

      let msg = `📱 Apkcombo Search Results for: ${query}\n\n`;
      data.result.slice(0, 10).forEach((app, i) => {
        msg += `🔹 ${i + 1}. ${app.name}\n`;
        msg += `👤 Author: ${app.author}\n`;
        msg += `⭐ Rating: ${app.rating}\n`;
        msg += `📥 Downloads: ${app.downloaded}\n`;
        msg += `📦 Size: ${app.size}\n`;
        msg += `🔗 Link: ${app.link}\n\n`;
      });

      api.sendMessage(msg.trim(), event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error: Unable to fetch data. Please try again later.", event.threadID, event.messageID);
    }
  }
};
