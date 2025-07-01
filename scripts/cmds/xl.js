module.exports = {
 config: {
 name: 'xl',
 version: '1.0',
 author: 'Chitron Bhattacharjee',
 countDown: 10,
 role: 0,
 longDescription: {
 en: 'Generate an image from text using SDXL.'
 },
 category: 'image',
 guide: {
 en: '{pn} prompt [--ar=<ratio>] or [--ar <ratio>]'
 }
 },

 onStart: async function ({ message, api, args, event }) {
 const promptText = args.join(' ');
 if (!promptText) {
 return message.reply(
 `😡 Please enter a text prompt\nExample:\n${global.GoatBot.config.prefix}xl a cat\nor\n${global.GoatBot.config.prefix}xl a girl --ar 2:3`
 );
 }

 // Anime-style coin notice
 message.reply(
 "🌸 𝓣𝓱𝓲𝓼 𝓬𝓸𝓶𝓶𝓪𝓷𝓭 𝔀𝓲𝓵𝓵 𝓬𝓸𝓼𝓽 ❺⓿ 𝓬𝓸𝓲𝓷𝓼~\n💫 𝓘𝓽 𝔀𝓲𝓵𝓵 𝓫𝓮 𝓭𝓮𝓭𝓾𝓬𝓽𝓮𝓭 𝓯𝓻𝓸𝓶 𝔂𝓸𝓾𝓻 𝓫𝓪𝓵𝓪𝓷𝓬𝓮!"
 );

 let ratio = '1:1';
 const ratioIndex = args.findIndex(arg => arg.startsWith('--ar='));
 if (ratioIndex !== -1) {
 ratio = args[ratioIndex].split('=')[1];
 args.splice(ratioIndex, 1);
 } else {
 const ratioFlagIndex = args.findIndex(arg => arg === '--ar');
 if (ratioFlagIndex !== -1 && args[ratioFlagIndex + 1]) {
 ratio = args[ratioFlagIndex + 1];
 args.splice(ratioFlagIndex, 2);
 }
 }

 api.setMessageReaction("⏳", event.messageID, () => {}, true);
 const startTime = new Date().getTime();

 try {
 const prompt = args.join(' ');
 const world = `&ratio=${ratio}`;
 const team = `xl31?prompt=${encodeURIComponent(prompt)}${world}`;
 const o = "xyz";
 const imageURL = `https://smfahim.${o}/${team}`;

 const attachment = await global.utils.getStreamFromURL(imageURL);
 const endTime = new Date().getTime();
 const timeTaken = (endTime - startTime) / 1000;

 message.reply({
 body: `🖼️ 𝓗𝓮𝓻𝓮 𝓲𝓼 𝔂𝓸𝓾𝓻 𝓧𝓛 𝓜𝓸𝓭𝓮𝓵!\n⏱️ 𝓣𝓲𝓶𝓮 𝓽𝓪𝓴𝓮𝓷: ${timeTaken} seconds`,
 attachment: attachment
 });

 api.setMessageReaction("✅", event.messageID, () => {}, true);
 } catch (error) {
 console.error(error);
 api.setMessageReaction("❌", event.messageID, () => {}, true);
 message.reply("❌ | Failed to generate image. Please try again later.");
 }
 }
};