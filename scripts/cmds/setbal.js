module.exports = {
 config: {
 name: "setbal",
 version: "1.0",
 author: "Chitron Bhattacharjee",
 role: 2, // Only bot owner
 shortDescription: {
 en: "Set user's money"
 },
 description: {
 en: "Set the balance of a user (admin only)"
 },
 category: "𝗪𝗔𝗟𝗟𝗘𝗧",
 guide: {
 en: "{pn} @user <amount>"
 }
 },

 langs: {
 en: {
 missingInput: "❌ Please tag a user and enter an amount.\nExample: {pn} @user 500",
 invalidAmount: "❌ Amount must be a valid number.",
 success: "✅ Set balance of %1 to %2$"
 }
 },

 onStart: async function ({ message, event, args, usersData, getLang }) {
 const mentionUID = Object.keys(event.mentions)[0];
 const amount = parseInt(args[args.length - 1]);

 if (!mentionUID || isNaN(amount)) {
 return message.reply(getLang("missingInput"));
 }

 if (amount < 0) {
 return message.reply(getLang("invalidAmount"));
 }

 await usersData.set(mentionUID, { money: amount });
 const name = event.mentions[mentionUID].replace("@", "");
 return message.reply(getLang("success", name, amount));
 }
};