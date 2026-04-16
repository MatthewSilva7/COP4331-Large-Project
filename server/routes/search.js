const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

// Escape regex special chars so user input is treated as plain text
function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Search study sessions with partial matching (server-side Mongo query)
// Example:
// GET /api/search/sessions?q=calc
// Optional:
//   excludeUserId=<userId>   -> excludes sessions hosted by this user
//   limit=<number>           -> max results (default 25, max 100)
router.get('/sessions', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const excludeUserId = String(req.query.excludeUserId || '').trim();
    const limitRaw = Number(req.query.limit);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 100)
      : 25;

    if (!q) {
      return res.status(400).json({ message: 'Missing required query param: q' });
    }

    const pattern = escapeRegex(q);
    const query = {
      $or: [
        { subject: { $regex: pattern, $options: 'i' } },
        { courseName: { $regex: pattern, $options: 'i' } }, // NEW: Searches the full course title
        { location: { $regex: pattern, $options: 'i' } },
        { hostName: { $regex: pattern, $options: 'i' } }
      ]
    };

    if (excludeUserId) {
      query.userId = { $ne: excludeUserId };
    }

    const sessions = await Session.find(query).sort({ createdAt: -1 }).limit(limit);

    return res.json({
      query: q,
      count: sessions.length,
      sessions
    });
  } catch (err) {
    return res.status(500).json({ message: 'Search failed' });
  }
});

module.exports = router;

