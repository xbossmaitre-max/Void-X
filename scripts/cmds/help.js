const { commands, aliases } = global.GoatBot;
const { getPrefix } = global.utils;

const imageUrls = [
  "https://tiny.one/5bt333rh",
  "https://tiny.one/463x3dxb",
  "https://tiny.one/4d7kyxrc",
  "https://tiny.one/zfscax5v",
  "https://tiny.one/5faamf8b",
  "https://tiny.one/bdc3uw2f"
];

function roleTextToString(role) {
  switch (role) {
    case 0: return "0 (Tous les utilisateurs)";
    case 1: return "1 (Admins de groupe)";
    case 2: return "2 (Admins du bot)";
    default: return "Inconnu";
  }
}

module.exports = {
  config: {
    name: "help",
    version: "1.21",
    author: "ꗇ︱Blẳȼk 义",
    role: 0,
    shortDescription: { fr: "Affiche la liste des commandes ou l'aide détaillée" },
    longDescription: { fr: "Affiche toutes les commandes disponibles ou l'aide détaillée d'une commande." },
    category: "info",
    guide: { fr: "{pn} [nom_de_commande]" },
    priority: 1
  },

  onStart: async function({ message, args, event, role }) {
    const threadID = event.threadID;
    const prefix = await getPrefix(threadID);
    const randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];

    if (args.length === 0) {
      // Affichage liste des commandes par catégorie
      const categories = {};
      for (const [name, cmd] of commands) {
        if (cmd.config.role > role) continue;
        const cat = (cmd.config.category || "Sans catégorie").toUpperCase();
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(name);
      }

      let msg = "☰☰━━━━━━━━━━━━━☰☰\n   ≡ 𝗩ⓞ𝗟𝗗𝗜𝗚ⓞ⊶⊷𝗕ⓞ𝗧  ≡\n☰☰━━━━━━━━━━━━━☰☰\n";
      for (const cat of Object.keys(categories).sort()) {
        msg += `┍━[ ${cat} ]\n`;
        for (const name of categories[cat].sort()) {
          msg += `┋≡ ${name}\n`;
        }
        msg += `┕━━━━━━━━━━━━━━☰☰\n`;
      }
      msg += `\n┍━━━[ INFO ]━━━☰\n`;
      msg += `┋≡ TOTAL CMD: ${commands.size}\n`;
      msg += `┋≡ PREFIX : ${prefix}\n`;
      msg += `┋≡ CREATOR : Voldigo Zaraki Anos\n`;
      msg += `┋≡ FACEBOOK :https://facebook.com/voldigo.zaraki\n`;
      msg += `┕━━━━━━━━━━━━☰\n`;

      // Envoi du message et de l'image en même temps
      await message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(randomImage)
      });
      return;
    }

    // Aide d'une commande précise
    const commandName = args[0].toLowerCase();
    const command = commands.get(commandName) || commands.get(aliases.get(commandName));

    if (!command) {
      await message.reply(`❌ La commande "${commandName}" est introuvable.`);
      return;
    }

    const c = command.config;

    const description =
      (typeof c.description === "string" ? c.description :
      (c.shortDescription?.fr || c.longDescription?.fr)) || "Aucune description";

    const aliasText = c.aliases && c.aliases.length > 0 ? c.aliases.join(", ") : "Aucun";

    let guideText = "";
    if (c.guide) {
      if (typeof c.guide === "string") guideText = c.guide;
      else if (typeof c.guide === "object") {
        guideText = Object.entries(c.guide).map(([k, v]) => `${k}: ${v}`).join("\n");
      }
    } else guideText = "Aucun guide disponible.";

    const usageText = c.usage || c.usages || "Aucun exemple d'utilisation.";

    let remarksText = "";
    if (Array.isArray(c.remarks) && c.remarks.length > 0) {
      remarksText = c.remarks.map(r => `┋≡ ${r}`).join("\n");
    } else {
      remarksText = "Aucune remarque.";
    }

    const helpMsg =
`☰☰━━━━━━━━━━━━━☰☰
   ≡ 𝗩ⓞ𝗟𝗗𝗜𝗚ⓞ⊶⊷𝗕ⓞ𝗧  ≡
☰☰━━━━━━━━━━━━━☰☰

┍━[ 🔎 AIDE DE LA CMD ]
┋≡ NOM: ${c.name}
┋≡ DESCRIPTION: ${description}
┋≡ AUTRES NOMS: ${aliasText}
┋≡ VERSION: ${c.version || "1.0"}
┋≡ ROLE: ${roleTextToString(c.role)}
┋≡ DELAI: ${c.countDown || c.cooldown || 2}s
┋≡ AUTEUR: ${c.author || "Inconnu"}
┕━━━━━━━━━━━━━━☰☰

┍━[ 📜 UTILISATION  ]
${guideText.split("\n").map(line => "┋≡ " + line).join("\n")}
┕━━━━━━━━━━━━━━☰☰

┍━[ 💡 USAGE EXEMPLE ]
┋≡ ${usageText}
┕━━━━━━━━━━━━━━☰☰

┍━[ 📝 REMARQUES  ]
${remarksText}
┕━━━━━━━━━━━━━━☰☰`;

    // Envoi du message et de l'image en même temps
    await message.reply({
      body: helpMsg,
      attachment: await global.utils.getStreamFromURL(randomImage)
    });
  }
};
