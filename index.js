
const express = require("express");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve chitron.html on root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "chitron.html"));
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Serving chitron.html at http://localhost:${PORT}`);
});

// Function to start a bot instance with specific appstate file
function startBot(accountFileName) {
  const env = { ...process.env, ACCOUNT_FILE: accountFileName };
  const child = spawn("node", ["Goat.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
    env
  });

  child.on("close", (code) => {
    if (code === 2) {
      console.log(`[${accountFileName}] Restarting bot...`);
      startBot(accountFileName);
    }
  });
}

// 🚀 Start both bots
startBot("account.dev.txt");    // Bot for first ID
