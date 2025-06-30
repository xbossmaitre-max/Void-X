process.on('unhandledRejection', error => console.log(error));
process.on('uncaughtException', error => console.log(error));

const axios = require("axios");
const fs = require("fs-extra");
const { execSync } = require('child_process');
const log = require('./logger/log.js');
const path = require("path");

process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0;

// Safe path resolution function
function resolvePath(filePath, defaultPath) {
  try {
    if (!filePath) return path.normalize(`${__dirname}/${defaultPath}`);
    return path.normalize(`${__dirname}/${filePath}`);
  } catch (err) {
    log.error("PATH", `Invalid path: ${filePath || 'undefined'}`);
    return path.normalize(`${__dirname}/${defaultPath}`);
  }
}

// Load config files with validation
const { NODE_ENV } = process.env;
const dirConfig = resolvePath(
  `config${['production', 'development'].includes(NODE_ENV) ? '.dev.json' : '.json'}`,
  'config.json'
);
const dirConfigCommands = resolvePath(
  `configCommands${['production', 'development'].includes(NODE_ENV) ? '.dev.json' : '.json'}`,
  'configCommands.json'
);
const dirAccount = resolvePath(
  process.env.ACCOUNT_FILE || 'account.dev.txt',
  'account.dev.txt'
);

// Validate configs
function validateConfig(pathDir) {
  try {
    if (!fs.existsSync(pathDir)) {
      throw new Error(`File not found: ${pathDir.replace(__dirname, '')}`);
    }
    execSync(`npx jsonlint "${pathDir}"`, { stdio: 'pipe' });
    return true;
  } catch (err) {
    const cleanError = err.message.split('\n')
      .slice(1)
      .join('\n')
      .replace(/at.*$/s, '')
      .trim();
    throw new Error(cleanError);
  }
}

for (const [pathDir, name] of [
  [dirConfig, 'Config'],
  [dirConfigCommands, 'Commands Config']
]) {
  try {
    validateConfig(pathDir);
  } catch (err) {
    log.error("CONFIG", `${name} file invalid:\n${err.message}`);
    process.exit(1);
  }
}

// Load configs safely
const config = require(dirConfig);
const configCommands = require(dirConfigCommands);

// Initialize global objects
global.GoatBot = {
  startTime: Date.now() - process.uptime() * 1000,
  config,
  configCommands,
  // ... (keep other properties from original)
};

// Initialize utils with safe defaults
global.utils = require("./utils.js");
global.utils.sendMail = () => Promise.reject(new Error("Email disabled"));
global.utils.drive = global.utils.drive || {
  upload: () => Promise.reject(new Error("Drive not configured")),
  checkAndCreateParentFolder: () => Promise.resolve(null)
};

// Main execution
(async () => {
  try {
    // Version check
    try {
      const { data: { version } } = await axios.get(
        "https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/package.json",
        { timeout: 5000 }
      );
      const currentVersion = require("./package.json").version;
      if (compareVersion(version, currentVersion) === 1) {
        log.master("UPDATE", `Update available: v${currentVersion} → v${version}`);
      }
    } catch (e) {
      log.warn("UPDATE", "Could not check for updates");
    }

    // Start bot login
    const loginFile = `./bot/login/login${NODE_ENV === 'development' ? '.dev.js' : '.js'}`;
    if (fs.existsSync(loginFile)) {
      require(loginFile);
    } else {
      throw new Error(`Login file not found: ${loginFile}`);
    }
  } catch (err) {
    log.error("STARTUP", `Failed to start: ${err.message}`);
    process.exit(1);
  }
})();

function compareVersion(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (parts1[i] > parts2[i]) return 1;
    if (parts1[i] < parts2[i]) return -1;
  }
  return 0;
}
