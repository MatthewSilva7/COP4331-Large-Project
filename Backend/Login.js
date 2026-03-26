const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("./models/User"); // adjust path

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 2. compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. OPTIONAL: check email verified
    if (!user.emailVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    // 4. create JWT
    const token = jwt.sign(
      { id: user._id },
      "your_secret_key", // move to env later
      { expiresIn: "1h" }
    );

    // 5. send response
    res.json({
      message: "Login successful",
      token,
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