const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const DATA_PATH = path.join(__dirname, "claude_model_data.json");
const DEFAULT_MODEL = "claude-opus-4-20250514";
const MAX_HISTORY = 25;

// Initialisation sécurisée du fichier de données
if (!fs.existsSync(DATA_PATH)) {
  fs.ensureFileSync(DATA_PATH);
  fs.writeFileSync(DATA_PATH, JSON.stringify({}));
}

// Cache mémoire pour les historiques
const activeHistories = new Map();

const modelDescriptions = {
  "claude-opus-4-20250514": "🧠 Claude Opus (mai 2025) - Le plus puissant",
  "claude-sonnet-4-20250514": "⚡ Claude Sonnet (mai 2025) - Équilibre parfait",
  "claude-3-7-sonnet-20250219": "📘 Claude Sonnet (fév 2025) - Version intermédiaire",
  "claude-3-5-sonnet-20241022": "🌐 Claude Sonnet (oct 2024) - Version stable",
  "claude-3-5-haiku-20241022": "⚡ Claude Haiku (oct 2024) - Léger et rapide",
  "claude-3-5-sonnet-20240620": "📊 Claude Sonnet (juin 2024) - Version estivale",
  "claude-3-haiku-20240307": "🚀 Claude Haiku (mars 2024) - Ultra rapide",
  "claude-3-opus-20240229": "🎯 Claude Opus (fév 2024) - Précision maximale",
  "claude-3-sonnet-20240229": "🧪 Claude Sonnet (fév 2024) - Version expérimentale",
  "claude-2.1": "📚 Claude 2.1 - Version classique",
  "claude-2.0": "🏛 Claude 2.0 - Version historique"
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
  const dir = path.join(__dirname, 'claude_uids');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${uid}_claude_history.json`);
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
    name: "claude",
    aliases: ["claudex"],
    version: "1.0",
    author: "ꗇ︱Blẳȼk 义",
    countDown: 5,
    role: 0,
    shortDescription: "𝗜𝗔 𝗖𝗹𝗮𝘂𝗱𝗲 𝗮𝘃𝗲𝗰 𝘁𝗼𝘂𝘀 𝗹𝗲𝘀 𝗺𝗼𝗱è𝗹𝗲𝘀 🤖",
    longDescription: "𝗣𝗼𝘀𝗲 𝘂𝗻𝗲 𝗾𝘂𝗲𝘀𝘁𝗶𝗼𝗻 𝗮̀ 𝗖𝗹𝗮𝘂𝗱𝗲, 𝗰𝗵𝗮𝗻𝗴𝗲 𝗱𝗲 𝗺𝗼𝗱è𝗹𝗲 𝗼𝘂 𝗹𝗶𝘀𝘁𝗲 𝗹𝗲𝘀 𝗺𝗼𝗱è𝗹𝗲𝘀 ✨ 𝗮𝘃𝗲𝗰 𝗺é𝗺𝗼𝗶𝗿𝗲 𝗱𝗲 𝗰𝗼𝗻𝘃𝗲𝗿𝘀𝗮𝘁𝗶𝗼𝗻",
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
          const res = await axios.get("https://haji-mix-api.gleeze.com/api/anthropic", {
            params: {
              ask: "Bonjour",
              model: DEFAULT_MODEL,
              uid,
              stream: false,
              api_key: "3692d288fc78ac891307d28a4b016fe6d2b047062794e61cc83c0dd9ef7a9b2b"
            }
          });

          const models = res.data.supported_models || [];
          let msg = stylize("📄 | 𝗟𝗶𝘀𝘁𝗲 𝗱𝗲𝘀 𝗺𝗼𝗱è𝗹𝗲𝘀 𝗖𝗹𝗮𝘂𝗱𝗲 𝗱𝗶𝘀𝗽𝗼𝗻𝗶𝗯𝗹𝗲𝘀 :\n\n");
          models.forEach((m, i) => {
            const desc = modelDescriptions[m] || "— Aucun résumé disponible.";
            msg += stylize(`${i + 1}. ${m}${m === db[uid] ? " ✅" : ""}\n   → ${desc}\n`);
          });

          return message.reply(msg);
        } catch (err) {
          return message.reply(stylize("❌ | 𝗜𝗺𝗽𝗼𝘀𝘀𝗶𝗯𝗹𝗲 𝗱𝗲 𝗿é𝗰𝘂𝗽é𝗿𝗲𝗿 𝗹𝗮 𝗹𝗶𝘀𝘁𝗲."));
        }
      }

      if (command === "set") {
        const index = parseInt(args[1]);
        if (isNaN(index)) return message.reply(stylize("❌ | 𝗨𝘁𝗶𝗹𝗶𝘀𝗮𝘁𝗶𝗼𝗻 : claudex set <numéro>"));

        try {
          const res = await axios.get("https://haji-mix-api.gleeze.com/api/anthropic", {
            params: {
              ask: "test",
              model: DEFAULT_MODEL,
              uid,
              stream: false,
              api_key: "3692d288fc78ac891307d28a4b016fe6d2b047062794e61cc83c0dd9ef7a9b2b"
            }
          });

          const models = res.data.supported_models || [];
          if (index < 1 || index > models.length) {
            return message.reply(stylize("❌ | 𝗡𝘂𝗺é𝗿𝗼 𝗶𝗻𝘃𝗮𝗹𝗶𝗱𝗲. Tape `claudex list` pour voir."));
          }

          const selected = models[index - 1];
          db[uid] = selected;
          fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2));
          return message.reply(stylize(`✅ | 𝗠𝗼𝗱è𝗹𝗲 𝗖𝗹𝗮𝘂𝗱𝗲 **${selected}** 𝘀é𝗹𝗲𝗰𝘁𝗶𝗼𝗻𝗻é.`));
        } catch {
          return message.reply(stylize("❌ | 𝗘𝗿𝗿𝗲𝘂𝗿 𝗹𝗼𝗿𝘀 𝗱𝗲 𝗹𝗮 𝘀é𝗹𝗲𝗰𝘁𝗶𝗼𝗻."));
        }
      }

      if (command === "clean") {
        const success = cleanUserHistory(uid);
        return message.reply(
          stylize(success 
            ? "🧠 | 𝗩𝗼𝘁𝗿𝗲 𝗵𝗶𝘀𝘁𝗼𝗿𝗶𝗾𝘂𝗲 𝗖𝗹𝗮𝘂𝗱𝗲 𝗮 𝗲́𝘁𝗲́ 𝘀𝘂𝗽𝗽𝗿𝗶𝗺𝗲́"
            : "🌍 | 𝗔𝘂𝗰𝘂𝗻 𝗵𝗶𝘀𝘁𝗼𝗿𝗶𝗾𝘂𝗲 𝗖𝗹𝗮𝘂𝗱𝗲 𝗮̀ 𝘀𝘂𝗽𝗽𝗿𝗶𝗺𝗲𝗿"
          )
        );
      }

      const question = args.join(" ");
      if (!question) {
        return message.reply(stylize("❓ | 𝗣𝗼𝘀𝗲 𝘂𝗻𝗲 𝗾𝘂𝗲𝘀𝘁𝗶𝗼𝗻 𝗼𝘂 𝘂𝘁𝗶𝗹𝗶𝘀𝗲 `claudex list` 𝗼𝘂 `claudex set <numéro>`."));
      }

      const model = db[uid];
      api.setMessageReaction("🧠", event.messageID, () => {}, true);

      try {
        const userData = loadChatHistory(uid);
        const { history } = userData;
        
        // Construire le contexte avec l'historique
        const context = history.map(entry => 
          `${entry.role === 'user' ? 'User' : 'Claude'}: ${entry.message}`
        ).join('\n');
        
        const fullPrompt = context ? `${context}\nUser: ${question}` : question;

        const res = await axios.get("https://haji-mix-api.gleeze.com/api/anthropic", {
          params: {
            ask: fullPrompt,
            model,
            uid,
            stream: false,
            api_key: "3692d288fc78ac891307d28a4b016fe6d2b047062794e61cc83c0dd9ef7a9b2b"
          }
        });

        const answer = res.data.answer || stylize("🤖 | 𝗔𝘂𝗰𝘂𝗻𝗲 𝗿é𝗽𝗼𝗻𝘀𝗲 𝗿𝗲ç𝘂𝗲 𝗱𝗲 𝗖𝗹𝗮𝘂𝗱𝗲.");
        
        const newHistory = [
          ...history,
          { role: "user", message: question },
          { role: "bot", message: answer }
        ];
        
        saveChatHistory(uid, { ...userData, history: newHistory });
        api.setMessageReaction("🌍", event.messageID, () => {}, true);

        const formattedResponse = 
          `🧠|${stylize(`(${model.toLowerCase()})`)}\n` +
          `${stylize("━━━━━━━━━━━━━━━━━━━")}\n` +
          `${answer}\n` +
          `${stylize("━━━━━━━━━━━━━━━━━━━")}\n` +
          `🌍|${stylize("𝗖𝗟𝗔𝗨𝗗𝗘-𝗫 𝗙𝗢𝗥 𝗙𝗥𝗘𝗘")}`;

        const replyMessage = await message.reply(formattedResponse);

        if (replyMessage?.messageID) {
          global.GoatBot.onReply.set(replyMessage.messageID, {
            commandName: "claude",
            author: uid,
            threadID: event.threadID
          });
        }

      } catch (err) {
        console.error("Claude Error:", err);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(stylize("❌ | 𝗘𝗿𝗿𝗲𝘂𝗿 𝗹𝗼𝗿𝘀 𝗱𝗲 𝗹𝗮 𝗿𝗲𝗾𝘂ê𝘁𝗲 à 𝗖𝗹𝗮𝘂𝗱𝗲."));
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
        return message.reply(stylize("🧠 | 𝗣𝗼𝘀𝗲𝘇 𝘃𝗼𝘁𝗿𝗲 𝗾𝘂𝗲𝘀𝘁𝗶𝗼𝗻 à 𝗖𝗹𝗮𝘂𝗱𝗲..."));
      }

      const db = fs.existsSync(DATA_PATH) ? JSON.parse(fs.readFileSync(DATA_PATH)) : {};
      const uid = event.senderID;
      const model = db[uid] || DEFAULT_MODEL;

      api.setMessageReaction("🧠", event.messageID, () => {}, true);

      const userData = loadChatHistory(uid);
      const { history } = userData;
      
      const context = history.map(entry => 
        `${entry.role === 'user' ? 'User' : 'Claude'}: ${entry.message}`
      ).join('\n');
      
      const fullPrompt = context ? `${context}\nUser: ${prompt}` : prompt;

      const res = await axios.get("https://haji-mix-api.gleeze.com/api/anthropic", {
        params: {
          ask: fullPrompt,
          model,
          uid,
          stream: false,
          api_key: "3692d288fc78ac891307d28a4b016fe6d2b047062794e61cc83c0dd9ef7a9b2b"
        }
      });

      const answer = res.data.answer || stylize("🤖 | 𝗔𝘂𝗰𝘂𝗻𝗲 𝗿é𝗽𝗼𝗻𝘀𝗲 𝗿𝗲ç𝘂𝗲 𝗱𝗲 𝗖𝗹𝗮𝘂𝗱𝗲.");
      
      const newHistory = [
        ...history,
        { role: "user", message: prompt },
        { role: "bot", message: answer }
      ];
      
      saveChatHistory(uid, { ...userData, history: newHistory });
      api.setMessageReaction("🌍", event.messageID, () => {}, true);

      const formattedResponse = 
        `🧠|${stylize(`(${model.toLowerCase()})`)}\n` +
        `${stylize("━━━━━━━━━━━━━━━━━━━")}\n` +
        `${answer}\n` +
        `${stylize("━━━━━━━━━━━━━━━━━━━")}\n` +
        `🌍|${stylize("𝗖𝗟𝗔𝗨𝗗𝗘-𝗫 𝗙𝗢𝗥 𝗙𝗥𝗘𝗘")}`;

      const replyMessage = await message.reply(formattedResponse);

      if (replyMessage?.messageID) {
        global.GoatBot.onReply.set(replyMessage.messageID, {
          commandName: "claude",
          author: uid,
          threadID: event.threadID
        });
      }
    } catch (err) {
      console.error("Reply Error:", err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply(stylize("❌ | 𝗘𝗿𝗿𝗲𝘂𝗿 𝗹𝗼𝗿𝘀 𝗱𝗲 𝗹𝗮 𝗿é𝗽𝗼𝗻𝘀𝗲 𝗱𝗲 𝗖𝗹𝗮𝘂𝗱𝗲."));
    } finally {
      activeRequests.delete(requestId);
    }
  }
};
