const fs = require("fs-extra");
const path = require("path");
const https = require("https");

module.exports = {
  config: {
    name: "flickr",
    version: "1.0",
    author: "Chitron Bhattacharjee",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Random flickr-like image" },
    longDescription: { en: "Sends a random image via LoremFlickr" },
    category: "fun",
    guide: { en: "+flickr" }
  },

  onStart: async function({ message }) {
    const imgUrl = "https://loremflickr.com/600/400";
    const filePath =
