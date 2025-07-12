const axios = require("axios");

module.exports = {
  config: {
    name: "darckgpt",
    version: "1.0",
    author: "Aesther",
    countDown: 5,
    role: 2,
    shortDescription: "💬 Parler avec une IA sombre",
    longDescription: "Une IA style VeniceGPT pour discuter comme un maître obscur",
    category: "ai",
    guide: {
      fr: "{pn} [texte à envoyer à l'IA]\nEx : {pn} Tu peux me raconter une blague ?"
    }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    const { threadID, messageID } = event;

    if (!prompt) {
      return api.sendMessage("❌ | Merci d’entrer un message à envoyer à l’IA sombre.", threadID, messageID);
    }

    try {
      const res = await axios.get(`https://api.nekorinn.my.id/ai/veniceai?text=${encodeURIComponent(prompt)}`);
      const result = res.data.result;

      if (!result) throw new Error("Aucune réponse de l’IA");

      const message = `🌑『 𝗗𝗔𝗥𝗖𝗞𝗚𝗣𝗧 』🌑\n━━━━━━━━━━━━━━\n🧠 𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻 : ${prompt}\n💬 𝗥𝗲𝗽𝗼𝗻𝘀𝗲 :\n${result}\n━━━━━━━━━━━━━━\n⚡ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗩𝗲𝗻𝗶𝗰𝗲𝗔𝗜`;

      return api.sendMessage(message, threadID, messageID);
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ | Impossible d’obtenir une réponse de l’IA pour le moment.", threadID, messageID);
    }
  }
};
