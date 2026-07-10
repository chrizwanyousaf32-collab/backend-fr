// models/Image.js

const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },       // Cloudinary URL
  folder: { type: String, required: true },    // dynamic folder name
  uploadedAt: { type: Date, default: Date.now } // auto timestamp
});

module.exports = mongoose.model("Image", imageSchema);
