const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "lyrics",
    version: "1.1",
    author: "Aryan Chauhan",
    countDown: 5,
    role: 0,
    shortDescription: "Fetch lyrics of a song",
    longDescription: "Get detailed song lyrics with title, artist, release date, and cover art using AryanAPI.",
    category: "music",
    guide: {
      en: "{pn} <song name>\nExample: {pn} apt"
    }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage(
        "⚠️ Please provide a song name!\nExample: lyrics apt",
        event.threadID,
        event.messageID
      );
    }

    try {
      const { data } = await axios.get(
        `https://aryapio.onrender.com/search/lirik?query=${encodeURIComponent(query)}&apikey=aryan123`
      );

      if (!data?.status || !data?.data) {
        return api.sendMessage("❌ Lyrics not found.", event.threadID, event.messageID);
      }

      const { artis, image, title, rilis, lirik } = data.data;

      const imgPath = path.join(__dirname, "lyrics.jpg");
      const imgResp = await axios.get(image, { responseType: "stream" });
      const writer = fs.createWriteStream(imgPath);
      imgResp.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            body: `🎼 *${title}*\n👤 Artist: ${artis}\n📅 Released: ${rilis}\n\n${lirik}`,
            attachment: fs.createReadStream(imgPath)
          },
          event.threadID,
          () => fs.unlinkSync(imgPath),
          event.messageID
        );
      });

      writer.on("error", () => {
        api.sendMessage(
          `🎼 *${title}*\n👤 Artist: ${artis}\n📅 Released: ${rilis}\n\n${lirik}`,
          event.threadID,
          event.messageID
        );
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error: Unable to fetch lyrics. Please try again later.", event.threadID, event.messageID);
    }
  }
};
