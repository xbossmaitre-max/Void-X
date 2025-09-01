const fetch = require("node-fetch");

const nix = "https://apis-toop.onrender.com/aryan";

module.exports = {
  config: {
    name: "zaraki",
    aliases: [],
    version: "0.0.1",
    author: "ArYAN",
    category: "utility",
    guide: {
      en: "zaraki <prompt>"
    }
  },

  onStart: async function ({ message, args }) {
    if (!args.length) return message.reply("🤖 𝗡𝗜𝗫 𝗔𝗜\n\n𝖧𝖾𝗅𝗅𝗈! 𝖧𝗈𝗐 𝖼𝖺𝗇 𝖨 𝖺𝗌𝗌𝗂𝗌𝗍 𝗒𝗈𝗎 𝗍𝗈𝖽𝖺𝗒?");

    const p = args.join(" ");

    try {
      const r = await fetch(`${nix}/mini?ask=${encodeURIComponent(p)}`);
      const a = await r.json();

      if (!a.status || !a.response) return message.reply("❌ AI did not return a valid response.");

      const fa = await fetch(`${nix}/font?style=sans&text=${encodeURIComponent(a.response)}`);
      const ar = await fa.json();

      const yan = `🤖 𝗡𝗜𝗫 𝗔𝗜\n\n${ar.result || a.response}`;

      return message.reply(yan);

    } catch (err) {
      return message.reply(`❌ Error: ${err.message}`);
    }
  }
};
