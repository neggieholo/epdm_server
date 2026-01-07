// routes/news.js
const express = require("express");
const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const { IndustryAward } = require('../../models/admin');
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Cloudinary config
cloudinary.config({
    cloud_name: "diubaoqcr",
    api_key: "962197146245963",
    api_secret: process.env.CLOUDINARYAPISECRET,
});

// Multer setup
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

    const saved = new IndustryAward({ heading, sections: parsedSections });
    await saved.save();

    res.json({ success: true, industryAward: saved });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ------------------------------------------------------
// 📌 GET ALL local content
// ------------------------------------------------------
router.get("/", async (req, res) => {
    try {
        const all = await IndustryAward.find().sort({ createdAt: -1 });
        res.json({ success: true, industryawards: all });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ------------------------------------------------------
// 📌 GET one local content item
// ------------------------------------------------------
router.get("/:id", async (req, res) => {
    try {
        const industryAward = await IndustryAward.findById(req.params.id);
        if (!industryAward) {
            return res.status(404).json({ error: "Industry awards not found" });
        }

        res.json({ success: true, industryAward });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ------------------------------------------------------
// 📌 DELETE local content
// ------------------------------------------------------
router.delete("/delete/:id", async (req, res) => {
    // if (!req.isAuthenticated()) {
    //     return res.status(401).json({ error: "Unauthorized: Login required" });
    // }

    try {
        await IndustryAward.findOneAndDelete({ _id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;