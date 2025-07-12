const fs = require("fs-extra");
const moment = require("moment-timezone");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "2.0",
    author: "Bláº³È¼k",
    countDown: 5,
    role: 0,
    shortDescription: "Affiche et modifie le prÃ©fixe",
    longDescription: "Affiche les prÃ©fixes systÃ¨me et du groupe ou les modifie",
    category: "config",
    guide: {
      en:
        "   {pn} <new prefix>: change prefix in your group\n" +
        "   {pn} <new prefix> -g: change system prefix (admin only)\n" +
        "   {pn} reset: reset group prefix to default\n" +
        "   Or simply type 'prefix' to view current ones"
    }
  },

  langs: {
    en: {
      reset: "âœ… Your group prefix has been reset to default: %1",
      onlyAdmin: "âŒ Only the bot admin can change the system prefix.",
      confirmGlobal: "âš ï¸ React to this message to confirm changing the system prefix.",
      confirmThisThread: "âš ï¸ React to this message to confirm changing the prefix in this group.",
      successGlobal: "âœ… System prefix changed to: %1",
      successThisThread: "âœ… Group prefix changed to: %1",
      myPrefix: `Hey: %1

â˜»â”â”â”€â”€[ð™±ðš•ðšŠðšŒðš”â€¢ð™±â˜ºï¸Žï¸Žðšƒ]â”€â”€â”â”â˜»
ðš‚ðšˆðš‚ðšƒð™´ð™¼ ð™¿ðšð™´ð™µð™¸ðš‡: â‡† [ %2 ]
ðšˆð™¾ðš„ðš ð™±ð™¾ðš‡ ð™²ð™·ð™°ðšƒ ð™¿ðšð™´ð™µð™¸ðš‡: â‡† [ %3 ]
ð™¾ðš†ð™½ð™´ðš : ê—‡ï¸±Bláº³È¼k ä¹‰
â—ˆâ”â”â”â”â”â”â—ˆâœ™â—ˆâ”â”â”â”â”â”â–·
ð™³ð™°ðšƒð™´ ðšƒð™¸ð™¼ð™´: %4
â—ˆâ”â”â”â”â”â”â—ˆâœ™â—ˆâ”â”â”â”â”â”â–·`
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0]) return message.SyntaxError();

    if (args[0] === "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix,
      setGlobal: args[1] === "-g"
    };

    if (formSet.setGlobal && role < 2)
      return message.reply(getLang("onlyAdmin"));

    return message.reply(
      formSet.setGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread"),
      (err, info) => {
        if (!err) {
          formSet.messageID = info.messageID;
          global.GoatBot.onReaction.set(info.messageID, formSet);
        }
      }
    );
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author) return;

    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    } else {
      await threadsData.set(event.threadID, newPrefix, "data.prefix");
      return message.reply(getLang("successThisThread", newPrefix));
    }
  },

  onChat: async function ({ event, message, threadsData, usersData, getLang }) {
    if (!event.body || event.body.toLowerCase() !== "prefix") return;

    const systemPrefix = global.GoatBot.config.prefix || "!";
    const threadPrefix = await threadsData.get(event.threadID, "data.prefix") || systemPrefix;
    const name = await usersData.getName(event.senderID);
    const time = moment().tz("Africa/Abidjan").format("DD MMMM YYYY [at] hh:mm A");

    return message.reply(getLang("myPrefix", name, systemPrefix, threadPrefix, time));
  }
};
