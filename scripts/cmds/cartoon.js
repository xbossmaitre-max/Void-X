const axios = require('axios');

module.exports = {
  config: {
    name: "cartoon",
    version: "1.1",
    author: "Aryan Chauhan",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Cartoonify an image" },
    description: { en: "Convert an image into a cartoon style using API." },
    category: "ai",
    guide: { en: "Use: !cartoon <imageUrl> or reply to a message containing an image URL" }
  },

  onStart: async function({ api, event, args }) {
    let imageUrl = args[0];

    if (!imageUrl && event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
      const attachment = event.messageReply.attachments[0];
      if (attachment.type === "photo" || attachment.type === "image") {
        imageUrl = attachment.url || attachment.previewUrl;
      }
    }

    if (!imageUrl) {
      return api.sendMessage("⚠️ Please provide an image URL or reply to a message with an image.", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get("https://aryxapi.onrender.com/api/tools/cartoon/v1", {
        params: { imageUrl }
      });

      if (response.data.status !== 2 && !response.data.videoUrl && !response.data.pics) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("❌ Failed to generate cartoon. Please try again.", event.threadID, event.messageID);
      }

      const cartoonUrl = response.data.videoUrl || (response.data.pics && JSON.parse(response.data.pics)[0]);

      if (!cartoonUrl) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("⚠️ Cartoon URL not found in response.", event.threadID, event.messageID);
      }

      const stream = await global.utils.getStreamFromURL(cartoonUrl, "cartoon.jpg");

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      api.sendMessage({
        body: "🎨 Here's your cartoonized image!",
        attachment: stream
      }, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("❌ An error occurred while cartoonifying the image.", event.threadID, event.messageID);
    }
  }
};
