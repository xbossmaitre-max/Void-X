const axios = require("axios");

module.exports = {
  config: {
    name: "animefy",
    aliases: ["i2a"],
    version: "1.0",
    author: "Aryan Chauhan",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Convert image into anime style" },
    longDescription: { en: "Transform a normal image into anime style using AI." },
    category: "ai",
    guide: { en: "Use: animefy <imageUrl> or reply to an image." }
  },

  onStart: async function ({ api, event, args }) {
    let imageUrl = args[0];

    if (
      !imageUrl &&
      event.messageReply &&
      event.messageReply.attachments &&
      event.messageReply.attachments.length > 0
    ) {
      const attachment = event.messageReply.attachments[0];
      if (attachment.type === "photo" || attachment.type === "image") {
        imageUrl = attachment.url || attachment.previewUrl;
      }
    }

    if (!imageUrl) {
      return api.sendMessage(
        "⚠️ Please provide an image URL or reply to a message with an image.",
        event.threadID,
        event.messageID
      );
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get(
        "https://aryxapi.onrender.com/api/ai/img2img/gen/v1",
        { params: { imageUrl } }
      );

      if (!response.data.success || !response.data.imageUrl) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage(
          "❌ Failed to generate anime image. Please try again.",
          event.threadID,
          event.messageID
        );
      }

      const animeUrl = response.data.imageUrl;

      const stream = await global.utils.getStreamFromURL(animeUrl, "anime.webp");

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      api.sendMessage(
        {
          body: `✨ Here's your anime-style image!\n\n🖼️ File: ${response.data.fileName}\n⚡ Render Time: ${response.data.duration.toFixed(
            2
          )}s\n📊 Avg Duration: ${response.data.averageDuration.toFixed(2)}s`,
          attachment: stream,
        },
        event.threadID,
        event.messageID
      );
    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage(
        "❌ An error occurred while generating the anime image.",
        event.threadID,
        event.messageID
      );
    }
  },
};
