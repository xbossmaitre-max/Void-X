const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pv",
    aliases: ["pm", "voicepv"],
    version: "2.0",
    author: "Aesther",
    countDown: 2,
    role: 0,
    shortDescription: {
      en: "Send vocal or image to UID and reply as a conversation"
    },
    longDescription: {
      en: "Send a voice message or photo via UID. Reply is relayed as vocal or photo. Fully functional."
    },
    category: "🗨️ Messenger",
    guide: {
      en: "{p}pv [UID] [texte ou réponse avec image]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const hasImage = event.attachments && event.attachments.length > 0;
    if (args.length < 1 && !hasImage) {
      return api.sendMessage("📤 Utilisation : {p}pv [UID] [texte ou image]", event.threadID, event.messageID);
    }

    const receiverID = args[0];
    const content = args.slice(1).join(" ") || "";
    const senderID = event.senderID;
    const threadID = event.threadID;

    // === IMAGE ===
    if (hasImage) {
      const imgPath = path.resolve(__dirname, "cache", `pv-img-${Date.now()}.jpg`);
      const res = await axios.get(event.attachments[0].url, { responseType: "stream" });
      const stream = fs.createWriteStream(imgPath);
      await new Promise(resolve => res.data.pipe(stream).on("finish", resolve));

      return api.sendMessage(
        { attachment: fs.createReadStream(imgPath) },
        receiverID,
        (err, info) => {
          fs.unlinkSync(imgPath);
          if (err) return api.sendMessage("❌ Échec de l'envoi de l'image.", threadID);
          api.sendMessage("🖼️ Image envoyée avec succès !", threadID);

          global.GoatBot.onReply.set(info.messageID, {
            commandName: "pv",
            from: senderID,
            to: receiverID,
            fromThread: threadID
          });
        }
      );
    }

    // === VOCAL ===
    const voicePath = path.resolve(__dirname, "cache", `pv-${Date.now()}.mp3`);
    const ttsURL = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(content)}&tl=fr&client=tw-ob`;

    try {
      await global.utils.downloadFile(ttsURL, voicePath);
      api.sendMessage({ attachment: fs.createReadStream(voicePath) }, receiverID, (err, info) => {
        fs.unlinkSync(voicePath);
        if (err) return api.sendMessage("❌ Échec de l'envoi vocal.", threadID);
        api.sendMessage("✅ Vocal envoyé avec succès !", threadID);
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "pv",
          from: senderID,
          to: receiverID,
          fromThread: threadID
        });
      });
    } catch (e) {
      console.error(e);
      api.sendMessage("❌ Erreur pendant l'envoi vocal.", threadID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const fromID = event.senderID;
    const isFromReceiver = fromID === Reply.to;
    const targetID = isFromReceiver ? Reply.from : Reply.to;
    const threadID = isFromReceiver ? Reply.fromThread : event.threadID;

    // === IMAGE ===
    if (event.attachments.length > 0) {
      const filePath = path.resolve(__dirname, "cache", `reply-img-${Date.now()}.jpg`);
      const res = await axios.get(event.attachments[0].url, { responseType: "stream" });
      const stream = fs.createWriteStream(filePath);
      await new Promise(resolve => res.data.pipe(stream).on("finish", resolve));

      return api.sendMessage(
        { attachment: fs.createReadStream(filePath) },
        targetID,
        (err, info) => {
          fs.unlinkSync(filePath);
          if (err) return;
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "pv",
            from: isFromReceiver ? Reply.to : fromID,
            to: isFromReceiver ? fromID : Reply.to,
            fromThread: isFromReceiver ? Reply.fromThread : event.threadID
          });
        }
      );
    }

    // === VOCAL ===
    const content = event.body || "(vide)";
    const voicePath = path.resolve(__dirname, "cache", `reply-${Date.now()}.mp3`);
    const ttsURL = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(content)}&tl=fr&client=tw-ob`;

    try {
      await global.utils.downloadFile(ttsURL, voicePath);
      api.sendMessage({ attachment: fs.createReadStream(voicePath) }, targetID, (err, info) => {
        fs.unlinkSync(voicePath);
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "pv",
          from: isFromReceiver ? Reply.to : fromID,
          to: isFromReceiver ? fromID : Reply.to,
          fromThread: isFromReceiver ? Reply.fromThread : event.threadID
        });
      });
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Erreur lors de la réponse vocale.", threadID);
    }
  }
};
