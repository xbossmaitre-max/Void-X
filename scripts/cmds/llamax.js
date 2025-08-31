const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const DATA_PATH = path.join(__dirname, "llama_model_data.json");
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const MAX_HISTORY = 25;

// Initialisation sécurisée du fichier de données
if (!fs.existsSync(DATA_PATH)) {
  fs.ensureFileSync(DATA_PATH);
  fs.writeFileSync(DATA_PATH, JSON.stringify({}));
}

// Cache mémoire pour les historiques
const activeHistories = new Map();

// Liste des modèles PRÉDÉFINIE et ORDONNÉE (identique dans list et set)
const PREDEFINED_MODELS = [
  "meta-llama/llama-prompt-guard-2-22m",
  "meta-llama/llama-guard-4-12b",
  "mistral-saba-24b",
  "allam-2-7b",
  "llama3-8b-8192",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "deepseek-r1-distill-llama-70b",
  "llama-3.3-70b-versatile",
  "compound-beta-mini",
  "meta-llama/llama-4-maverick-17b-128e-instruct",
  "gemma2-9b-it",
  "qwen/qwen3-32b",
  "llama3-70b-8192",
  "llama-3.1-8b-instant",
  "qwen-qwq-32b",
  "meta-llama/llama-prompt-guard-2-86m",
  "compound-beta"
];

const modelDescriptions = {
  "meta-llama/llama-prompt-guard-2-22m": "🛡 Llama Prompt Guard 22M - Sécurité",
  "meta-llama/llama-guard-4-12b": "🔒 Llama Guard 12B - Protection avancée",
  "mistral-saba-24b": "🌪 Mistral Saba 24B - Puissance Mistral",
  "allam-2-7b": "🦙 Allam 2 7B - Version légère",
  "llama3-8b-8192": "🧠 Llama3 8B - Entrée de gamme",
  "meta-llama/llama-4-scout-17b-16e-instruct": "🦅 Llama4 Scout 17B - Exploration",
  "deepseek-r1-distill-llama-70b": "🔍 DeepSeek Llama 70B - Analyse profonde",
  "llama-3.3-70b-versatile": "🌟 Llama 3.3 70B - Polyvalent (recommandé)",
  "compound-beta-mini": "🧪 Compound Beta Mini - Expérimental",
  "meta-llama/llama-4-maverick-17b-128e-instruct": "🤠 Llama4 Maverick 17B - Avancé",
  "gemma2-9b-it": "💎 Gemma2 9B - Google optimisé",
  "qwen/qwen3-32b": "🌐 Qwen3 32B - Alibaba Cloud",
  "llama3-70b-8192": "🚀 Llama3 70B - Pleine puissance",
  "llama-3.1-8b-instant": "⚡ Llama 3.1 8B - Réponse instantanée",
  "qwen-qwq-32b": "🌀 Qwen QWQ 32B - Version alternative",
  "meta-llama/llama-prompt-guard-2-86m": "🛡 Prompt Guard 86M - Légère",
  "compound-beta": "🧬 Compound Beta - Version complète"
};

const map = {
  '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵',
  'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝',
  'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧',
  'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
  'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷',
  'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁',
  'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
  'à': '𝗮̀', 'â': '𝗮̂', 'ä': '𝗮̈', 'é': '𝗲́', 'è': '𝗲̀', 'ê': '𝗲̂', 'ë': '𝗲̈', 'î': '𝗶̂', 'ï': '𝗶̈',
  'ô': '𝗼̂', 'ö': '𝗼̈', 'ù': '𝘂̀', 'û': '𝘂̂', 'ü': '𝘂̈', 'ç': '𝗰̧'
};

function stylize(text) {
  return text.split('').map(c => map[c] || c).join('');
}

