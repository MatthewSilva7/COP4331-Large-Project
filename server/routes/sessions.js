const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

// GET: Fetch sessions and simple stats for a specific user dashboard
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const sessions = await Session.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            stats: {
                sessionsHosted: sessions.length,
                sessionsJoined: 0,
                studyStreak: 0
            },
            sessions
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error: Could not load sessions" });
    }
});

// POST: Host a new study group (The "Submit" button on the popup)
router.post('/create', async (req, res) => {
    try {
        const { subject, location, time, hostName, userId } = req.body;

        // Create a new session instance using the Session Model
        const newSession = new Session({
            subject,
            location,
            time,
            hostName,
            userId // This is the ID of the user currently logged in
        });

        // Save to MongoDB
        const savedSession = await newSession.save();

        res.status(201).json({
            message: "Study session created!",
            session: savedSession
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error: Could not create session" });
    }
});

module.exports = router;
