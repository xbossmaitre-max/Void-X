const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

const adminNotifyID = "61568791604271"; // 🛡️ ID de l'admin pour notifier en cas de unsend

if (!global.resendCache) global.resendCache = new Map();

module.exports = {
  config: {
    name: "resend",
    version: "2.0",
    author: "Aesther (convert from TOHI-BOT)",
    role: 1,
    shortDescription: "🔄 Réexpédie les messages supprimés (texte, photos, vidéos...)",
    longDescription: "Active ou désactive la surveillance des messages supprimés dans le groupe.",
    category: "🛠️ Admin",
    guide: "{pn} : activer/désactiver le système resend dans ce groupe"
  },

  onStart: async function ({ api, event, Threads }) {
    const threadID = event.threadID;
    const threadData = (await Threads.getData(threadID)).data || {};

    threadData.resend = !threadData.resend;
    await Threads.setData(threadID, { data: threadData });
    global.data.threadData.set(threadID, threadData);

    return api.sendMessage(
      `📢 𝗥𝗲𝘀𝗲𝗻𝗱 : ${threadData.resend ? "✅ 𝗔𝗖𝗧𝗜𝗩𝗘́" : "❌ 𝗗𝗘́𝗦𝗔𝗖𝗧𝗜𝗩𝗘́"}\nRéutilise la commande pour inverser.`,
      threadID,
      event.messageID
    );
  },

  onChat: async function ({ event }) {
    const { messageID, senderID, threadID, body, attachments = [], type } = event;
    if (!global.data.botID) return;

    // Ignore messages envoyés par le bot
    if (senderID === global.data.botID) return;

    // Si désactivé dans ce thread
    const threadData = global.data.threadData.get(threadID) || {};
    if (threadData.resend === false) return;

    // Cache le message
    if (type === "message") {
      global.resendCache.set(messageID, {
        msgBody: body,
        attachment: attachments,
        senderID
      });
    }

    // Si message supprimé
    if (type === "message_unsend") {
      const cached = global.resendCache.get(messageID);
      if (!cached) return;

      const senderName = global.data.userName.get(cached.senderID) || "Utilisateur inconnu";
      const targets = [threadID, adminNotifyID];

      for (const target of targets) {
        try {
          // Sans fichier
          if (!cached.attachment || cached.attachment.length === 0) {
            await api.sendMessage(
              `🔄 ${senderName} a supprimé un message !\n\n📝 𝗖𝗼𝗻𝘁𝗲𝗻𝘂 :\n${cached.msgBody || "Aucun texte."}`,
              target
            );
          } else {
            // 📎 Fichiers
            let files = [];
            let count = 0;
            for (const att of cached.attachment) {
              count++;
              const ext = (att.type === "photo") ? "jpg" :
                          (att.type === "video") ? "mp4" :
                          (att.type === "audio") ? "mp3" :
                          (att.type === "file") ? "bin" : "dat";
              const filePath = path.join(__dirname, `cache/resend_${Date.now()}_${count}.${ext}`);

              try {
                const res = await axios.get(att.url, { responseType: "arraybuffer" });
                fs.writeFileSync(filePath, Buffer.from(res.data));
                files.push(fs.createReadStream(filePath));
              } catch (err) {
                console.log("[Resend] 📛 Erreur téléchargement :", err.message);
              }
            }

            if (files.length > 0) {
              await api.sendMessage({
                body: `🔄 ${senderName} a supprimé un message avec pièce(s) jointe(s).\n\n📝 𝗧𝗲𝘅𝘁𝗲 : ${cached.msgBody || "Aucun texte."}`,
                attachment: files
              }, target);

              // 🧹 Clear cache
              setTimeout(() => {
                files.forEach(file => {
                  if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
                });
              }, 5000);
            } else {
              await api.sendMessage(
                `🔄 ${senderName} a supprimé un message avec fichier(s), mais ils n'ont pas pu être récupérés.`,
                target
              );
            }
          }
        } catch (err) {
          console.log(`[Resend] ⚠️ Erreur d'envoi à ${target} :`, err.message);
        }
      }

      global.resendCache.delete(messageID); // 🔚 Nettoyage final
    }
  }
};
