process.on('unhandledRejection', error => console.log(error));
process.on('uncaughtException', error => console.log(error));

const axios = require("axios");
const fs = require("fs-extra");
const { execSync } = require('child_process');
const log = require('./logger/log.js');
const path = require("path");

process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0;

function validJSON(pathDir) {
  try {
    if (!fs.existsSync(pathDir)) throw new Error(`File "${pathDir}" not found`);
    execSync(`npx jsonlint "${pathDir}"`, { stdio: 'pipe' });
    return true;
  } catch (err) {
    let msgError = err.message.split("\n").slice(1).join("\n");
    const indexPos = msgError.indexOf("    at");
    throw new Error(msgError.slice(0, indexPos != -1 ? indexPos - 1 : msgError.length));
  }
}

// Load config files
const { NODE_ENV } = process.env;
const dirConfig = path.normalize(`${__dirname}/config${['production', 'development'].includes(NODE_ENV) ? '.dev.json' : '.json'}`);
const dirConfigCommands = path.normalize(`${__dirname}/configCommands${['production', 'development'].includes(NODE_ENV) ? '.dev.json' : '.json'}`);
const dirAccount = path.normalize(`${__dirname}/${process.env.ACCOUNT_FILE || 'account.dev.txt'}`);

// Validate configs
for (const pathDir of [dirConfig, dirConfigCommands]) {
  try {
    validJSON(pathDir);
  } catch (err) {
    log.error("CONFIG", `Invalid JSON file "${pathDir.replace(__dirname, "")}":\n${err.message.split("\n").map(line => `  ${line}`).join("\n")}\nPlease fix it and restart bot`);
    process.exit(0);
  }
}

const config = require(dirConfig);
const configCommands = require(dirConfigCommands);

// Initialize global objects
global.GoatBot = {
  startTime: Date.now() - process.uptime() * 1000,
  config,
  configCommands,
  // ... (keep all other existing properties from your original file)
};

global.utils = require("./utils.js");
global.client = { /* ... (keep original client setup) */ };
global.db = { /* ... (keep original db setup) */ };
global.temp = { /* ... (keep original temp setup) */ };

// Watch config files for changes
const watchAndReloadConfig = (dir, type, prop, logName) => {
  let lastModified = fs.statSync(dir).mtimeMs;
  fs.watch(dir, (eventType) => {
    if (eventType === type && lastModified !== fs.statSync(dir).mtimeMs) {
      try {
        global.GoatBot[prop] = JSON.parse(fs.readFileSync(dir, 'utf-8'));
        log.success(logName, `Reloaded ${path.basename(dir)}`);
      } catch (err) {
        log.warn(logName, `Failed to reload ${path.basename(dir)}`);
      }
      lastModified = fs.statSync(dir).mtimeMs;
    }
  });
};

watchAndReloadConfig(dirConfigCommands, 'change', 'configCommands', 'CONFIG COMMANDS');
watchAndReloadConfig(dirConfig, 'change', 'config', 'CONFIG');

// Main bot startup
(async () => {
  // Disable email features
  utils.log.warn("SYSTEM", "Email features are disabled");
  global.utils.sendMail = () => Promise.reject(new Error("Email disabled in config"));

  // Version check
  try {
    const { data: { version } } = await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/package.json");
    const currentVersion = require("./package.json").version;
    if (version !== currentVersion) {
      utils.log.master("UPDATE", `New version available: ${currentVersion} → ${version}`);
    }
  } catch {
    utils.log.warn("UPDATE", "Failed to check for updates");
  }

  // Initialize Google Drive (with error handling)
  try {
    if (config.credentials?.googleDrive) {
      const parentId = await global.utils.drive.checkAndCreateParentFolder("GoatBot");
      global.utils.drive.parentID = parentId;
      utils.log.success("DRIVE", "Google Drive connected");
    } else {
      throw new Error("No Drive credentials in config");
    }
  } catch (err) {
    utils.log.error("DRIVE", `Google Drive failed: ${err.message}`);
    global.utils.drive = {
      upload: () => Promise.reject(new Error("Drive not available")),
      checkAndCreateParentFolder: () => Promise.resolve(null)
    };
  }

  // Start the bot
  require(`./bot/login/login${NODE_ENV === 'development' ? '.dev.js' : '.js'}`);
})();

function compareVersion(version1, version2) {
  const v1 = version1.split('.').map(Number);
  const v2 = version2.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (v1[i] > v2[i]) return 1;
    if (v1[i] < v2[i]) return -1;
  }
  return 0;
}
