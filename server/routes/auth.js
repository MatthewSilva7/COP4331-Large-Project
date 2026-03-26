const crypto = require('crypto'); // Built into Node to create the random verification token
const nodemailer = require('nodemailer');
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Setup the email transporter using .env credentials
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Check if email is verified
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

// REGISTER ROUTE
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Teammate - Add user existence check & password hashing here

        // EMAIL VERIFICATION LOGIC
        const verificationToken = crypto.randomBytes(20).toString('hex');

        // Teammate - Include 'verificationToken' & 'emailVerified: false' in new User() object.

        // Teammate - await newUser.save();

        const verificationUrl = `${process.env.BASE_URL}/api/auth/verify/${verificationToken}`;

        await transporter.sendMail({
            to: email,
            subject: 'Verify your Study Buddy Account',
            html: `Click <a href="${verificationUrl}">here</a> to verify your account.`
        });

        res.status(201).json({ message: "Registration successful! Please verify your email." });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// VERIFY ROUTE
router.get('/verify/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.emailVerified = true;
        user.verificationToken = undefined; // Clear token after use
        await user.save();

        res.send('<h1>Email Verified!</h1><p>You can now log in.</p>');
    } catch (err) {
        res.status(500).send("Server error during verification");
    }
});

module.exports = router;