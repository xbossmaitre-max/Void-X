const adminID = "61568791604271"; // <-- Remplace ceci par ton UID Facebook si différent

module.exports = { config: { name: "groupe", version: "2.0", author: "Aesther", role: 2, countDown: 5, shortDescription: "📂 Voir les groupes disponibles et s'y faire ajouter", longDescription: "Affiche la liste des groupes connus. Répond avec un numéro pour y être ajouté automatiquement.", category: "admin", guide: { fr: "{pn} → Affiche les groupes, puis réponds avec un numéro." } },

onStart: async function ({ threadsData, message, event }) { const allThreads = await threadsData.getAll(); const validThreads = allThreads.filter(t => t.threadID.length > 15);

if (validThreads.length === 0)
  return message.reply("❌ | Aucun groupe disponible.");

const list = validThreads.map((t, i) => `🧭 ${i + 1}. ${t.threadName}\n🆔 ${t.threadID}`).join("\n\n");
const replyMsg = await message.reply(`🎯 𝗟𝗶𝘀𝘁𝗲 𝗱𝗲𝘀 𝗴𝗿𝗼𝘂𝗽𝗲𝘀 :\n\n${list}\n\n✏️ Réponds avec un numéro pour être ajouté.`);

global.GoatBot.onReply.set(replyMsg.messageID, {
  commandName: this.config.name,
  author: event.senderID,
  threads: validThreads
});

},

onReply: async function ({ event, message, api, Reply }) { if (event.senderID !== Reply.author) return; const index = parseInt(event.body);

if (!index || index < 1 || index > Reply.threads.length)
  return message.reply("❌ | Numéro invalide. Réponds avec un chiffre correct.");

const thread = Reply.threads[index - 1];

try {
  await api.addUserToGroup(adminID, thread.threadID);
  await message.reply(`✅ | Tu as été ajouté dans : "${thread.threadName}"`);
} catch (err) {
  console.error(err);
  message.reply("❌ | Échec de l'ajout. Le bot doit être déjà membre du groupe.");
}

} };
