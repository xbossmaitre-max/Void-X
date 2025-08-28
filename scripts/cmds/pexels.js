const axios = require('axios');

module.exports = {
  config: {
    name: "tikstalk",
    aliases: ["tiktokstalk", "ttstalk"],
    version: "1.1",
    author: "Aryan Chauhan",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Get full TikTok profile info" },
    description: { en: "Stalk a TikTok profile and get all available info like followers, likes, posts, bio, verification, etc." },
    category: "info",
    guide: { en: "Use: !tikstalk <username>\nExample: !tikstalk aryan" }
  },

  onStart: async function({ api, event, args }) {
    const username = args[0];
    if (!username) {
      return api.sendMessage("⚠️ Please provide a TikTok username.", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get(`https://aryxapi.onrender.com/api/stalker/tiktok/v3`, { params: { username } });
      const data = response.data.result;
      if (!data || !data.users) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("⚠️ User not found or API error.", event.threadID, event.messageID);
      }

      const user = data.users;
      const stats = data.stats;

      const message = `
📛 Username: ${user.username}
👤 Nickname: ${user.nickname}
📝 Bio: ${user.signature || 'N/A'}
✅ Verified: ${user.verified ? 'Yes' : 'No'}
🔒 Private Account: ${user.privateAccount ? 'Yes' : 'No'}
🏷 Commerce User: ${user.commerceUser ? 'Yes' : 'No'}
⏱ Username Modify Time: ${user.usernameModifyTime || 'N/A'}
⏱ Nickname Modify Time: ${user.nicknameModifyTime || 'N/A'}

👥 Followers: ${stats.followerCount}
📤 Following: ${stats.followingCount}
❤️ Likes: ${stats.likeCount}
💗 Hearts: ${stats.heartCount}
🎥 Videos: ${stats.videoCount}
📝 Posts: ${stats.postCount}
🤝 Friends: ${stats.friendCount}
📊 Engagement: ${stats.engagement || 'N/A'}
      `;

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      api.sendMessage({
        body: message,
        attachment: await global.utils.getStreamFromURL(user.avatarLarger, "avatar.jpg")
      }, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("❌ invalid username. Please try again later.", event.threadID, event.messageID);
    }
  }
};
