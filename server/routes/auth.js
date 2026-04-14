const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 
const sgMail = require('@sendgrid/mail');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 1. LOGIN ROUTE
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

// 2. REGISTER ROUTE (Wired to SendGrid)
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await User.create({
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            email: normalizedEmail,
            password: hashedPassword,
            emailVerified: false,
            verificationToken
        });

        // Send Email via SendGrid API
        const verificationUrl = `${process.env.BASE_URL}/api/auth/verify/${verificationToken}`;
        const msg = {
            to: email,
            from: process.env.FROM_EMAIL, // Must match your GoDaddy/SendGrid verified sender
            subject: 'Verify your Study Buddy Account',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2>Welcome to Study Buddy Finder, ${firstName}!</h2>
                    <p>You're almost there. Click the button below to verify your account:</p>
                    <a href="${verificationUrl}" style="background-color: #5A5A40; color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; display: inline-block;">Verify My Account</a>
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link: ${verificationUrl}</p>
                </div>
            `
        };

        await sgMail.send(msg);

        res.status(201).json({
            message: 'Registration successful! Please check your email to verify.',
            user: { id: user._id, email: user.email }
        });

    } catch (err) {
        console.error("Registration/Email Error:", err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// 3. VERIFY ROUTE
router.get('/verify/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });

        if (!user) {
            return res.status(400).send('<h1>Error</h1><p>Invalid or expired token.</p>');
        }

        user.emailVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.send('<h1>Email Verified!</h1><p>Your account is now active. You can close this window and log in.</p>');
    } catch (err) {
        res.status(500).send("Server error during verification");
    }
});

// 4. FORGOT PASSWORD ROUTE (Rubric Requirement)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) return res.status(404).json({ message: "User not found" });

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetUrl = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;
        
        const msg = {
            to: email,
            from: process.env.FROM_EMAIL,
            subject: 'Password Reset Request',
            html: `<p>Click here to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`
        };

        await sgMail.send(msg);
        res.json({ message: "Reset link sent to your email." });
    } catch (err) {
        res.status(500).json({ message: "Error sending reset email" });
    }
});

module.exports = router;
