const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔍 Searching for email:", email);
    
    const user = await User.findOne({ email });
    console.log("👤 User found in DB:", user);    // LOG 2

    if (!user) {
      console.log("❌ No user found with that email.");
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // 5-Point Check: Is email verified?
    if (!user.emailVerified) {
      return res.status(403).json({ message: "Please verify your email first." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({
      token,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// REGISTER ROUTE (Skeleton for your team)
router.post('/register', async (req, res) => {
  // Your team will add bcrypt.hash and user.save() logic here
  res.json({ message: "Register endpoint reached" });
});

module.exports = router;
