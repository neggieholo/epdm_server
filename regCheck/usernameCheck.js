const express = require('express');
const Logger = require('../models/logger'); 
const router = express.Router();

router.get('/', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Username is required' });

  try {
    // Case-insensitive search
    const existingUser = await Logger.findOne({
      username: { $regex: `^${username}$`, $options: 'i' }
    });

    res.json({ exists: !!existingUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
