const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Built-in Node module
const nodemailer = require('nodemailer');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

// 1. Setup the email transporter using .env credentials
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // This line forces Node to use IPv4 instead of IPv6
    dnsLookup: (hostname, options, callback) => {
        require('dns').lookup(hostname, { family: 4 }, callback);
    },
});

// 2. LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Check if email is verified (Rubric Requirement)
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

// 3. UNIFIED REGISTER ROUTE (Combines Hashing + Email Sending)
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Basic Validation
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check for existing user
        const normalizedEmail = String(email).trim().toLowerCase();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash Password & Generate Verification Token
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Create User in DB
        const user = await User.create({
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            email: normalizedEmail,
            password: hashedPassword,
            emailVerified: false,
            verificationToken
        });

        // Send the Verification Email
        const verificationUrl = `${process.env.BASE_URL}/api/auth/verify/${verificationToken}`;
        await transporter.sendMail({
            to: email,
            subject: 'Verify your Study Buddy Account',
            html: `<h3>Welcome to Study Buddy Finder!</h3>
                   <p>Click the link below to verify your account:</p>
                   <a href="${verificationUrl}">${verificationUrl}</a>`
        });

        res.status(201).json({
            message: 'Registration successful! Please check your email to verify.',
            user: { id: user._id, email: user.email }
        });

    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// 4. VERIFY ROUTE
router.get('/verify/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.emailVerified = true;
        user.verificationToken = undefined; // Clear token after use
        await user.save();

        res.send('<h1>Email Verified!</h1><p>Your account is now active. You can close this window and log in.</p>');
    } catch (err) {
        res.status(500).send("Server error during verification");
    }
});

module.exports = router;
