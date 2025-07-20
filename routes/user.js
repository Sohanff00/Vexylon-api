const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔒 Middleware: verify JWT
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    req.userId = decoded.userId;
    next();
  });
}

// ✅ GET: /api/user-info
router.get('/user-info', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      email: user.email,
      uid: user.uid,
      balance: user.balance,
      currency: user.currency,
      name: user.name,
      mode: user.mode || 'LIVE'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
