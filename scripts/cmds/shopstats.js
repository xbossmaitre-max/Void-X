const { getTime } = global.utils;

module.exports = {
	config: {
		name: "shopstats",
		version: "1.0",
		author: "Aryan Chauhan",
		countDown: 5,
		role: 0,
		description: {
			vi: "Xem thống kê toàn cầu của hệ thống cửa hàng",
			en: "View global statistics of the shop system"
		},
		category: "info",
		guide: {
			vi: "{pn} [global|personal] - Xem thống kê cửa hàng",
			en: "{pn} [global|personal] - View shop statistics"
		}
	},

	onStart: async function ({ message, args, event, usersData, globalData, getLang }) {
		const { senderID } = event;
		const type = args[0]?.toLowerCase() || "personal";

		if (type === "global") {
			return this.showGlobalStats(message, globalData, fonts);
		} else {
			return this.showPersonalStats(message, senderID, usersData, fonts);
		}
	},

	showGlobalStats: async function (message, globalData, fonts) {
		try {
			const shopStats = await globalData.get("shopStats", "data", {
				totalSales: 0,
				totalRevenue: 0,
				topItems: {},
				totalUsers: 0,
				membershipDistribution: {
					Bronze: 0,
					Silver: 0,
					Gold: 0,
					Diamond: 0,
					Royal: 0
				}
			});

			let statsMessage = `
${fonts.bold("🌟 ═══════════════════════════════════════ 🌟")}
${fonts.bold("            📊 GLOBAL SHOP STATISTICS            ")}
${fonts.bold("🌟 ═══════════════════════════════════════ 🌟")}

${fonts.bold("💰 FINANCIAL OVERVIEW")}
💵 Total Revenue: ${fonts.bold(`$${shopStats.totalRevenue.toLocaleString()}`)}
🛒 Total Sales: ${fonts.bold(shopStats.totalSales.toLocaleString())}
👥 Active Shoppers: ${fonts.bold(shopStats.totalUsers.toLocaleString())}
📈 Average per Sale: ${fonts.bold(`$${shopStats.totalSales > 0 ? Math.round(shopStats.totalRevenue / shopStats.totalSales).toLocaleString() : '0'}`)}

${fonts.bold("🏆 MEMBERSHIP DISTRIBUTION")}
🥉 Bronze: ${fonts.bold(shopStats.membershipDistribution.Bronze)}
🥈 Silver: ${fonts.bold(shopStats.membershipDistribution.Silver)}
🥇 Gold: ${fonts.bold(shopStats.membershipDistribution.Gold)}
💎 Diamond: ${fonts.bold(shopStats.membershipDistribution.Diamond)}
👑 Royal: ${fonts.bold(shopStats.membershipDistribution.Royal)}

${fonts.bold("🔥 TOP SELLING ITEMS")}
`;

			const topItems = Object.entries(shopStats.topItems)
				.sort(([,a], [,b]) => b - a)
				.slice(0, 5);

			if (topItems.length > 0) {
				topItems.forEach(([item, sales], index) => {
					statsMessage += `${index + 1}. ${item}: ${fonts.bold(sales)} sales\n`;
				});
			} else {
				statsMessage += "No sales data available\n";
			}

			statsMessage += `\n${fonts.bold("💡 Use 'shopstats personal' to view your statistics")}`;

			return message.reply(statsMessage);
		} catch (error) {
			return message.reply(fonts.bold("❌ Error retrieving global shop statistics."));
		}
	},

	showPersonalStats: async function (message, senderID, usersData, fonts) {
		try {
			const userData = await usersData.get(senderID);
			const shopData = userData.shopData || {};

			const totalItems = this.countTotalItems(userData.inventory || {});
			const favoriteCount = shopData.favoriteItems?.length || 0;
			const purchaseCount = shopData.purchaseHistory?.length || 0;
			const totalSpent = shopData.totalSpent || 0;
			const loyaltyPoints = shopData.loyaltyPoints || 0;
			const membershipLevel = shopData.membershipLevel || "Bronze";
			const dailyRewardsCount = shopData.dailyRewards?.length || 0;

			let personalStats = `
${fonts.bold("🌟 ═══════════════════════════════════════ 🌟")}
${fonts.bold("           👤 YOUR SHOP STATISTICS           ")}
${fonts.bold("🌟 ═══════════════════════════════════════ 🌟")}

${fonts.bold("💰 SPENDING OVERVIEW")}
💵 Total Spent: ${fonts.bold(`$${totalSpent.toLocaleString()}`)}
🛒 Total Purchases: ${fonts.bold(purchaseCount)}
📦 Items Owned: ${fonts.bold(totalItems)}
💳 Average Purchase: ${fonts.bold(`$${purchaseCount > 0 ? Math.round(totalSpent / purchaseCount).toLocaleString() : '0'}`)}

${fonts.bold("🎯 MEMBERSHIP & REWARDS")}
🏆 Current Tier: ${this.getMembershipEmoji(membershipLevel)} ${fonts.bold(membershipLevel)}
🎯 Loyalty Points: ${fonts.bold(loyaltyPoints.toLocaleString())}
🎁 Daily Rewards Claimed: ${fonts.bold(dailyRewardsCount)}
❤️ Favorite Items: ${fonts.bold(favoriteCount)}

${fonts.bold("📊 INVENTORY BREAKDOWN")}
`;

			const inventory = userData.inventory || {};
			Object.entries(inventory).forEach(([category, items]) => {
				const itemCount = Object.keys(items).length;
				if (itemCount > 0) {
					personalStats += `${this.getCategoryEmoji(category)} ${category}: ${fonts.bold(itemCount)} items\n`;
				}
			});

			if (shopData.purchaseHistory && shopData.purchaseHistory.length > 0) {
				const recentPurchases = shopData.purchaseHistory
					.sort((a, b) => b.date - a.date)
					.slice(0, 3);

				personalStats += `\n${fonts.bold("🕐 RECENT PURCHASES")}`;
				recentPurchases.forEach((purchase, index) => {
					const date = new Date(purchase.date).toLocaleDateString();
					personalStats += `\n${index + 1}. ${purchase.item} - $${purchase.cost.toLocaleString()} (${date})`;
				});
			}

			personalStats += `\n\n${fonts.bold("💡 Use 'shopstats global' to view server statistics")}`;

			return message.reply(personalStats);
		} catch (error) {
			return message.reply(fonts.bold("❌ Error retrieving your shop statistics."));
		}
	},

	countTotalItems: function (inventory) {
		let total = 0;
		Object.values(inventory).forEach(category => {
			Object.values(category).forEach(item => {
				total += item.quantity || 0;
			});
		});
		return total;
	},

	getMembershipEmoji: function (tier) {
		const emojis = {
			"Bronze": "🥉",
			"Silver": "🥈",
			"Gold": "🥇", 
			"Diamond": "💎",
			"Royal": "👑"
		};
		return emojis[tier] || "🥉";
	},

	getCategoryEmoji: function (category) {
		const emojis = {
			weapons: "⚔️",
			armor: "🛡️",
			potions: "🧪",
			materials: "⛏️",
			food: "🍖",
			tools: "🔨",
			pets: "🐕",
			vehicles: "🚗"
		};
		return emojis[category] || "📦";
	}
};
