// server.js

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Image = require("./models/Image"); // import schema

const app = express();
const PORT = process.env.PORT || 3000;

// Debug: confirm URI
console.log("MONGO_URI:", process.env.MONGO_URI);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json());

// Upload route (dynamic folder + timestamp auto)
app.post("/upload", async (req, res) => {
  try {
    const { imageUrl, folderName } = req.body;

    const newImage = new Image({
      url: imageUrl,
      folder: folderName,
    });

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
