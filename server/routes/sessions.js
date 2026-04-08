const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

router.get('/user/:userId', async (req, res) => {
    try {
        const sessions = await Session.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ sessions: sessions });
    } catch (err) {
        res.status(500).json({ message: "Could not load hosted sessions" });
    }
});

router.get('/available/:userId', async (req, res) => {
    try {
        const sessions = await Session.find({ userId: { $ne: req.params.userId } }).sort({ createdAt: -1 });
        res.json({ sessions: sessions });
    } catch (err) {
        res.status(500).json({ message: "Could not load available sessions" });
    }
});

router.post('/create', async (req, res) => {
    try {
        const { subject, location, time, hostName, userId } = req.body;
        const newSession = new Session({ subject, location, time, hostName, userId });
        const savedSession = await newSession.save();
        res.status(201).json({ message: "Study session created!", session: savedSession });
    } catch (err) {
        res.status(500).json({ message: "Server error: Could not create session" });
    }
});

router.post('/join', async (req, res) => {
    try {
        res.status(200).json({ message: "Success! (Not saved to DB yet)", session: {} });
    } catch (err) {
        res.status(500).json({ message: "Error joining session" });
    }
});

module.exports = router;
