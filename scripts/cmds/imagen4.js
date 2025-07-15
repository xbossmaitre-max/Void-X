const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { GoatWrapper } = require("fca-liane-utils");

module.exports = {
  config: {
    name: "imagen4",
    aliases: [],
    version: "1.0",
    author: "Ew'r Saim |api by renz",
    countDown: 5,
    role: 0,
    description: {
      vi: "Oculux Imagen4 API",
      en: "Generate an AI image using the Oculux Imagen4 API",
    },
    category: "image generator",
    guide: {
      en: "{pn} <prompt>\n🧪 Example: imagen4 futuristic city at night",
      vi: "{pn} <prompt>\n🧪 Example: imagen4 futuristic city at night",
    },
  },

  onStart: async function ({ message, event, args, api }) {
    const prompt = args.join(" ");
    const commandName = this.config.name;

    if (!prompt)
      return message.reply("⚠️ Please provide a prompt.\nExample: imagen4 futuristic city at night");

    api.setMessageReaction("🎨", event.messageID, () => {}, true);

    message.reply("🖼️ Generating your Imagen4 image... Please wait ⏳", async (info) => {
      const encodedPrompt = encodeURIComponent(prompt);
      const url = `https://api.oculux.xyz/api/imagen4?prompt=${encodedPrompt}`;
      const imgPath = path.join(__dirname, "cache", `imagen4_${event.senderID}.png`);

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
