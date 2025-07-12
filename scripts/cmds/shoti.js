const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const ACTIVE_FILE = path.join(__dirname, "cache", "shoti-active.json");
fs.ensureFileSync(ACTIVE_FILE);

module.exports = {
  config: {
    name: "shoti",
    version: "2.0",
    author: "Aesther",
    countDown: 3,
    role: 0,
    shortDescription: "🔄 Vidéo automatique Shoti",
    longDescription: "Active ou désactive l’envoi automatique de vidéos NSFW shoti toutes les 15 minutes.",
    category: "🔞 NSFW",
    guide: {
      fr: "{pn} on → Active l’envoi auto\n{pn} off → Désactive"
    }
  },

  onStart: async function ({ message, args, event }) {
    const status = args[0]?.toLowerCase();
    const threadID = event.threadID;
    let activeList = [];

    try {
      activeList = JSON.parse(fs.readFileSync(ACTIVE_FILE, "utf8"));
    } catch (e) {
      activeList = [];
    }

    if (status === "on") {
      if (activeList.includes(threadID))
        return message.reply("✅ | L’envoi automatique est **déjà activé** ici.");

      activeList.push(threadID);
      fs.writeFileSync(ACTIVE_FILE, JSON.stringify(activeList));
      message.reply("🟢 | L’envoi automatique des vidéos **Shoti** est activé ici !");
    }

    else if (status === "off") {
      if (!activeList.includes(threadID))
        return message.reply("ℹ️ | L’envoi automatique est **déjà désactivé** ici.");

      activeList = activeList.filter(id => id !== threadID);
      fs.writeFileSync(ACTIVE_FILE, JSON.stringify(activeList));
      message.reply("🔴 | L’envoi automatique des vidéos Shoti est **désactivé**.");
    }

    else {
      return message.reply("❓ | Utilisation :\n- `shoti on` → activer\n- `shoti off` → désactiver");
    }
  },

  onLoad: async function ({ api }) {
    const interval = 15 * 60 * 1000; // 15 minutes

    setInterval(async () => {
      let activeList = [];

      try {
        activeList = JSON.parse(fs.readFileSync(ACTIVE_FILE, "utf8"));
      } catch (e) {
        activeList = [];
      }

      for (const threadID of activeList) {
        try {
          const filePath = path.join(__dirname, "cache", `shoti_${Date.now()}.mp4`);
          const res = await axios({
            method: "GET",
            url: "https://haji-mix-api.gleeze.com/api/shoti?stream=true",
            responseType: "stream"
          });

          const writer = fs.createWriteStream(filePath);
          res.data.pipe(writer);

          writer.on("finish", () => {
            api.sendMessage({
              body: `🔞 𝙎𝙃𝙊𝙏𝙄 - 𝘼𝙪𝙩𝙤 𝙈𝙤𝙙𝙚 🌶️\n───────────────\n📽️ Vidéo NSFW automatique envoyée avec 🔥`,
              attachment: fs.createReadStream(filePath)
            }, threadID, () => fs.unlinkSync(filePath));
          });

          writer.on("error", () => {
            console.error("❌ Erreur écriture fichier shoti.");
          });

        } catch (err) {
          console.error(`❌ [Shoti-Auto] Erreur dans le thread ${threadID}:`, err.message);
        }
      }
    }, interval);
  }
};
