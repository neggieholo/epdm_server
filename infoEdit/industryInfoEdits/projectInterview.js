// routes/news.js
const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const { ProjectInterview } = require('../../models/admin');

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
                folder: "news",
                allowed_formats: ["jpg", "png", "jpeg"],
                transformation: [{ width: 1000, crop: "limit" }]
            };
        }

        // Video
        if (file.mimetype.startsWith("video/") || file.originalname.match(/\.(mp4|mov)$/i)) {
            return {
                folder: "newsvideos",
                resource_type: "video", // important!
                allowed_formats: ["mp4", "mov"],
                chunk_size: 6000000, // 6MB chu
                // no transformation
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

router.post(
    "/create",
    upload.array("media"),
    async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: "Unauthorized: Login required" });
        }

        try {
            const { heading } = req.body;
            let { sections } = req.body;
            // console.log("News contents:", { 'Heading': heading, 'Sections': sections });

            if (!heading || !heading.trim()) {
                return res.status(400).json({ error: "Heading is required" });
            }

            // 🔑 Parse sections safely
            let parsedSections;
            try {
                parsedSections = typeof sections === "string"
                    ? JSON.parse(sections)
                    : sections;
            } catch (e) {
                return res.status(400).json({ error: "Invalid sections JSON" });
            }

            // 🔄 Replace "__UPLOAD__" placeholders with Cloudinary URLs
            let fileIndex = 0;
            parsedSections = parsedSections.map((sec) => {
                if (
                    (sec.type === "image" || sec.type === "video") &&
                    sec.content === "__UPLOAD__"
                ) {
                    const uploadedFile = req.files[fileIndex];
                    if (uploadedFile) {
                        const fileUrl = uploadedFile.path; // Cloudinary secure URL
                        fileIndex++;
                        return { ...sec, content: fileUrl }; // caption preserved
                    }
                }
                return sec;
            });

            // 📝 Save to Mongo
            const interview = new ProjectInterview({ heading, sections: parsedSections });
            await interview.save();

            // console.log("✅ News created:", news);
            res.json({ success: true, interview });
        } catch (err) {
            console.error("❌ Error creating news:", err);
            res.status(500).json({ error: err.message || "Server error" });
        }
    }
);

// 📌 Get all news
router.get("/", async (req, res) => {
    try {
        const allInterviews = await ProjectInterview.find().sort({ createdAt: -1 });
        res.json({ success: true, interviews: allInterviews });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Get single interview by ID
router.get("/:id", async (req, res) => {
    try {
        console.log("🎯 Interview item API hit");
        const interview = await ProjectInterview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ error: "Interview not found" });
        }

        res.json({ success: true, interview });
    } catch (err) {
        console.error("❌ Error fetching interview:", err);
        res.status(500).json({ error: err.message || "Server error" });
    }
});

router.delete("/delete/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({ error: "Unauthorized: Login required" });
    }

    try {
        await ProjectInterview.findOneAndDelete({ _id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.json({ error: err.message });
    }
});

module.exports = router;
