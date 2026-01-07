// routes/news.js
const express = require("express");
const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const { News } = require('../models/admin');
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Cloudinary config
cloudinary.config({
    cloud_name: "diubaoqcr",
    api_key: "962197146245963",
    api_secret: process.env.CLOUDINARYAPISECRET,
});

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // temp folder
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

router.post("/create", upload.any(), async (req, res) => {
  try {
    const { heading } = req.body;
    let { sections } = req.body;

    if (!heading || !heading.trim()) {
      return res.status(400).json({ error: "Heading is required" });
    }

    const parsedSections =
      typeof sections === "string" ? JSON.parse(sections) : sections;

    let fileIndex = 0;

    for (const sec of parsedSections) {
      if (sec.content === "__UPLOAD__") {
        const file = req.files[fileIndex];
        if (!file) continue;

        let result;

        if (file.mimetype.startsWith("video/")) {
          result =  await cloudinary.uploader.upload(file.path, {
            resource_type: "video",
            folder: "industryvideos",
        });
        } else if (file.mimetype.startsWith("image/")) {
          result = await cloudinary.uploader.upload(file.path, {
            folder: "industryimages",
            transformation: [{ width: 1000, crop: "limit" }]
          });
        } else if (file.mimetype === "application/pdf") {
          result = await cloudinary.uploader.upload(file.path, {
            resource_type: "raw",
            folder: "industryPDFs"
          });
        }

        sec.content = result.secure_url;
        fs.unlink(file.path, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
        });

        fileIndex++;
      }
    }

    const news = new News({ heading, sections: parsedSections });
    await news.save();

    // console.log("✅ News created:", news);
    res.json({ success: true, news });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get all news
router.get("/", async (req, res) => {
    try {
        const allNews = await News.find().sort({ createdAt: -1 });
        res.json({ success: true, news: allNews });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single news item by ID
router.get("/:id", async (req, res) => {
    try {
        console.log("news item api hit")
        const newsItem = await News.findById(req.params.id);
        console.log("id", req.params.id);
        if (!newsItem) {
            return res.status(404).json({ error: "News item not found" });
        }
        res.json({ success: true, news: newsItem });
    } catch (err) {
        console.error("❌ Error fetching news item:", err);
        res.status(500).json({ error: err.message || "Server error" });
    }
});


router.delete("/delete/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({ error: "Unauthorized: Login required" });
    }

    try {
        await News.findOneAndDelete({ _id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.json({ error: err.message });
    }
});

module.exports = router;
