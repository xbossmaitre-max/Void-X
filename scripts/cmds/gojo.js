const axios = require("axios");

module.exports = {
  config: {
    name: "gojo",
    version: "1.0.0",
    author: "Aryan Chauhan",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Chat with Gojo Satoru (AI)" },
    longDescription: { en: "Talk with Gojo Satoru from Jujutsu Kaisen using AI (continuous conversation)." },
    category: "ai",
    guide: { en: "Use: !gojo <message>\nExample: !gojo hello Gojo" }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ").trim();
    if (!prompt) {
      return api.sendMessage(
        "⚠️ Please provide a message.\nExample: !gojo hello",
        event.threadID,
        event.messageID
      );
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const { data } = await axios.get("https://aryxapi.onrender.com/api/ai/cai", {
        params: { 
          action: "chat", 
          prompt, 
          characterId: "4WOVrCApi4JYwfYwU2e5eDeFalLOkGBw6IfUZPX1XVQ",
          conversationId: event.senderID 
        }
      });

      const text = data?.result?.response || data?.result?.message || "❌ No response from Gojo.";

      if (!global.GoatBot.onReply) global.GoatBot.onReply = new Map();

      api.sendMessage(text, event.threadID, (err, info) => {
        if (err) {
          api.setMessageReaction("❌", event.messageID, () => {}, true);
          return;
        }
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: event.senderID,
          conversationId: event.senderID 
        });
      }, event.messageID);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("❌ Error while contacting Gojo API.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (!Reply || event.senderID !== Reply.author) return;

    const prompt = (event.body || "").trim();
    if (!prompt) return;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const { data } = await axios.get("https://aryxapi.onrender.com/api/ai/cai", {
        params: {
          action: "chat",
          prompt,
          characterId: "4WOVrCApi4JYwfYwU2e5eDeFalLOkGBw6IfUZPX1XVQ", // Gojo character ID
          conversationId: event.senderID 
        }
      });

      const text = data?.result?.response || data?.result?.message || "❌ No response from Gojo.";

      if (!global.GoatBot.onReply) global.GoatBot.onReply = new Map();

      api.sendMessage(text, event.threadID, (err, info) => {
        if (err) {
          api.setMessageReaction("❌", event.messageID, () => {}, true);
          return;
        }
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: event.senderID,
          conversationId: event.senderID
        });
      }, event.messageID);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("❌ Error while continuing chat with Gojo.", event.threadID, event.messageID);
    }
  }
};
