const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "blurface",
    aliases: ["bl"],
    version: "1.0",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "🌀 Floute le visage sur une image",
    longDescription: "Applique un effet flou sur les visages d'une image envoyée en réponse.",
    category: "🖼️ Édition",
    guide: {
      fr: "Réponds à une image avec : {pn}"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const { type, messageReply } = event;

    // Vérifie si une image est bien reply
    if (type !== "message_reply" || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
      return message.reply("📸 | Réponds à une image pour flouter les visages !");
    }

    const imgURL = messageReply.attachments[0].url;
    const apiUrl = `https://api.siputzx.my.id/api/iloveimg/blurface?image=${encodeURIComponent(imgURL)}`;
    const fileName = `blur_${Date.now()}.jpg`;
    const filePath = path.join(__dirname, "cache", fileName);

    try {
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, res.data);

      await message.reply({
        body: "🫣 | Visages floutés avec succès !",
        attachment: fs.createReadStream(filePath)
      });

      // Clear cache
      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Erreur blurface:", err);
      message.reply("❌ Impossible de flouter l’image.");
    }
  }
};
