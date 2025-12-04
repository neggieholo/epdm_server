// routes/terms.js
const express = require("express");
const { Terms, SocialLinks, Contact, Subscription } = require('../models/admin');

const router = express.Router();

// Get latest terms
router.get("/legalDocs/:type", async (req, res) => {
    try {
        const { type } = req.params;

        if (!["terms", "privacy"].includes(type)) {
            return res.status(400).json({ success: false, error: "Invalid document type" });
        }

        const doc = await Terms.findOne({ type }).sort({ createdAt: -1 });

        if (!doc) {
            return res.json({ success: true, doc: null }); // not an error, just empty
        }

        res.json({ success: true, doc });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Save new document for given type
router.post("/legalDocs/:type/save", async (req, res) => {
    try {
        const { type } = req.params;
        const { content } = req.body;

        if (!["terms", "privacy"].includes(type)) {
            return res.status(400).json({ success: false, error: "Invalid document type" });
        }

        if (!content) {
            return res.status(400).json({ success: false, error: "Content is required" });
        }

        // Optional: remove old versions
        await Terms.deleteMany({ type });

        const newDoc = new Terms({ type, content });
        await newDoc.save();

        res.json({ success: true, doc: newDoc });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


router.post("/legalDocs/pdf", async (req, res) => {
  const { content, docType } = req.body;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(content || "<p>No content</p>", { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "letter",
    margin: { top: "0.5in", bottom: "0.5in", left: "0.5in", right: "0.5in" },
  });

  await browser.close();

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=${docType}.pdf`,
    "Content-Length": pdfBuffer.length,
  });

  res.send(pdfBuffer);
});

// Get all social links
router.get("/social_links", async (req, res) => {
    try {
        const links = await SocialLinks.find({});
        const subscription = await Subscription.findOne({});
        const contact = await Contact.findOne().sort({ createdAt: -1 });
        res.json({ success: true, links, subscription, phones: contact ? contact.phones : [] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST: save or update social links + subscription
router.post("/social_links/save", async (req, res) => {
    try {
        const { links, subscription } = req.body;

        if (!Array.isArray(links)) {
            return res.status(400).json({ success: false, error: "Links must be an array" });
        }

        // Replace all links
        await SocialLinks.deleteMany({});
        await SocialLinks.insertMany(links);

        // Replace or update subscription
        await Subscription.deleteMany({});
        if (subscription) {
            await Subscription.create(subscription); // single object
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get("/contact", async (req, res) => {
    try {
        const contact = await Contact.findOne().sort({ createdAt: -1 });
        res.json({ success: true, contact });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post("/contact/save", async (req, res) => {
    try {
        const { companyName, address, phones, email, mapEmbedUrl } = req.body;

        if (!companyName) {
            return res.status(400).json({ success: false, error: "Company name is required" });
        }

        // Clear old contact(s)
        await Contact.deleteMany({});

        // Save new one
        const newContact = new Contact({
            companyName,
            address,
            phones,
            email,
            mapEmbedUrl
        });

        await newContact.save();

        res.json({ success: true, contact: newContact });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
