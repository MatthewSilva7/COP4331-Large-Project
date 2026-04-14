const express = require('express');
const router = express.Router();
const User = require('../models/User');

// View Profile
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('firstName lastName major courses email');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Save Profile
router.put('/:id', async (req, res) => {
    try {
        const { firstName, lastName, email, major, courses } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { firstName, lastName, email, major, courses },
            { new: true, runValidators: true }
        ).select('-password');
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});

module.exports = router;