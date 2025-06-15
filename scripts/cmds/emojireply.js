module.exports = {
 config: {
 name: "emojireply",
 version: "1.0",
 author: "YourName",
 countDown: 0,
 role: 0,
 shortDescription: "Auto-reply to emoji with random emoji pairs",
 longDescription: "Automatically replies to any emoji message with random emoji combinations",
 category: "fun",
 guide: {
 en: "Just enable the command and it will auto-reply to emojis"
 }
 },

 onStart: async function({ api, event }) {
 // No initial setup needed
 },

 onChat: async function({ api, event, message, getLang }) {
 // Check if the message consists only of emojis
 const emojiRegex = /^(\p{Emoji}|\p{Emoji_Presentation}|\p{Emoji_Modifier}|\p{Emoji_Modifier_Base}|\p{Emoji_Component})+$/u;
 
 if (emojiRegex.test(event.body)) {
 // Generate random emoji pairs
 const emojiPairs = [
 ["😊", "😎"],
 ["❤️", "✨"],
 ["😂", "🤣"],
 ["👍", "👌"],
 ["🐐", "🤖"],
 ["🌞", "🌝"],
 ["🍎", "🍏"],
 ["⚡", "🔥"],
 ["🙈", "🙉"],
 ["🎉", "🎊"],
 ["🤔", "🤨"],
 ["🥳", "🎂"],
 ["🍕", "🍔"],
 ["🚀", "👽"],
 ["💯", "🔥"],
 ["🧠", "💡"],
 ["👀", "👉"],
 ["🤝", "👏"],
 ["💔", "❤️‍🩹"],
 ["🤯", "😵"]
 ];

 // Select a random pair
 const randomPair = emojiPairs[Math.floor(Math.random() * emojiPairs.length)];
 
 // Reply with the emoji pair
 api.sendMessage(randomPair.join(' '), event.threadID, event.messageID);
 }
 }
};