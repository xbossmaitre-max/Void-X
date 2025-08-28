const axios = require("axios");
const GPT4 = "https://g4ai.vercel.app";

async function handlePrompt({ api, event, prompt }) {
  const sessionId = event.senderID;

  if (!prompt) {
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    return api.sendMessage(
      "❌ Please provide a prompt or use 'clear' to clear chat history or 'new' to start a new conversation.",
      event.threadID,
      event.messageID
    );
  }

  if (prompt.toLowerCase() === "clear") {
    try {
      await axios.delete(`${GPT4}/conversations/${sessionId}/clear`);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      return api.sendMessage("✅ Chat history cleared successfully!", event.threadID, event.messageID);
    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage("❌ Error clearing chat history: " + error.message, event.threadID, event.messageID);
    }
  }

  try {
    const response = await axios.get(`${GPT4}/chat`, {
      params: {
        prompt: prompt,
        sessionId: sessionId
      }
    });

    const buffer = response.data?.reply || response.data;

    if (!buffer || !buffer.toString().trim()) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage("⚠️ No response from AI API.", event.threadID, event.messageID);
    }

    const formattedResponse = buffer.toString().trim();
    api.sendMessage(formattedResponse, event.threadID, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "gpt4",
          author: event.senderID,
          messageID: info.messageID
        });
        api.setMessageReaction("✅", info.messageID, () => {}, true);
      } else {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
    }, event.messageID);

  } catch (err) {
    console.error("API Error:", err.message);
    api.setMessageReaction("❌", event.messageID, () => {}, true);

    if (err.code === "ECONNREFUSED") {
      api.sendMessage("❌ Cannot connect to AI server. Please make sure the server is running.", event.threadID, event.messageID);
    } else {
      api.sendMessage("❌ Error: " + err.message, event.threadID, event.messageID);
    }
  }
}

module.exports = {
  config: {
    name: "gpt4",
    version: "1.7",
    author: "Aryan Chauhan",
    countDown: 0,
    role: 0,
    shortDescription: {
      en: "GPT-4"
    },
    longDescription: {
      en: "Ask questions from GPT-4 with conversation history per user"
    },
    category: "ai",
    guide: {
      en: "{pn} <your question>\n{pn} clear - Clear conversation history\nOr just type gpt4 <your question> without prefix."
    }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    await handlePrompt({ api, event, prompt });
  },

  onChat: async function ({ api, event, isUserCallCommand }) {
    if (isUserCallCommand) return;
    const body = event.body?.trim();
    if (!body || !body.toLowerCase().startsWith("gpt4")) return;

    const prompt = body.slice(4).trim();
    if (!prompt) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage("❌ Please enter your question after 'gpt4'", event.threadID, event.messageID);
    }

    await handlePrompt({ api, event, prompt });
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;
    const prompt = event.body;
    await handlePrompt({ api, event, prompt });
  }
};
