const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const router = express.Router();
const User = require("./models/User"); // adjust path

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, major, year, bio, courses } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1. check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. hash password
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);

    // 3. create user
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashed,
      emailVerified: false,
      verificationToken,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      major: major ?? null,
      year: year ?? null,
      bio: bio ?? null,
      courses: Array.isArray(courses) ? courses : []
    });

    // 4. send response
    res.json({
      message: "Registration successful",
      verificationToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
