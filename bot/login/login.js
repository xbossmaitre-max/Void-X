process.on('unhandledRejection', error => console.log(error));
process.on('uncaughtException', error => console.log(error));

// Set bash title
process.stdout.write("\x1b]2;It's ShiPu Ai - Optimised by Chitron Bhattacharjee\x1b\x5c");

// Improved require and initialization
const defaultRequire = require;
const fs = defaultRequire("fs-extra");
const path = defaultRequire("path");
const axios = defaultRequire("axios");
const readline = defaultRequire("readline");
const gradient = defaultRequire("gradient-string");
const toptp = defaultRequire("totp-generator");
const qr = new (defaultRequire("qrcode-reader"))();
const Canvas = defaultRequire("canvas");
const https = defaultRequire("https");

// Enhanced path resolution
function resolvePath(filePath, fallback = "") {
  try {
    return path.resolve(process.cwd(), filePath || fallback);
  } catch (err) {
    console.error("PATH ERROR:", err.message);
    return path.resolve(process.cwd(), fallback);
  }
}

// Safe file operations
async function safeFileOps(filePath, operation, fallback) {
  try {
    if (!fs.existsSync(filePath)) throw new Error("File not found");
    return await operation(filePath);
  } catch (err) {
    console.error("FILE ERROR:", err.message);
    return fallback;
  }
}

// Main login class
class GoatBotLogin {
  constructor() {
    this.dirAccount = resolvePath(global.client?.dirAccount || "account.dev.txt");
    this.config = global.GoatBot?.config || {};
    this.currentVersion = require("../../package.json").version;
    this.init().catch(err => {
      console.error("INIT ERROR:", err);
      process.exit(1);
    });
  }

  async init() {
    await this.showWelcome();
    await this.checkVersion();
    await this.startBot();
  }

  async showWelcome() {
    const titles = [
      // ... (keep your existing title art)
    ];
    
    const maxWidth = process.stdout.columns;
    const title = maxWidth > 58 ? titles[0] : 
                 maxWidth > 36 ? titles[1] : 
                 maxWidth > 26 ? titles[2] : titles[3];

    console.log(gradient("#f5af19", "#f12711")(this.createLine(null, true)));
    console.log();
    
    for (const text of title) {
      const textColor = gradient("#FA8BFF", "#2BD2FF", "#2BFF88")(text);
      this.centerText(textColor, text.length);
    }
    
    // ... (rest of your welcome message)
  }

  async checkVersion() {
    try {
      const { data: version } = await axios.get(
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

  async startBot() {
    console.log(colors.hex("#f5ab00")(this.createLine("START LOGGING IN", true)));
    
    try {
      const appState = await this.getAppState();
      await this.loginBot(appState);
    } catch (err) {
      console.error("Login failed:", err);
      process.exit(1);
    }
  }

  async getAppState() {
    // Implement your app state retrieval logic here
    // With improved error handling and validation
  }

  async loginBot(appState) {
    // Implement your bot login logic here
    // With proper error handling and state management
  }

  // Utility methods
  centerText(text, length) {
    // ... (your existing implementation)
  }

  createLine(content, isMaxWidth = false) {
    // ... (your existing implementation)
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
}

// Start the bot
new GoatBotLogin();
