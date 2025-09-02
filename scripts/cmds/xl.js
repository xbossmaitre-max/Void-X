const axios = require("axios");
const fs = require("fs");
const path = require("path");

const defaultPrompts = [
  "1girl, makima (chainsaw man), chainsaw man, black jacket, black necktie, black pants, braid, business suit, fingernails, formal, hand on own chin, jacket on shoulders, light smile, long sleeves, looking at viewer, looking up, medium breasts, office lady, smile, solo, suit, upper body, white shirt, outdoors",
  "1girl, souryuu asuka langley, neon genesis evangelion, plugsuit, pilot suit, red bodysuit, sitting, crossing legs, black eye patch, cat hat, throne, symmetrical, looking down, from bottom, looking at viewer, outdoors",
  "1boy, male focus, gojou satoru, jujutsu kaisen, black jacket, blindfold lift, blue eyes, glowing, glowing eyes, high collar, jacket, jujutsu tech uniform, solo, grin, white hair",
  "1girl, cagliostro, granblue fantasy, violet eyes, standing, hand on own chin, looking at object, smile, closed mouth, table, beaker, glass tube, experiment apparatus, dark room, laboratory"
];

module.exports = {
  config: {
    name: "xl",
    version: "1.6",
    author: "Aryan Chauhan",
    countDown: 5,
    role: 0,
    shortDescription: "Generate anime images.",
    category: "ai",
    guide: {
      en: "{pn} <prompt>\nExample: {pn} cat"
    }
  },

  onStart: async function ({ api, event, args }) {
    let prompt = args.length
      ? args.join(" ")
      : defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];

    const filePath = path.join(__dirname, "xl.png");

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const generatingMsgID = (await new Promise(resolve =>
        api.sendMessage("⏳ Generating your image, please wait...", event.threadID, (err, info) => {
          resolve(err ? null : info.messageID);
        }, event.messageID)
      ));

      const { data } = await axios.get(
        `https://aryanapi.vercel.app/api/xl?prompt=${encodeURIComponent(prompt)}`
      );

      if (!data?.status || !data?.url) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        if (generatingMsgID) api.unsendMessage(generatingMsgID);
        return api.sendMessage("❌ Failed to generate image.", event.threadID, event.messageID);
      }

      const imageResponse = await axios.get(data.url, { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);

      imageResponse.data.pipe(writer);

      writer.on("error", () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        if (generatingMsgID) api.unsendMessage(generatingMsgID);
        api.sendMessage("❌ Failed to save image file.", event.threadID, event.messageID);
      });

      writer.on("finish", () => {
        api.sendMessage(
          { attachment: fs.createReadStream(filePath) },
          event.threadID,
          () => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            api.setMessageReaction("✅", event.messageID, () => {}, true);
            if (generatingMsgID) api.unsendMessage(generatingMsgID);
          },
          event.messageID
        );
      });

    } catch (err) {
      console.error(err);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("❌ Error: Unable to generate image. Please try again later.", event.threadID, event.messageID);
    }
  }
};
