const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "onlytik",
    version: "1.1",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "🎌 TikTok NSFW aléatoire",
    longDescription: "Envoie une vidéo NSFW random au style OnlyFans/TikTok",
    category: "🔞 NSFW",
    guide: {
      fr: "{pn} → Reçoit une vidéo NSFW TikTok aléatoire"
    }
  },

  onStart: async function ({ message }) {
    const fileName = `onlytik_${Date.now()}.mp4`;
    const filePath = path.join(__dirname, "cache", fileName);

    try {
      // ⏳ Message initial
      await message.reply(
        `⌛ 𝙍𝙚𝙘𝙝𝙚𝙧𝙘𝙝𝙚 𝙙'𝙪𝙣𝙚 𝙫𝙞𝙙é𝙤 𝙊𝙣𝙡𝙮𝙏𝙞𝙠...
━━━━━━━━━━━━━━━━━━━━
📡 Source : OnlyTik™
💫 Type : NSFW TikTok
━━━━━━━━━━━━━━━━━━━━
🕒 Merci de patienter un instant !`
      );

      // 📥 Téléchargement du stream
      const response = await axios({
        method: "GET",
        url: "https://haji-mix-api.gleeze.com/api/onlytik?stream=true",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await message.reply({
          body:
            `🎴 𝙊𝙣𝙡𝙮𝙏𝙞𝙠 𝙍𝘼𝙉𝘿𝙊𝙈 𝙉𝙎𝙁𝙒 𝙑𝙄𝘿𝙀𝙊 🔥
━━━━━━━━━━━━━━━━━━━━
📽️ Voici ta dose de plaisir visuel ~
🧠 Powered by 𝗔𝗲𝘀𝘁𝗵𝗲𝗿 𝗔𝗜
━━━━━━━━━━━━━━━━━━━━
📎 Vidéo générée automatiquement.`,
          attachment: fs.createReadStream(filePath)
        });

        // 🧹 Nettoyage
        fs.unlinkSync(filePath);
      });

      writer.on("error", async (err) => {
        console.error("Erreur fichier:", err);
        await message.reply("❌ | Une erreur s’est produite pendant le téléchargement.");
      });

    } catch (err) {
      console.error("Erreur OnlyTik:", err.message);
      await message.reply("❌ | Échec de récupération de la vidéo.");
    }
  }
};
