const express = require('express');
const router = express.Router();
const Logger = require('../models/logger');

router.get('/', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({ error: "Unauthorized: Login required" });
    }
    try {
        const loggers = await Logger.find({});
        res.json({ success: true, loggers });
    } catch (err) {
        console.error("Error fetching loggers:", err);
        res.status(500).json({ success: false, error: "Failed to fetch loggers" });
    }
});

router.get('/find/:id', async (req, res) => {
    try {
        const logger = await Logger.findById(req.params.id);
        if (!logger) {
            return res.status(404).json({ success: false, error: "Logger not found" });
        }
        res.json({ success: true, logger });
    } catch (err) {
        console.error("Error fetching logger by ID:", err);
        res.status(500).json({ success: false, error: "Failed to fetch logger" });
    }
});

// Toggle suspend/unsuspend a user
router.patch('/suspend/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({ error: "Unauthorized: Login required" });
    }
    try {
        const logger = await Logger.findById(req.params.id);

        if (!logger) {
            return res.status(404).json({ success: false, error: "Logger not found" });
        }

        // Toggle suspension
        logger.suspended = !logger.suspended;
        await logger.save();

        res.json({
            success: true,
            message: logger.suspended
                ? "User has been suspended"
                : "User has been unsuspended",
            logger
        });
    } catch (err) {
        console.error("Error toggling suspension:", err);
        res.status(500).json({ success: false, error: "Failed to update suspension status" });
    }
});

// Delete user by ID
router.delete('/delete/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({ error: "Unauthorized: Login required" });
    }
    try {
        const logger = await Logger.findByIdAndDelete(req.params.id);

        if (!logger) {
            return res.status(404).json({ success: false, error: "Logger not found" });
        }

        res.json({
            success: true,
            message: "User deleted successfully",
            deletedUserId: logger._id
        });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ success: false, error: "Failed to delete user" });
    }
});


module.exports = router;