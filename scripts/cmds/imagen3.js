const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { GoatWrapper } = require("fca-liane-utils");

module.exports = {
  config: {
    name: "imagen3", // ✅ New command name
    aliases: [],
    version: "1.0",
    author: "Ew'r Saim",
    countDown: 5,
    role: 0,
    description: {
      vi: "Oculux Imagen3 API diye AI chobi toiri korun",
      en: "Generate an AI image using the Oculux Imagen3 API",
    },
    category: "image generator",
    guide: {
      en: "{pn} <prompt>\n🧪 Example: imagen3 futuristic dragon flying in space",
      vi: "{pn} <prompt>\n🧪 Example: imagen3 futuristic dragon flying in space",
    },
  },

  onStart: async function ({ message, event, args, api }) {
    const prompt = args.join(" ");
    const commandName = this.config.name;

    if (!prompt)
      return message.reply("⚠️ Please provide a prompt.\nExample: imagen3 futuristic dragon flying in space");

    api.setMessageReaction("🎨", event.messageID, () => {}, true);

    message.reply("🖼️ Generating your Imagen3 image... Please wait ⏳", async (info) => {
      const encodedPrompt = encodeURIComponent(prompt);
      const url = `https://api.oculux.xyz/api/imagen3?prompt=${encodedPrompt}`;
      const imgPath = path.join(__dirname, "cache", `imagen3_${event.senderID}.png`);

      try {
        const res = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, res.data);
        message.reply({
          body: `✅ | Here's Your Generated ${commandName} Image`,
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
