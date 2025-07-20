const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔐 Token verify middleware
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    req.userId = decoded.userId;
    next();
  });
}

// ✅ POST /api/balance-demo
router.post('/balance-demo', verifyToken, async (req, res) => {
  const { amount } = req.body;

  // ✅ Input validation
  if (!amount || isNaN(amount) || amount < 1 || amount > 10000) {
    return res.status(400).json({ message: 'Amount must be between 1 and 10000' });
  }

  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.mode !== 'DEMO') {
      return res.status(400).json({ message: 'Only DEMO mode users can set demo balance' });
    }

    user.balance = amount;
    await user.save();

    res.status(200).json({
      message: `Demo balance set to $${amount}`,
      balance: user.balance
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
