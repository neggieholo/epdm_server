// routes/news.js
const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const { IndustryReport } = require('../../models/admin');

const router = express.Router();

// Cloudinary config
cloudinary.config({
    cloud_name: "diubaoqcr",
    api_key: "962197146245963",
    api_secret: process.env.CLOUDINARYAPISECRET,
});

// Multer setup
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        // console.log("Uploading file:", file.originalname, file.mimetype);

        // Image
        if (file.mimetype.startsWith("image/")) {
            return {
                folder: "industryimages",
                allowed_formats: ["jpg", "png", "jpeg"],
                transformation: [{ width: 1000, crop: "limit" }]
            };
        }

        // Video
        if (file.mimetype.startsWith("video/") || file.originalname.match(/\.(mp4|mov)$/i)) {
            return {
                folder: "industryvideos",
                resource_type: "video", // important!
                allowed_formats: ["mp4", "mov"]
                // no transformation
            };
        }

        if (file.mimetype === "application/pdf" || file.originalname.endsWith(".pdf")) {
            console.log("Detected PDF upload");
            return {
                folder: "industryPDFs",
                resource_type: "raw",
                format: "pdf"
            };
        }


        // Fallback: treat as raw
        return {
            folder: "news",
            resource_type: "raw"
        };
    }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); 



router.post("/create", upload.array("media"), async (req, res) => {
    // if (!req.isAuthenticated()) {
    //     return res.status(401).json({ error: "Unauthorized: Login required" });
    // }
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    try {
        const { heading } = req.body;
        let { sections } = req.body;

        if (!heading || !heading.trim()) {
            return res.status(400).json({ error: "Heading is required" });
        }

        // Parse sections JSON
        let parsedSections;
        try {
            parsedSections = typeof sections === "string" ? JSON.parse(sections) : sections;
        } catch (e) {
            return res.status(400).json({ error: "Invalid sections JSON" });
        }

        // Replace placeholders with Cloudinary URLs
        let fileIndex = 0;
        parsedSections = parsedSections.map((sec) => {
            if (
                (sec.type === "image" || sec.type === "video" || sec.type === "pdf") &&
                sec.content === "__UPLOAD__"
            ) {
                const uploaded = req.files[fileIndex];
                if (uploaded) {
                    const url = uploaded.path;
                    fileIndex++;
                    return { ...sec, content: url };
                }
            }
            return sec;
        });

        // Save
        const saved = new IndustryReport({ heading, sections: parsedSections });
        await saved.save();

        res.json({ success: true, industryReport: saved });
    } catch (err) {
        console.error("❌ Error creating local content:", err);
        res.status(500).json({ error: err.message });
    }
});


// ------------------------------------------------------
// 📌 GET ALL local content
// ------------------------------------------------------
router.get("/", async (req, res) => {
    try {
        const all = await IndustryReport.find().sort({ createdAt: -1 });
        res.json({ success: true, industryreports: all });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ------------------------------------------------------
// 📌 GET one local content item
// ------------------------------------------------------
router.get("/:id", async (req, res) => {
    try {
        const industryReport = await IndustryReport.findById(req.params.id);
        if (!industryReport) {
            return res.status(404).json({ error: "Industry reports not found" });
        }

        res.json({ success: true, industryReport });
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
        await IndustryReport.findOneAndDelete({ _id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;