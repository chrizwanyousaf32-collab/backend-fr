const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const app = express();

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Schema for images
const imageSchema = new mongoose.Schema({
  folder: String,
  url: String,
});
const Image = mongoose.model("Image", imageSchema);

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ✅ Multer setup (temporary storage)
const storage = multer.diskStorage({});
const upload = multer({ storage });

// ✅ EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Home page: list folders
app.get("/", async (req, res) => {
  const folders = await Image.distinct("folder");
  res.render("index", { folders });
});

// Folder page: show images + upload form
app.get("/folder/:name", async (req, res) => {
  const folderName = req.params.name;
  const images = await Image.find({ folder: folderName });
  res.render("folder", { folderName, images });
});

// ✅ Upload route with error handling
app.post("/upload/:folder", upload.single("image"), async (req, res) => {
  const folderName = req.params.folder;
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: folderName,
    });

    if (!result || !result.secure_url) {
      throw new Error("Cloudinary did not return a URL");
    }

    const newImage = new Image({
      folder: folderName,
      url: result.secure_url,
    });
    await newImage.save();

    res.redirect(`/folder/${folderName}`);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send("Upload failed: " + err.message);
  }
});

// ✅ Start server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
