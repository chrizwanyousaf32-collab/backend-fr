// server.js

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

// Debug: confirm URI
console.log("MONGO_URI:", process.env.MONGO_URI);

// ✅ Connect to MongoDB (no deprecated options)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(express.json());

// ✅ Inline Image schema
const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },       // Cloudinary URL
  folder: { type: String, required: true },    // dynamic folder name
  uploadedAt: { type: Date, default: Date.now } // auto timestamp
});

const Image = mongoose.model("Image", imageSchema);

// Upload route
app.post("/upload", async (req, res) => {
  try {
    const { imageUrl, folderName } = req.body;
    const newImage = new Image({ url: imageUrl, folder: folderName });
    await newImage.save();
    res.json({ success: true, image: newImage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch images by folder
app.get("/images/:folderName", async (req, res) => {
  try {
    const images = await Image.find({ folder: req.params.folderName });
    res.json(images.map(img => ({
      url: img.url,
      folder: img.folder,
      uploadedAt: img.uploadedAt
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
