const axios = require("axios");

module.exports = {
  config: {
    name: "metaai",
    aliases: ["meta"],
    version: "1.2",
    author: "Aryan Chauhan",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Chat with Meta AI" },
    longDescription: { en: "Talk with Meta AI without conversation memory." },
    category: "ai",
    guide: { en: "Use: !meta <message>\nExample: !meta hello" }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage(
        "⚠️ Please provide a message to start chatting.\nExample: !meta hello",
        event.threadID,
        event.messageID
      );
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get("https://aryxapi.onrender.com/api/ai/meta", {
        params: { prompt }
      });

      if (!response.data || !response.data.result) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("❌ Meta AI did not return a response.", event.threadID, event.messageID);
      }

      api.sendMessage(`${response.data.result}`, event.threadID, (err, info) => {
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
      api.sendMessage("❌ An error occurred while contacting Meta AI.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const prompt = event.body;
    if (!prompt) return;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get("https://aryxapi.onrender.com/api/ai/meta", {
        params: { prompt }
      });

      if (!response.data || !response.data.result) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("❌ Meta AI did not return a response.", event.threadID, event.messageID);
      }

      api.sendMessage(`${response.data.result}`, event.threadID, (err, info) => {
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
      api.sendMessage("❌ An error occurred while chatting with Meta AI.", event.threadID, event.messageID);
    }
  }
};
