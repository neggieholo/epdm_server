const express = require('express');
const router = express.Router();

const { AboutUs, Services } = require('../models/admin');

router.get('/about', async (req, res) => {
    try {
        const about = await AboutUs.findOne();
        res.json(about);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch About Us content' });
    }
});

// Update / Replace About Us content (admin only)
// POST /about
router.post('/about', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({ error: "Unauthorized: Login required" });
    }

    try {
        let { sections } = req.body;

        if (!Array.isArray(sections) || sections.length === 0) {
            return res.status(400).json({ error: "Sections are required" });
        }

        // Normalize sections: always include heading (default "")
        sections = sections.map(s => ({
            heading: s.heading ? s.heading : "",
            message: s.message
        }));

        let about = await AboutUs.findOne();

        if (about) {
            // Replace existing
            about.sections = sections;
        } else {
            // Create new
            about = new AboutUs({ sections });
        }

        await about.save();
        res.json({ success: true, about });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update About Us content' });
    }
});
// ======================
// Services Routes
// ======================

// Get Services content (public)
router.get('/services', async (req, res) => {
    console.log("Fetching Services content");
    try {
        const services = await Services.findOne();
        console.log("Fetched Services content:", services);
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch Services content' });
    }
});

router.post('/services', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({ error: "Unauthorized: Login required" });
    }

    try {
        const { heading, items } = req.body;

        if (!heading) {
            return res.status(400).json({ error: "Heading is required" });
        }

        if (!Array.isArray(items)) {
            return res.status(400).json({ error: "Items must be an array" });
        }

        let services = await Services.findOne();

        if (services) {
            services.heading = heading;
            services.items = items.map(i => ({ text: i.text || "" }));
        } else {
            services = new Services({
                heading,
                items: items.map(i => ({ text: i.text || "" }))
            });
        }

        await services.save();
        res.json({ success: true, services });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update Services content' });
    }
});


module.exports = router;
