const express = require('express');
const router = express.Router();
const User = require('../models/User');

// VIEW PROFILE
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: "User not found" });

        // Transform _id to id to match the frontend 'AuthUser' interface
        const userResponse = user.toObject();
        userResponse.id = userResponse._id;

        res.json(userResponse);
    } catch (err) {
        res.status(500).json({ error: "Server error fetching profile" });
    }
});

// UPDATE PROFILE
router.post('/update', async (req, res) => {
    const { userId, firstName, lastName, major, courses } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { firstName, lastName, major, courses },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ error: "User not found" });

        // Transform _id to id to match the frontend 'AuthUser' interface
        const userResponse = updatedUser.toObject();
        userResponse.id = userResponse._id.toString();

        res.json(userResponse);
    } catch (err) {
        res.status(400).json({ error: "Update failed: " + err.message });
    }
});

module.exports = router;