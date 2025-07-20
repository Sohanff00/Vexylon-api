const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

// 🔢 8-digit UID জেনারেট ফাংশন
function generateUID() {
  return Math.floor(10000000 + Math.random() * 90000000); // 8-digit UID
}

// ---------------------- REGISTER ----------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, country, currency, referral_code } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      uid: generateUID(),
      name,
      email,
      password: hashedPassword,
      country,
      currency,
      referral_code
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);

    res.status(201).json({
      message: "User registered successfully ",
      token,
      user: {
        id: newUser._id,
        uid: newUser.uid,
        name: newUser.name,
        email: newUser.email,
        balance: newUser.balance
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------------------- LOGIN ----------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(200).json({
      message: "Login successful ",
      token,
      user: {
        id: user._id,
        uid: user.uid,
        name: user.name,
        email: user.email,
        balance: user.balance
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
