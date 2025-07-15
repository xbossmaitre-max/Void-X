const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { GoatWrapper } = require("fca-liane-utils");

module.exports = {
  config: {
    name: "visionary", // Command name
    aliases: [],
    version: "1.0",
    author: "Ew'r Saim",
    countDown: 5,
    role: 0,
    description: {
      vi: "Tạo ảnh phong cách visionary bằng AI",
      en: "Generate a visionary-style image using the API",
    },
    category: "image generator",
    guide: {
      en: "<prompt> to generate a visionary-style image\n🧪 Example: visionary Naruto Uzumaki",
      vi: "<prompt> để tạo ảnh visionary bằng AI\n🧪 Example: visionary Naruto Uzumaki",
    },
  },

  onStart: async function ({ message, event, args, api }) {
    const prompt = args.join(" ");
    const commandName = this.config.name;

    if (!prompt)
      return message.reply("⚠️ Please enter a prompt.\nExample: visionary Naruto Uzumaki");

    api.setMessageReaction("🧠", event.messageID, () => {}, true);

    message.reply("🧠 Generating your visionary image, please wait...", async (info) => {
      const encodedPrompt = encodeURIComponent(prompt);
      const url = `https://api.oculux.xyz/api/visionary?prompt=${encodedPrompt}`;
      const imgPath = path.join(__dirname, "cache", `${commandName}_${event.senderID}.png`);

      try {
        const res = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, res.data);

        message.reply({
          body: `✅ | Here's your generated ${commandName} image`,
          attachment: fs.createReadStream(imgPath),
        }, () => {
          fs.unlinkSync(imgPath);
          api.unsendMessage(info.messageID);
        });

      } catch (err) {
        console.error("Image generation failed:", err);
        message.reply("❌ Failed to generate the image. Please try again later.");
      }
    });
  },
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
