const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const ftp = require("basic-ftp");

module.exports = {
  config: {
    name: "ftp",
    version: "2.0",
    author: "Chitron Bhattacharjee",
    countDown: 5,
    role: 2,
    shortDescription: { en: "Upload, list, delete FTP files" },
    description: {
      en: "Upload .js/.php/.html/.txt/.py/.json files to htdocs/lume/store via FTP, also list and delete"
    },
    category: "tools",
    guide: {
      en:
        "📤 Upload:\n" +
        "+ftp filename.js code_here\n" +
        "+ftp filename.js https://link\n\n" +
        "📄 List:\n" +
        "+ftp list\n\n" +
        "🗑 Delete:\n" +
        "+ftp delete filename.js"
    }
  },

  onStart: async function ({ message, args }) {
    const subCmd = args[0];

    // === 🧾 List Files ===
    if (subCmd === "list") {
      return await listFiles(message);
    }

    // === 🗑 Delete File ===
    if (subCmd === "delete") {
      const filename = args[1];
      if (!filename) return message.reply("❌ Please specify a filename to delete.");
      return await deleteFile(message, filename);
    }

    // === 📤 Upload File ===
    const [filename, ...rest] = args;
    if (!filename || !/\.(js|php|html|txt|py|json)$/i.test(filename)) {
      return message.reply("❌ Valid filename required (.js, .txt, .php, etc).");
    }

    const content = rest.join(" ");
    if (!content) return message.reply("❌ Provide code or URL to upload.");

    let code;
    try {
      code = /^https?:\/\//i.test(content.trim())
        ? (await axios.get(content.trim())).data
        : content;
    } catch (err) {
      return message.reply("❌ Could not fetch code content.");
    }

    const tempPath = path.join(__dirname, "cache", filename);
    await fs.ensureDir(path.dirname(tempPath));
    await fs.writeFile(tempPath, code);

    const client = new ftp.Client();
    try {
      await client.access({
        host: "ftpupload.net",
        user: "ezyro_39371516",
        password: "64463ae",
        secure: false,
        port: 21
      });

      // Navigate to /htdocs/lume/store (create if not exists)
      await client.cd("htdocs");
      try {
        await client.send("MKD lume");
      } catch (e) {}
      await client.cd("lume");
      try {
        await client.send("MKD store");
      } catch (e) {}
      await client.cd("store");

      await client.uploadFrom(tempPath, filename);
      await client.close();

      return message.reply(`✅ Uploaded \`${filename}\` to \`htdocs/lume/store\``);
    } catch (err) {
      return message.reply(`❌ FTP upload failed: ${err.message}`);
    } finally {
      client.close();
      await fs.remove(tempPath);
    }
  }
};

// === 📄 List Files Function ===
async function listFiles(message) {
  const client = new ftp.Client();
  try {
    await client.access({
      host: "ftpupload.net",
      user: "cpfr_39361582",
      password: "chitron@2448766",
      secure: false,
      port: 21
    });

    await client.cd("htdocs/lume/store");
    const files = await client.list();

    if (!files.length) return message.reply("📂 No files found in `/htdocs/lume/store`.");

    const fileList = files
      .map((f, i) => `📄 ${i + 1}. ${f.name} (${f.size} bytes)`)
      .join("\n");

    return message.reply(`📁 Files in \`htdocs/lume/store\`:\n\n${fileList}`);
  } catch (err) {
    return message.reply("❌ Failed to list files.");
  } finally {
    client.close();
  }
}

// === 🗑 Delete File Function ===
async function deleteFile(message, filename) {
  const client = new ftp.Client();
  try {
    await client.access({
      host: "ftpupload.net",
      user: "ezyro_39371516",
      password: "64463ae",
      secure: false,
      port: 21
    });

    await client.remove(`htdocs/lume/store/${filename}`);
    return message.reply(`🗑️ Deleted \`${filename}\` from \`htdocs/lume/store\``);
  } catch (err) {
    return message.reply(`❌ Could not delete: ${err.message}`);
  } finally {
    client.close();
  }
}
