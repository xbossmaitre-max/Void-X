const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "faceswap",
    aliases: ["fswap"],
    version: "1.0",
    author: "Aesther",
    countDown: 8,
    role: 0,
    shortDescription: "🔄 Échange les visages entre deux images",
    longDescription: "Utilise une API gratuite pour faire un swap de visages entre deux images envoyées en réponse.",
    category: "🖼️ Édition",
    guide: {
      fr: "Réponds à un message contenant 2 images avec : {pn}"
    }
  },

  onStart: async function ({ message, event }) {
    const { messageReply } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length < 2) {
      return message.reply("🌸 | Réponds à **2 images** pour faire un échange de visages !");
    }

    const img1 = messageReply.attachments[0]?.url;
    const img2 = messageReply.attachments[1]?.url;

    if (!img1 || !img2) {
      return message.reply("❌ | Il faut exactement **2 images valides**.");
    }

    const apiUrl = `https://api.siputzx.my.id/api/imgedit/faceswap?image1=${encodeURIComponent(img1)}&image2=${encodeURIComponent(img2)}`;

    try {
      const res = await axios.get(apiUrl);
      const imgUrl = res.data?.data;

      if (!imgUrl) {
        return message.reply("❌ | Impossible de traiter les images.");
      }

      const filePath = path.join(__dirname, "cache", `faceswap_${Date.now()}.jpg`);
      const imgRes = await axios.get(imgUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, imgRes.data);

      await message.reply({
        body: `🌸『 𝗙𝗔𝗖𝗘𝗦𝗪𝗔𝗣 𝗧𝗘𝗥𝗠𝗜𝗡𝗘́ 』🌸\n✨ Les visages ont été échangés avec succès !`,
        attachment: fs.createReadStream(filePath)
      });

      fs.unlinkSync(filePath); // 🧹 Nettoyage du cache

    } catch (err) {
      console.error("Erreur faceswap:", err);
      message.reply("❌ | Une erreur est survenue lors de l’échange de visages.");
    }
  }
};
