const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const { Team } = require('../models/admin');
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
        folder: 'team',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
    },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// Get all members sorted by order
router.get('/members', async (req, res) => {
  try {
    const members = await Team.find().sort({ order: 1 }); // sort by order
    res.json({ success: true, members });
  } catch (err) {
    res.json({ error: err.message });
  }
});


// Add new member
router.post(
  '/add_member',
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
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
      const { name, role, bio } = req.body;
      const image = req.file ? req.file.path : null;

      const lastMember = await Team.findOne().sort({ order: -1 });
      const nextOrder = lastMember ? lastMember.order + 1 : 1;

      const member = new Team({ name, role, bio, image, order: nextOrder });
      await member.save();

      res.json({ success: true, member });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


// Update member
router.put('/update_member/:id', upload.single('image'), async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({ error: "Unauthorized: Login required" });
    }
    try {
        const { name, role, bio } = req.body;
        const updateData = { name, role, bio };
        if (req.file) updateData.image = req.file.path;
        const member = await Team.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({ success: true, member });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reorder members
router.put('/reorder', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.json({ error: "Unauthorized: Login required" });
  }

  try {
    const { members } = req.body; // expects array of IDs in order

    if (!Array.isArray(members)) {
      return res.status(400).json({ error: "Members must be an array of IDs" });
    }

    // Update order for each member
    await Promise.all(
      members.map((id, index) =>
        Team.findByIdAndUpdate(id, { order: index })
      )
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Delete member
router.delete('/delete_member/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({ error: "Unauthorized: Login required" });
    }
    try {
        await Team.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
