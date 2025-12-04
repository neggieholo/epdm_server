const express = require("express");
const router = express.Router();
const { NewsLink } = require('../models/admin');

// ✅ Create one or multiple links
router.post("/save", async (req, res) => {
    try {
        const { links } = req.body;

        if (!Array.isArray(links) || links.length === 0) {
            return res.status(400).json({ error: "Links must be a non-empty array" });
        }

        // 🧹 Normalize incoming data & preserve order
        const cleanedLinks = links.map((l, i) => ({
            title: l.title,
            link: l.link,
            order: i // maintain incoming order
        }));

        // 🔄 Reset collection
        await NewsLink.deleteMany({});

        // 💾 Insert new set
        const saved = await NewsLink.insertMany(cleanedLinks);

        // 🔁 Reverse before sending back (newest first)
        // const reversed = saved.sort((a, b) => b.order - a.order);
        // res.status(201).json({ success: true, links: reversed });
        res.status(201).json({ success: true, links: saved });
    } catch (err) {
        console.error("❌ Save error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const links = await NewsLink.find(); // 🔁 reverse order
        res.json({ success: true, links });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.delete("/delete/:id", async (req, res) => {
    try {
        const deleted = await NewsLink.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Link not found" });
        res.json({ success: true, data: deleted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
