const axios = require("axios");

module.exports = {
  config: {
    name: "bingvideo",
    version: "1.0",
    author: "Aesther",
    role: 0,
    shortDescription: "Recherche vidéo Bing",
    longDescription: "Recherche des vidéos sur Bing en utilisant un mot-clé",
    category: "media",
    usages: "[mot-clé]",
    cooldowns: 5
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage("❌ | Merci d’entrer un mot-clé pour rechercher des vidéos.\n📌 Exemple : bingvideo blackpink", event.threadID);
    }

    const apiUrl = `https://delirius-apiofc.vercel.app/search/bingvideos?query=${encodeURIComponent(query)}`;

    try {
      const res = await axios.get(apiUrl);
      const data = res.data.data;

      if (!Array.isArray(data) || data.length === 0) {
        return api.sendMessage("❌ | Aucune vidéo trouvée pour cette recherche.", event.threadID);
      }

      // Nettoyer les résultats vides ou mal formés
      const videos = data.filter(v => v.title && v.link);

      let msg = `🎬 Résultats pour : "${query}"\n\n`;
      let count = 0;

      for (const vid of videos.slice(0, 10)) { // Limite à 10 résultats
        count++;
        msg += `🔹 ${count}. ${vid.title}\n`;
        msg += `🕒 ${vid.duration || "Inconnu"} | 👀 ${vid.views || "Inconnu"}\n`;
        msg += `📅 ${vid.upload || "Date inconnue"} | 📺 ${vid.channel || "?"}\n`;
        msg += `🔗 ${vid.link}\n\n`;
      }

      api.sendMessage(msg.trim(), event.threadID);
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ | Une erreur est survenue lors de la recherche de vidéos.", event.threadID);
    }
  }
};