function getHistoryFilePath(uid) {
  const dir = path.join(__dirname, 'llama_uids');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${uid}_llama_history.json`);
}

function loadChatHistory(uid) {
  if (activeHistories.has(uid)) {
    return activeHistories.get(uid);
  }

  const file = getHistoryFilePath(uid);
  try {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      const historyData = Array.isArray(data) 
        ? { history: data } 
        : data;
      activeHistories.set(uid, historyData);
      return historyData;
    }
  } catch (err) {
    console.error("Error loading chat history:", err);
  }
  
  const newData = { history: [] };
  activeHistories.set(uid, newData);
  return newData;
}

function saveChatHistory(uid, data) {
  const trimmed = {
    ...data,
    history: data.history.slice(-MAX_HISTORY)
  };
  activeHistories.set(uid, trimmed);
  fs.writeFileSync(getHistoryFilePath(uid), JSON.stringify(trimmed, null, 2));
}

function cleanUserHistory(uid) {
  const file = getHistoryFilePath(uid);
  try {
    activeHistories.delete(uid);
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error cleaning user history:", err);
    return false;
  }
}

const activeRequests = new Set();

module.exports = {
  config: {
    name: "llamax",
    aliases: ["llx", "lama"],
    version: "1.0",
    author: "ꗇ︱Blẳȼk 义",
    countDown: 5,
    role: 0,
    shortDescription: "𝗜𝗔 𝗟𝗟𝗔𝗠𝗔 𝗮𝘃𝗲𝗰 𝗹𝗲𝘀 𝗺𝗼𝗱è𝗹𝗲𝘀 𝗚𝗥𝗢𝗤 🤖",
    longDescription: "𝗣𝗼𝘀𝗲 𝘂𝗻𝗲 𝗾𝘂𝗲𝘀𝘁𝗶𝗼𝗻 𝗮𝘂𝘅 𝗺𝗼𝗱è𝗹𝗲𝘀 𝗟𝗹𝗮𝗺𝗮 (𝗚𝗥𝗢𝗤) ✨ 𝗮𝘃𝗲𝗰 𝗺é𝗺𝗼𝗶𝗿𝗲 𝗱𝗲 𝗰𝗼𝗻𝘃𝗲𝗿𝘀𝗮𝘁𝗶𝗼𝗻",
    category: "ai"
  },

  onStart: async function ({ args, message, event, api }) {
    try {
      const db = fs.existsSync(DATA_PATH) ? JSON.parse(fs.readFileSync(DATA_PATH)) : {};
      const uid = event.senderID;
      if (!db[uid]) db[uid] = DEFAULT_MODEL;

      const command = args[0]?.toLowerCase();

      if (command === "list") {
        try {
          let msg = stylize("📄 | 𝗟𝗶𝘀𝘁𝗲 𝗱𝗲𝘀 𝗺𝗼𝗱è𝗹𝗲𝘀 𝗟𝗟𝗔𝗠𝗔 𝗱𝗶𝘀𝗽𝗼𝗻𝗶𝗯𝗹𝗲𝘀 :\n\n");
          PREDEFINED_MODELS.forEach((m, i) => {
            const desc = modelDescriptions[m] || "— Modèle Llama avancé";
            msg += stylize(`${i + 1}. ${m}${m === db[uid] ? " ✅" : ""}\n   → ${desc}\n`);
          });

          return message.reply(msg);
        } catch (err) {
          return message.reply(stylize("❌ | 𝗜𝗺𝗽𝗼𝘀𝘀𝗶𝗯𝗹𝗲 𝗱𝗲 𝗿é𝗰𝘂𝗽é𝗿𝗲𝗿 𝗹𝗮 𝗹𝗶𝘀𝘁𝗲."));
        }
      }

      if (command === "set") {
        const index = parseInt(args[1]);
        if (isNaN(index)) return message.reply(stylize("❌ | 𝗨𝘁𝗶𝗹𝗶𝘀𝗮𝘁𝗶𝗼𝗻 : llx set <numéro>"));

        try {
          if (index < 1 || index > PREDEFINED_MODELS.length) {
            return message.reply(stylize(`❌ | 𝗡𝘂𝗺é𝗿𝗼 𝗶𝗻𝘃𝗮𝗹𝗶𝗱𝗲. Tape \`llx list\` pour voir (1-${PREDEFINED_MODELS.length}).`));
          }

          const selected = PREDEFINED_MODELS[index - 1];
          db[uid] = selected;
          fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2));
          return message.reply(stylize(`✅ | 𝗠𝗼𝗱è𝗹𝗲 𝗟𝗹𝗮𝗺𝗮 **${selected}** 𝘀é𝗹𝗲𝗰𝘁𝗶𝗼𝗻𝗻é.`));
        } catch {
          return message.reply(stylize("❌ | 𝗘𝗿𝗿𝗲𝘂𝗿 𝗹𝗼𝗿𝘀 𝗱𝗲 𝗹𝗮 𝘀é𝗹𝗲𝗰𝘁𝗶𝗼𝗻."));
        }
      }

      if (command === "clean") {
        const success = cleanUserHistory(uid);
        return message.reply(
          stylize(success 
            ? "🧠 | 𝗩𝗼𝘁𝗿𝗲 𝗵𝗶𝘀𝘁𝗼𝗿𝗶𝗾𝘂𝗲 𝗟𝗹𝗮𝗺𝗮 𝗮 𝗲́𝘁𝗲́ 𝘀𝘂𝗽𝗽𝗿𝗶𝗺𝗲́"
            : "🌍 | 𝗔𝘂𝗰𝘂𝗻 𝗵𝗶𝘀𝘁𝗼𝗿𝗶𝗾𝘂𝗲 𝗟𝗹𝗮𝗺𝗮 𝗮̀ 𝘀𝘂𝗽𝗽𝗿𝗶𝗺𝗲𝗿"
          )
        );
      }

      const question = args.join(" ");
      if (!question) {
        return message.reply(stylize("❓ | 𝗣𝗼𝘀𝗲 𝘂𝗻𝗲 𝗾𝘂𝗲𝘀𝘁𝗶𝗼𝗻 𝗼𝘂 𝘂𝘁𝗶𝗹𝗶𝘀𝗲 `llx list` 𝗼𝘂 `llx set <numéro>`."));
      }

      const model = db[uid];
      api.setMessageReaction("🧠", event.messageID, () => {}, true);

      try {
        const userData = loadChatHistory(uid);
        const { history } = userData;
        
        const context = history.map(entry => 
          `${entry.role === 'user' ? 'User' : 'Llama'}: ${entry.message}`
        ).join('\n');
        
        const fullPrompt = context ? `${context}\nUser: ${question}` : question;

        const res = await axios.get("https://haji-mix-api.gleeze.com/api/groq", {
          params: {
            ask: fullPrompt,
            model,
            uid,
            api_key: "3692d288fc78ac891307d28a4b016fe6d2b047062794e61cc83c0dd9ef7a9b2b"
          }
        });

        let answer = res.data.answer || stylize("🤖 | 𝗔𝘂𝗰𝘂𝗻𝗲 𝗿é𝗽𝗼𝗻𝘀𝗲 𝗿𝗲ç𝘂𝗲 𝗱𝗲 𝗟𝗹𝗮𝗺𝗮.");
        answer = answer.replace(/puisque vous avez mentionné que la date d'aujourd'hui est le \d+ \w+ \d+/i, '').trim();
        
        const newHistory = [
          ...history,
          { role: "user", message: question },
          { role: "bot", message: answer }
        ];
        
        saveChatHistory(uid, { ...userData, history: newHistory });
        api.setMessageReaction("🌍", event.messageID, () => {}, true);

        const formattedResponse = 
          `🧠|${stylize(`(${model})`)}\n` +
          `${stylize("━━━━━━━━━━━━━━━━━━━")}\n` +
          `${stylize(answer)}\n` +
          `${stylize("━━━━━━━━━━━━━━━━━━━")}\n` +
          `🌍|${stylize("𝗟𝗟𝗔𝗠𝗔-𝗫 𝗣𝗢𝗪𝗘𝗥")}`;

        const replyMessage = await message.reply(formattedResponse);

        if (replyMessage?.messageID) {
          global.GoatBot.onReply.set(replyMessage.messageID, {
            commandName: "llamax",
            author: uid,
            threadID: event.threadID
          });
        }

      } catch (err) {
        console.error("Llama Error:", err);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(stylize("❌ | 𝗘𝗿𝗿𝗲𝘂𝗿 𝗹𝗼𝗿𝘀 𝗱𝗲 𝗹𝗮 𝗿𝗲𝗾𝘂ê𝘁𝗲 à 𝗟𝗹𝗮𝗺𝗮."));
      }
    } catch (err) {
      console.error("Global Error:", err);
      return message.reply(stylize("❌ | 𝗘𝗿𝗿𝗲𝘂𝗿 𝗶𝗻𝘁𝗲𝗿𝗻𝗲 𝗱𝘂 𝘀𝘆𝘀𝘁è𝗺𝗲."));
    }
  },

  onReply: async function({ api, message, event, Reply }) {
    const requestId = `${event.threadID}_${event.senderID}_${Date.now()}`;
    if (activeRequests.has(requestId)) return;
    activeRequests.add(requestId);

    try {
      if (event.type !== "message_reply" || event.messageReply.senderID !== api.getCurrentUserID()) return;
      const { commandName, author } = Reply;
      if (commandName !== this.config.name || author !== event.senderID) return;

      const prompt = event.body?.trim();
      if (!prompt) {
        return message.reply(stylize("🧠 | 𝗣𝗼𝘀𝗲𝘇 𝘃𝗼𝘁𝗿𝗲 𝗾𝘂𝗲𝘀𝘁𝗶𝗼𝗻 à 𝗟𝗹𝗮𝗺𝗮..."));
      }

      const db = fs.existsSync(DATA_PATH) ? JSON.parse(fs.readFileSync(DATA_PATH)) : {};
      const uid = event.senderID;
      const model = db[uid] || DEFAULT_MODEL;

      api.setMessageReaction("🧠", event.messageID, () => {}, true);

      const userData = loadChatHistory(uid);
      const { history } = userData;
      
      const context = history.map(entry => 
        `${entry.role === 'user' ? 'User' : 'Llama'}: ${entry.message}`
      ).join('\n');
      
      const fullPrompt = context ? `${context}\nUser: ${prompt}` : prompt;

      const res = await axios.get("https://haji-mix-api.gleeze.com/api/groq", {
        params: {
          ask: fullPrompt,
          model,
          uid,
          api_key: "3692d288fc78ac891307d28a4b016fe6d2b047062794e61cc83c0dd9ef7a9b2b"
        }
      });

      let answer = res.data.answer || stylize("🤖 | 𝗔𝘂𝗰𝘂𝗻𝗲 𝗿é𝗽𝗼𝗻𝘀𝗲 𝗿𝗲ç𝘂𝗲 𝗱𝗲 𝗟𝗹𝗮𝗺𝗮.");
      answer = answer.replace(/puisque vous avez mentionné que la date d'aujourd'hui est le \d+ \w+ \d+/i, '').trim();
      
      const newHistory = [
        ...history,
        { role: "user", message: prompt },
        { role: "bot", message: answer }
      ];
      
      saveChatHistory(uid, { ...userData, history: newHistory });
      api.setMessageReaction("🌍", event.messageID, () => {}, true);

      const formattedResponse = 
        `🧠|${stylize(`(${model})`)}\n` +
        `${stylize("━━━━━━━━━━━━━━━━━━━")}\n` +
        `${stylize(answer)}\n` +
        `${stylize("━━━━━━━━━━━━━━━━━━━")}\n` +
        `🌍|${stylize("𝗟𝗟𝗔𝗠𝗔-𝗫 𝗣𝗢𝗪𝗘𝗥")}`;

      const replyMessage = await message.reply(formattedResponse);

      if (replyMessage?.messageID) {
        global.GoatBot.onReply.set(replyMessage.messageID, {
          commandName: "llamax",
          author: uid,
          threadID: event.threadID
        });
      }
    } catch (err) {
      console.error("Reply Error:", err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply(stylize("❌ | 𝗘𝗿𝗿𝗲𝘂𝗿 𝗹𝗼𝗿𝘀 𝗱𝗲 𝗹𝗮 𝗿é𝗽𝗼𝗻𝘀𝗲 𝗱𝗲 𝗟𝗹𝗮𝗺𝗮."));
    } finally {
      activeRequests.delete(requestId);
    }
  }
};
