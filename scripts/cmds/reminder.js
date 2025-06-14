const fs = require('fs');
const path = require('path');

// Storage setup
const remindersFile = path.join(__dirname, 'reminders.json');
if (!fs.existsSync(remindersFile)) {
 fs.writeFileSync(remindersFile, '{}');
}

module.exports = {
 config: {
 name: "reminder",
 aliases: ["remindme", "schedule"],
 version: "2.1",
 author: "Chitron Bhattacharjee",
 role: 0,
 category: "utility",
 shortDescription: "⏳ Advanced reminder system",
 longDescription: "Set precise time or recurring reminders with DM+group notifications",
 guide: {
 en: "📌 Usage:\n"
 + "• reminder set [time] [message]\n"
 + "• reminder list\n\n"
 + "⏰ Time formats:\n"
 + "⌛ Relative: 30s, 2h, 1d\n"
 + "🕰️ Absolute: 4:30pm, 16:30\n"
 + "🔁 Recurring: everyday 9am, every2d 10pm"
 }
 },

 onStart: async function ({ api, event, args, message }) {
 const subCommand = args[0]?.toLowerCase();
 const userId = event.senderID;
 const threadID = event.threadID;

 // Load reminders
 let reminders = this.loadReminders();

 if (subCommand === 'set') {
 if (args.length < 3) {
 return message.reply("⚠️ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗙𝗼𝗿𝗺𝗮𝘁\n━━━━━━━━━━━━\nUsage: reminder set [time] [message]\nExample: reminder set 4:30pm Drink water");
 }

 const timeInput = args[1].toLowerCase();
 const reminderMsg = args.slice(2).join(" ");
 const userInfo = await api.getUserInfo(userId);
 const userName = userInfo[userId].name;

 // Parse time input
 const parsedTime = this.parseTimeInput(timeInput);
 if (!parsedTime) {
 return message.reply("❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗧𝗶𝗺𝗲\n━━━━━━━━━━━━\nValid formats:\n• 4:30pm, 16:30\n• 30s, 2h, 1d\n• everyday 9am, every3d 10pm");
 }

 // Create reminder
 const reminderId = Date.now().toString();
 reminders[reminderId] = {
 userId,
 userName,
 threadID,
 message: reminderMsg,
 ...parsedTime
 };

 // Save and schedule
 this.saveReminders(reminders);
 this.scheduleReminder(api, reminderId, reminders[reminderId]);

 // Confirmation message
 const timeDisplay = parsedTime.isRecurring 
 ? `🔄 ${parsedTime.scheduleDescription}`
 : `⏰ ${this.formatTimeDisplay(parsedTime.nextTrigger)}`;

 message.reply(
 `⏳ 𝗧𝗜𝗠𝗘 𝗖𝗔𝗣𝗦𝗨𝗟𝗘 𝗦𝗘𝗧\n`
 + `━━━━━━━━━━━━━━━━━━\n`
 + `📝 𝗠𝗲𝘀𝘀𝗮𝗴𝗲: "${reminderMsg}"\n`
 + `${timeDisplay}\n`
 + `👤 𝗨𝘀𝗲𝗿: ${userName}\n`
 + `🆔 𝗜𝗗: ${reminderId.substring(reminderId.length - 6)}\n\n`
 + `💬 I'll notify you in ${event.isGroup ? "this group" : "DM"} + your inbox!`
 );
 }
 else if (subCommand === 'list') {
 const userReminders = this.getUserReminders(userId, reminders);
 
 if (userReminders.length === 0) {
 return message.reply("📭 𝗡𝗼 𝗥𝗲𝗺𝗶𝗻𝗱𝗲𝗿𝘀\n━━━━━━━━━━━━\nYou have no active reminders!");
 }

 const now = Date.now();
 let coming = "", past = "";

 userReminders.forEach(([id, r]) => {
 const line = `⦿ ${r.message} (${this.formatTimeDisplay(r.nextTrigger)}) - ID: ${id.substring(id.length - 6)}\n`;
 if (r.nextTrigger > now) coming += line;
 else past += line;
 });

 message.reply(
 `📋 𝗥𝗘𝗠𝗜𝗡𝗗𝗘𝗥 𝗟𝗜𝗦𝗧\n`
 + `━━━━━━━━━━━━━━━━━━\n`
 + `🕒 𝗖𝗼𝗺𝗶𝗻𝗴:\n${coming || "⏳ 𝗡𝗼𝗻𝗲 𝗽𝗲𝗻𝗱𝗶𝗻𝗴"}\n\n`
 + `⌛ 𝗣𝗮𝘀𝘁:\n${past || "📭 𝗡𝗼𝗻𝗲"}\n\n`
 + `ℹ️ Use "reminder cancel [ID]" to remove`
 );
 }
 else {
 message.reply(this.config.guide.en);
 }
 },

 // Helper functions
 loadReminders: function() {
 try {
 return JSON.parse(fs.readFileSync(remindersFile));
 } catch {
 return {};
 }
 },

 saveReminders: function(reminders) {
 fs.writeFileSync(remindersFile, JSON.stringify(reminders, null, 2));
 },

 getUserReminders: function(userId, reminders) {
 return Object.entries(reminders)
 .filter(([_, r]) => r.userId === userId)
 .sort((a, b) => a[1].nextTrigger - b[1].nextTrigger);
 },

 parseTimeInput: function(input) {
 // Relative time (30s, 2h, 1d)
 const relativeMatch = input.match(/^(\d+)([smhd])$/i);
 if (relativeMatch) {
 const amount = parseInt(relativeMatch[1]);
 const unit = relativeMatch[2].toLowerCase();
 const ms = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit] * amount;
 return {
 nextTrigger: Date.now() + ms,
 isRecurring: false
 };
 }

 // Recurring (everyday 9am, every2d 10pm)
 const recurringMatch = input.match(/^every(\d*)d?\s(\d{1,2})(?::(\d{2}))?\s?([ap]m)?$/i);
 if (recurringMatch) {
 let hours = parseInt(recurringMatch[2]);
 const minutes = recurringMatch[3] ? parseInt(recurringMatch[3]) : 0;
 const period = recurringMatch[4]?.toLowerCase();
 const dayInterval = recurringMatch[1] ? parseInt(recurringMatch[1]) : 1;

 // Convert to 24h
 if (period === 'pm' && hours < 12) hours += 12;
 if (period === 'am' && hours === 12) hours = 0;

 const nextTrigger = this.calculateNextTrigger(hours, minutes, dayInterval);

 return {
 nextTrigger: nextTrigger.getTime(),
 isRecurring: true,
 dayInterval,
 scheduleDescription: `Every ${dayInterval === 1 ? 'day' : dayInterval + ' days'} at ${this.formatHours(hours, minutes)}`
 };
 }

 // Absolute time (4:30pm, 16:30)
 const absoluteMatch = input.match(/^(\d{1,2})(?::(\d{2}))?\s?([ap]m)?$/i);
 if (absoluteMatch) {
 let hours = parseInt(absoluteMatch[1]);
 const minutes = absoluteMatch[2] ? parseInt(absoluteMatch[2]) : 0;
 const period = absoluteMatch[3]?.toLowerCase();

 // Convert to 24h
 if (period === 'pm' && hours < 12) hours += 12;
 if (period === 'am' && hours === 12) hours = 0;

 const nextTrigger = this.calculateNextTrigger(hours, minutes);
 return {
 nextTrigger: nextTrigger.getTime(),
 isRecurring: false
 };
 }

 return null;
 },

 calculateNextTrigger: function(hours, minutes, dayInterval = 0) {
 const now = new Date();
 const nextTrigger = new Date(
 now.getFullYear(),
 now.getMonth(),
 now.getDate() + dayInterval,
 hours,
 minutes,
 0
 );

 // If time already passed today
 if (nextTrigger < now && !dayInterval) {
 nextTrigger.setDate(nextTrigger.getDate() + 1);
 }

 return nextTrigger;
 },

 formatHours: function(hours, minutes) {
 const period = hours >= 12 ? 'PM' : 'AM';
 const displayHours = hours % 12 || 12;
 return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
 },

 formatTimeDisplay: function(timestamp) {
 const date = new Date(timestamp);
 return date.toLocaleString('en-US', {
 weekday: 'short',
 hour: '2-digit',
 minute: '2-digit',
 month: 'short',
 day: 'numeric'
 });
 },

 scheduleReminder: function(api, id, reminder) {
 const notify = async () => {
 try {
 const { userId, threadID, message, userName } = reminder;
 const tagMsg = `🔔 𝗥𝗘𝗠𝗜𝗡𝗗𝗘𝗥\n━━━━━━━━━━━━\n@${userName.replace(/\s/g, '')} ${message}`;
 const plainMsg = `🔔 𝗥𝗘𝗠𝗜𝗡𝗗𝗘𝗥\n━━━━━━━━━━━━\n${userName} ${message}`;

 // Send to group if available
 if (threadID) {
 try {
 await api.sendMessage({
 body: tagMsg,
 mentions: [{
 tag: `@${userName}`,
 id: userId
 }]
 }, threadID);
 } catch {
 await api.sendMessage(plainMsg, threadID);
 }
 }

 // Try to send DM (silently fail if not possible)
 try {
 await api.sendMessage(plainMsg, userId);
 } catch {}
 
 // Reschedule if recurring
 if (reminder.isRecurring) {
 const newTrigger = this.calculateNextTrigger(
 new Date(reminder.nextTrigger).getHours(),
 new Date(reminder.nextTrigger).getMinutes(),
 reminder.dayInterval
 );
 
 const reminders = this.loadReminders();
 if (reminders[id]) {
 reminders[id].nextTrigger = newTrigger.getTime();
 this.saveReminders(reminders);
 this.scheduleReminder(api, id, reminders[id]);
 }
 } else {
 // Remove one-time reminders
 const reminders = this.loadReminders();
 delete reminders[id];
 this.saveReminders(reminders);
 }
 } catch (err) {
 console.error("Reminder error:", err);
 }
 };

 const delay = reminder.nextTrigger - Date.now();
 if (delay > 0) {
 setTimeout(notify, delay);
 } else if (reminder.isRecurring) {
 notify();
 }
 },

 // Initialize existing reminders on bot start
 onLoad: function({ api }) {
 const reminders = this.loadReminders();
 Object.entries(reminders).forEach(([id, reminder]) => {
 this.scheduleReminder(api, id, reminder);
 });
 }
};