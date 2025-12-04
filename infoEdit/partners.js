const express = require('express');
const multer = require('multer');
const { Partners } = require('../models/admin'); // import your Partners model
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const router = express.Router();

// Cloudinary config
cloudinary.config({
    cloud_name: 'diubaoqcr',
    api_key: '962197146245963',
    api_secret: process.env.CLOUDINARYAPISECRET
});

// Multer storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'partners',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
    },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// Get all partners
router.get('/', async (req, res) => {
    try {
        const partners = await Partners.find().sort({ createdAt: -1 });
        res.json({ success: true, partners });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new partner
router.post(
    '/add_partner',
    (req, res, next) => {
        upload.single('logo')(req, res, (err) => {
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: 'Image too large. Max size is 5MB' });
                }
                return res.status(400).json({ error: err.message });
            }
            next();
        });
    },
    async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.json({ error: "Unauthorized: Login required" });
        }

        try {
            const { name, website } = req.body;
            const logoUrl = req.file ? req.file.path : null;

            const partner = new Partners({ name, website, logoUrl });
            await partner.save();

            res.json({ success: true, partner });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// Update partner
router.put('/update_partner/:id', upload.single('logo'), async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({ error: "Unauthorized: Login required" });
    }
    try {
        const { name, website } = req.body;
        const updateData = { name, website };
        if (req.file) updateData.logoUrl = req.file.path;

        const partner = await Partners.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({ success: true, partner });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete partner
router.delete('/delete_partner/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({ error: "Unauthorized: Login required" });
    }
    try {
        await Partners.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
