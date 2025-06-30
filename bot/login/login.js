process.on('unhandledRejection', error => console.error(error));
process.on('uncaughtException', error => console.error(error));

// Set bash title
process.stdout.write("\x1b]2;Shipu AI - Made by Chitron Bhattacharjee\x1b\x5c");

const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const readline = require("readline");
const gradient = require("gradient-string");
const colors = require("colors");
const { promisify } = require("util");

// Main login class
class ShipuAiLogin {
  constructor() {
    this.dirAccount = this.resolvePath(global.client?.dirAccount || "account.dev.txt");
    this.config = global.GoatBot?.config || {};
    this.currentVersion = require("../../package.json").version;
    this.titles = this.getTitleArt();
    this.init().catch(err => {
      console.error("INIT ERROR:", err);
      process.exit(1);
    });
  }

  getTitleArt() {
    return [
      [
        "███████╗██╗  ██╗██╗██████╗ ██╗   ██╗",
        "██╔════╝██║  ██║██║██╔══██╗██║   ██║",
        "███████╗███████║██║██████╔╝██║   ██║",
        "╚════██║██╔══██║██║██╔═══╝ ██║   ██║",
        "███████║██║  ██║██║██║     ╚██████╔╝",
        "╚══════╝╚═╝  ╚═╝╚═╝╚═╝      ╚═════╝",
        "",
        " █████╗ ██╗",
        "██╔══██╗██║",
        "███████║██║",
        "██╔══██║██║",
        "██║  ██║██║",
        "╚═╝  ╚═╝╚═╝"
      ],
      [
        "Shipu",
        "  AI",
        "",
        "made by Chitron Bhattacharjee"
      ],
      [
        `Shipu AI @${this.currentVersion}`
      ],
      [
        "Shipu AI"
      ]
    ];
  }

  resolvePath(filePath, fallback = "") {
    try {
      return path.resolve(process.cwd(), filePath || fallback);
    } catch (err) {
      console.error("PATH ERROR:", err.message);
      return path.resolve(process.cwd(), fallback);
    }
  }

  async init() {
    await this.showWelcome();
    await this.checkVersion();
    await this.startBot();
  }

  async showWelcome() {
    try {
      const maxWidth = process.stdout.columns || 80;
      const titleSet = this.getTitleForWidth(maxWidth);
      
      console.log(gradient("#f5af19", "#f12711")(this.createLine(null, true)));
      console.log();
      
      for (const text of titleSet) {
        const textColor = text.includes("made by") 
          ? gradient("#888888", "#AAAAAA")(text) 
          : gradient("#FA8BFF", "#2BD2FF", "#2BFF88")(text);
        this.centerText(textColor, text.length);
      }
      
      const subTitle = `Shipu AI @${this.currentVersion} - Advanced AI Assistant`;
      this.centerText(gradient("#9F98E8", "#AFF6CF")(subTitle), subTitle.length);
      
      const srcUrl = "https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/package.json";
      this.centerText(gradient("#9F98E8", "#AFF6CF")(srcUrl), srcUrl.length);
    } catch (err) {
      console.error("WELCOME ERROR:", err);
    }
  }

  getTitleForWidth(width) {
    if (width > 58) return this.titles[0];
    if (width > 36) return this.titles[1];
    if (width > 26) return this.titles[2];
    return this.titles[3];
  }

  centerText(text, length) {
    const width = process.stdout.columns;
    const leftPadding = Math.floor((width - (length || text.length)) / 2);
    const rightPadding = width - leftPadding - (length || text.length);
    const paddedString = ' '.repeat(Math.max(0, leftPadding)) + text + ' '.repeat(Math.max(0, rightPadding));
    console.log(paddedString);
  }

  createLine(content, isMaxWidth = false) {
    const width = isMaxWidth ? process.stdout.columns : Math.min(process.stdout.columns, 50);
    if (!content) return '─'.repeat(width);
    
    content = ` ${content.trim()} `;
    const lineLength = width - content.length;
    const left = Math.floor(lineLength / 2);
    return '─'.repeat(left) + content + '─'.repeat(lineLength - left);
  }

  async checkVersion() {
    try {
      const { data: { version } } = await axios.get(
        "https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/package.json",
        { timeout: 5000 }
      );
      
      if (this.compareVersion(version, this.currentVersion) === 1) {
        console.log("Update available!");
      }
    } catch (err) {
      console.warn("Version check failed:", err.message);
    }
  }

  compareVersion(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1;
      if (parts1[i] < parts2[i]) return -1;
    }
    return 0;
  }

  async startBot() {
    console.log(colors.hex("#f5ab00")(this.createLine("STARTING SHIPU AI", true)));
    
    try {
      // Bot startup logic here
      console.log("Shipu AI initializing...");
    } catch (err) {
      console.error("STARTUP ERROR:", err);
      process.exit(1);
    }
  }
}

// Start the bot
new ShipuAiLogin();
