const axios = require('axios');

module.exports = {
  config: {
    name: "instastalk",
    aliases: ["igstalk"],
    version: "1.0",
    author: "Aryan Chauhan",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get Instagram profile info"
    },
    description: {
      en: "Stalk an Instagram profile and get details like followers, bio, profile picture, etc."
    },
    category: "info",
    guide: {
      en: "Use the command: !instastalk <username>\nExample: !instastalk arychauhann"
    }
  },

  onStart: async function({ api, event, args }) {
    const username = args[0];
    if (!username) {
      return api.sendMessage("⚠️ Please provide an Instagram username.", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get(`https://aryxapi.onrender.com/api/stalker/instagram/v6`, {
        params: { query: username }
      });

      const data = response.data;
      if (!data || !data.username) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("⚠️ User not found or API error.", event.threadID, event.messageID);
      }

      const message = `
📛 Username: ${data.username}
👤 Full Name: ${data.fullName || 'N/A'}
📝 Bio: ${data.bio || 'N/A'}
👥 Followers: ${data.followers || '0'}
📤 Uploads: ${data.uploads || '0'}
📊 Engagement: ${data.engagement || '0%'}
✅ Verified: ${data.isVerified ? 'Yes' : 'No'}
      `;

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      api.sendMessage({
        body: message,
        attachment: await global.utils.getStreamFromURL(data.profileImage, "profile.jpg")
      }, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("❌ invalid username. Please try again later.", event.threadID, event.messageID);
    }
  }
};
