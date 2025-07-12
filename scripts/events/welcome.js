Skip to content
Navigation Menu
3voldi
INCONNU-XD-V2

Code
Issues
Pull requests
Actions
Projects
Security
Insights
INCONNU-XD-V2/scripts/events
/welcome.js
 
132 lines (123 loc) · 5.4 KB

Code

Blame
const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "1.7",
		author: "NTKhang",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
			multiple1: "bạn",
			multiple2: "các bạn",
			defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"
		},
		en: {
			session1: "𝗺𝗼𝗿𝗻𝗶𝗻𝗴",
			session2: "𝗻𝗼𝗼𝗻",
			session3: "𝗮𝗳𝘁𝗲𝗿𝗻𝗼𝗼𝗻",
			session4: "𝗲𝘃𝗲𝗻𝗶𝗻𝗴",
			welcomeMessage: "👨‍🏫 𝑰𝑵𝑪𝑶𝑵𝑵𝑼-𝑿𝑫-𝑽2 👨‍🏫\n\n 𝑴𝒆𝒓𝒄𝒊 𝒅𝒆 𝒎'𝒂𝒗𝒐𝒊𝒓 𝒊𝒏𝒗𝒊𝒕𝒆́ 𝒅𝒂𝒏𝒔 𝒗𝒐𝒕𝒓𝒆 𝒈𝒓𝒐𝒖𝒑!\n 𝗕𝗼𝘁 𝗽𝗿𝗲𝗳𝗶𝘅: %1\n𝑷𝒐𝒖𝒓 𝒗𝒐𝒊𝒓 𝒎𝒆𝒔 𝒄𝒐𝒎𝒎𝒂𝒏𝒅𝒆𝒔, 𝒔'𝒊𝒍 𝒕𝒆 𝒑𝒍𝒂𝒊̂𝒕 𝒆́𝒄𝒓𝒊𝒕: %1𝗵𝗲𝗹𝗽\n\n♻ 𝗜 𝗵𝗼𝗽𝗲 𝘆𝗼𝘂 𝘄𝗶𝗹𝗹 𝗳𝗼𝗹𝗹𝗼𝘄 𝗼𝘂𝗿 𝗮𝗹𝗹 𝗴𝗿𝗼𝘂𝗽 𝗿𝘂𝗹𝗲𝘀 ♻",
			multiple1: "𝘆𝗼𝘂",
			multiple2: "𝘆𝗼𝘂 𝗴𝘂𝘆𝘀",
			defaultWelcomeMessage: `🍒𝑰𝑵𝑪𝑶𝑵𝑵𝑼-𝑿𝑫-𝑽2🍒\n\n 𝑺𝒂𝒍𝒖𝒕 {userName}.\n𝑩𝒊𝒆𝒏𝒗𝒆𝒏𝒖 {multiple} 𝑫𝒂𝒏𝒔 𝒍𝒆 𝒈𝒓𝒐𝒖𝒑𝒆: {boxName}\n 𝗛𝗮𝘃𝗲 𝗮 𝗻𝗶𝗰𝗲 {session} \n\n♻ 𝗜 𝗵𝗼𝗽𝗲 𝘆𝗼𝘂 𝘄𝗶𝗹𝗹 𝗳𝗼𝗹𝗹𝗼𝘄 𝗼𝘂𝗿 𝗮𝗹𝗹 𝗴𝗿𝗼𝘂𝗽 𝗿𝘂𝗹𝗲𝘀 ♻\n\n🐔🌬 𝗔𝗽𝗻𝗮𝗸𝗲 𝗮𝗺𝗮𝗱𝗲𝗿 𝗮𝗶 𝗴𝗿𝗼𝘂𝗽𝗲 𝗮𝘀𝗮𝗿 𝗷𝗼𝗻𝗻𝗼 𝗮𝗻𝗲𝗸 𝗼𝗻𝗲𝗸 𝘀𝘂𝗯𝗲𝗰𝗰𝗵𝗮 😘😊`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;
				// if new member is bot
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(getLang("welcomeMessage", prefix));
				}
				// if new member:
				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				// push new member to array
				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				// if timeout is set, clear it
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				// set new timeout
				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false)
						return;
					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const threadName = threadData.threadName;
					const userName = [],
						mentions = [];
					let multiple = false;

					if (dataAddedParticipants.length > 1)
						multiple = true;

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId))
							continue;
						userName.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}
					// {userName}:   name of new member
					// {multiple}:
					// {boxName}:    name of group
					// {threadName}: name of group
					// {session}:    session of day
					if (userName.length == 0) return;
					let { welcomeMessage = getLang("defaultWelcomeMessage") } =
						threadData.data;
					const form = {
						mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
					};
					welcomeMessage = welcomeMessage
						.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
						.replace(/\{boxName\}|\{threadName\}/g, threadName)
						.replace(
							/\{multiple\}/g,
							multiple ? getLang("multiple2") : getLang("multiple1")
						)
						.replace(
							/\{session\}/g,
							hours <= 10
								? getLang("session1")
								: hours <= 12
									? getLang("session2")
									: hours <= 18
										? getLang("session3")
										: getLang("session4")
						);

					form.body = welcomeMessage;

					if (threadData.data.welcomeAttachment) {
						const files = threadData.data.welcomeAttachment;
						const attachments = files.reduce((acc, file) => {
							acc.push(drive.getFile(file, "stream"));
							return acc;
						}, []);
						form.attachment = (await Promise.allSettled(attachments))
							.filter(({ status }) => status == "fulfilled")
							.map(({ value }) => value);
					}
					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
Footer
© 2025 GitHub, Inc.
Footer navigation
Terms
Privacy
Security
Status
Docs
Contact
Manage cookies
Do not share my personal information

