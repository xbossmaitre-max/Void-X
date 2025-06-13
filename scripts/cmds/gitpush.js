const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "git",
    aliases: [" gitpush" , "gitup"]
    version: "1.0",
    author: "Chitron Bhattacharjee",
    countDown: 10,
    role: 2, // Only bot owner
    shortDescription: "Upload files to GitHub (INSECURE)",
    longDescription: "⚠️ WARNING: GitHub token is HARDCODED in this file",
    category: "owner",
    guide: { en: "{pn} filename.js content" }
  },

  onStart: async function ({ api, event, args, message }) {
    // Your allowed UID
    const allowedUID = "100081330372098"; 

    // ⚠️ YOUR GITHUB TOKEN (INSECURE!)
    const githubToken = "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"; 

    // Security checks
    if (event.senderID !== allowedUID) 
      return message.reply("🚫 Access Denied");

    if (!args[0] || !args[1]) 
      return message.reply("❌ Format: gitpush filename.js content");

    try {
      const fileName = args[0];
      const fileContent = args.slice(1).join(" ");
      const repoOwner = "brandchitron";
      const repoName = "ShipuAiGoatBot";
      const branch = "main";
      const folderPath = "scripts/cmds";

      // GitHub API request
      const response = await axios.put(
        `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}/${fileName}`,
        {
          message: `Bot upload: ${fileName}`,
          content: Buffer.from(fileContent).toString("base64"),
          branch: branch
        },
        {
          headers: {
            "Authorization": `token ${githubToken}`,
            "User-Agent": "Node.js"
          }
        }
      );

      message.reply(`✅ Uploaded to GitHub!\n🔗 ${response.data.content.html_url}`);
    } catch (error) {
      console.error(error);
      message.reply(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
  }
};
