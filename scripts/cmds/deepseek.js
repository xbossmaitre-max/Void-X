const axios = require("axios");

module.exports = {
  config: {
    name: "deepseek",
    aliases: ["ds", "deepai"],
    version: "1.2",
    author: "Aryan Chauhan",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Chat with DeepSeek AI" },
    longDescription: { en: "Talk with DeepSeek AI without conversation memory." },
    category: "ai",
    guide: { en: "Use: !deepseek <message>\nExample: !deepseek hello" }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage(
        "⚠️ Please provide a message to start chatting.\nExample: !deepseek hello",
        event.threadID,
        event.messageID
      );
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get("https://arychauhann.onrender.com/api/deepseek", {
        params: { prompt }
      });

      if (!response.data || !response.data.result) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("❌ DeepSeek did not return a response.", event.threadID, event.messageID);
      }

      const answer = response.data.result
        .replace(/<think>|<\/think>/g, "")
        .replace(/<br\s*\/?>/gi, "\n")
        .trim();

      api.sendMessage(`${answer}`, event.threadID, (err, info) => {
        if (err) return;
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: event.senderID
        });
      }, event.messageID);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("❌ An error occurred while contacting DeepSeek AI.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const prompt = event.body;
    if (!prompt) return;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get("https://arychauhann.onrender.com/api/deepseek", {
        params: { prompt }
      });

      if (!response.data || !response.data.result) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("❌ DeepSeek did not return a response.", event.threadID, event.messageID);
      }

      const answer = response.data.result
        .replace(/<think>|<\/think>/g, "")
        .replace(/<br\s*\/?>/gi, "\n")
        .trim();

      api.sendMessage(`${answer}`, event.threadID, (err, info) => {
        if (err) return;
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: event.senderID
        });
      }, event.messageID);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("❌ An error occurred while chatting with DeepSeek AI.", event.threadID, event.messageID);
    }
  }
};
