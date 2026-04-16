const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

// 1. GET: Sessions the user hosts OR has joined
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const sessions = await Session.find({
            $or: [
                { userId: userId },
                { joinedUserIds: userId }
            ]
        })
        .populate('joinedUserIds', 'firstName lastName')
        .sort({ createdAt: -1 });

        const result = sessions.map(session => {
            const s = session.toObject();
            const isJoined = s.userId.toString() !== userId;
            return {
                ...s,
                participants: s.joinedUserIds,
                isJoined
            };
        });

        res.json({ sessions: result });
    } catch (err) {
        res.status(500).json({ message: "Could not load sessions" });
    }
});

// 2. GET: Available sessions (not hosted by user AND user hasn't already joined)
router.get('/available/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const sessions = await Session.find({
            userId: { $ne: userId },
            joinedUserIds: { $ne: userId }
        })
        .populate('joinedUserIds', 'firstName lastName')
        .sort({ createdAt: -1 });

        const result = sessions.map(session => {
            const s = session.toObject();
            return {
                ...s,
                participants: s.joinedUserIds,
                isJoined: false
            };
        });

        res.json({ sessions: result });
    } catch (err) {
        res.status(500).json({ message: "Could not load available sessions" });
    }
});

// 3. POST: Create a new session
router.post('/create', async (req, res) => {
    try {
        const { subject, location, time, hostName, userId } = req.body;
        const newSession = new Session({ subject, location, time, hostName, userId });
        const savedSession = await newSession.save();
        res.status(201).json({ message: "Study session created!", session: savedSession });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// 4. POST: Join a session
router.post('/join', async (req, res) => {
    try {
        const { sessionId, userId } = req.body;
        const session = await Session.findByIdAndUpdate(
            sessionId,
            { $addToSet: { joinedUserIds: userId } },
            { new: true }
        ).populate('joinedUserIds', 'firstName lastName');

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        res.status(200).json({ message: "Joined session!", session });
    } catch (err) {
        res.status(500).json({ message: "Error joining session" });
    }
});

// 5. POST: Leave a session
router.post('/leave', async (req, res) => {
    try {
        const { sessionId, userId } = req.body;
        const session = await Session.findByIdAndUpdate(
            sessionId,
            { $pull: { joinedUserIds: userId } },
            { new: true }
        ).populate('joinedUserIds', 'firstName lastName');

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        res.status(200).json({ message: "Successfully left the session!", session });
    } catch (err) {
        res.status(500).json({ message: "Error leaving session" });
    }
});

module.exports = router;
