module.exports = {
  config: {
    name: "autorespondv3",
    version: "1.4",
    author: "Aesther",
    cooldown: 5,
    role: 0,
    shortDescription: "🤖 Réagit automatiquement avec des emojis et réponses",
    longDescription: "Réagit aux mots-clés par des emojis ou messages automatiques.",
    category: "fun",
    guide: "Cette commande fonctionne automatiquement via onChat.",
  },

  onStart: async () => {
    // Rien ici, la commande s’active toute seule via onChat
  },

  onChat: async ({ api, event }) => {
    const { body, messageID, threadID } = event;
    if (!body) return;

    const emojis = {
      "💜": ["cliff", "august", "jonell", "david", "purple", "fritz", "sab", "haru", "xuazane", "kim"],
      "💚": ["dia", "seyj", "ginanun", "gaganunin", "pfft", "xyrene", "gumanun"],
      "😾": ["jo", "ariii", "talong", "galit"],
      "😼": ["wtf", "fck", "haaays", "naku", "ngi ", "ngek", "nge ", "luh", "lah"],
      "😸": ["pill", "laugh", "lt ", "gagi", "huy", "hoy"],
      "🌀": ["prodia", "sdxl", "bardv3", "tanongv2", "-imagine", "genimg", "tanongv4", "kamla", "-shortcut", "imagine", "textpro", "photofy"],
      "👋": ["hi ", "hello", "salut", "bjr", "bonjour", "bonsoir", "slt"],
      "🔥": ["astig", "damn", "angas", "galing", "husay", ".jpg"],
      "💩": ["merde", "caca", "shit"],
      "🤢": ["beurk", "dégueulasse", "dégeu", "horrible", "vomir"],
      "🌸": ["amour", "câlin", "tendresse", "gentillesse", "bienveillance", "douceur", "complicité", "gratitude", "bonheur", "amitié"],
      "😂": ["ridicule", "clownesque", "farce", "pitrerie", "comique", "drôle", "amusant", "hilarant", "loufoque", "bouffonnerie", "cocasse", "burlesque", "rigolo", "absurde", "irrévérencieux", "ironique", "parodie", "esprit", "facétieux"],
      "😎": ["cool", "formidable", "😎"],
      "⚡": ["super", "aesther"],
      "🤖": ["prefix", "robot"],
      "🔰": ["nathan", "cyble", "barro", "personnage"],
      "✔️": ["bien", "ok"],
      "🎉": ["congrats", "félicitation", "goddess-anaïs"],
      "📑": ["disertation", "liste", "document", "playlist", "count all"],
      "♻️": ["restart", "revoila"],
      "🖕": ["fuck", "enculer", "fdp", "🖕"],
      "🔖": ["cmd", "command"],
      "😑": ["mmmh", "kiii", "hum"],
      "💍": ["aesther"],
      "💵": ["anjara", "money", "argent", "ariary"],
      "😝": ["anjara"],
      "✨": ["oui", "super"],
      "✖️": ["wrong", "faux"],
      "🎮": ["gaming", "jeux", "playing", "jouer"],
      "🤡": ["kindly provide the question", "clone", "sanchokuin", "bakugo"],
      "💙": ["manga", "anime", "sukuna"],
      "😕": ["bruh"],
      "👎": ["kindly provide"],
      "🌩️": ["*thea", "tatakae", "damare"],
      "😈": ["malin", "devil", "evil", "suprem", "sadique"],
      "🔪": ["tué"]
    };

    const replies = {
      "🌷🌷🌷": "~~𝙾𝚞𝚒 ?? 🙃🌷"
    };

    // Réactions
    for (const [emoji, words] of Object.entries(emojis)) {
      for (const word of words) {
        if (body.toLowerCase().includes(word)) {
          return api.setMessageReaction(emoji, messageID, () => {}, true);
        }
      }
    }

    // Réponses
    for (const [trigger, reply] of Object.entries(replies)) {
      if (body.toLowerCase().includes(trigger)) {
        return api.sendMessage(reply, threadID, messageID);
      }
    }
  }
};
