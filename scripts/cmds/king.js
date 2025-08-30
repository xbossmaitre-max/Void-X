module.exports = {
  config: {
    name: "king",
    version: "1.0",
    author: "Messie Osango",
    countDown: 5,
    role: 1,
    shortDescription: "Ajoute un admin au groupe",
    longDescription: "Ajoute un utilisateur comme administrateur du groupe actuel",
    category: "admin"
  },

  onStart: async function ({ event, api, args }) {
    const threadID = event.threadID;
    const uid = event.type === "message_reply"
      ? event.messageReply.senderID
      : args[0];

    if (!global.GoatBot.config.adminBot.includes(event.senderID)) return;

    if (!uid || isNaN(uid)) return api.sendMessage("UID invalide.", threadID, event.messageID);

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const currentAdmins = threadInfo.adminIDs.map(item => item.id);

      if (currentAdmins.includes(uid)) {
        return api.sendMessage("Cette personne est déjà administrateur.", threadID, event.messageID);
      }

      await api.changeAdminStatus(threadID, uid, true);
      api.sendMessage(`Ajouté en tant qu'admin du groupe : ${uid}`, threadID, event.messageID);
    } catch {
      api.sendMessage("Impossible d'ajouter cet utilisateur comme admin.", threadID, event.messageID);
    }
  }
};
