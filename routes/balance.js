const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ Token Verify Middleware
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    req.userId = decoded.userId;
    next();
  });
}

//
// ✅ 1. DEMO ব্যালেন্স ইনপুট করে সেট করে
//
router.post('/balance-demo', verifyToken, async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount < 1 || amount > 10000) {
    return res.status(400).json({ message: 'Amount must be between $1 and $10,000' });
  }

  try {
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

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

//
// ✅ 2. LIVE ব্যালেন্সে টাকা জমা (ডিপোজিট)
//
router.post('/deposit', verifyToken, async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount < 1 || amount > 1000000) {
    return res.status(400).json({ message: 'Deposit amount must be between $1 and $1,000,000' });
  }

  try {
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.mode !== 'LIVE') {
      return res.status(400).json({ message: 'Only LIVE mode users can deposit' });
    }

    user.realBalance += amount;
    await user.save();

    res.status(200).json({
      message: `Successfully deposited $${amount}`,
      realBalance: user.realBalance
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//
// ✅ 3. LIVE ব্যালেন্স থেকে টাকা তোলা (উইথড্র)
//
router.post('/withdraw', verifyToken, async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount < 1) {
    return res.status(400).json({ message: 'Withdraw amount must be at least $1' });
  }

  try {
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.mode !== 'LIVE') {
      return res.status(400).json({ message: 'Only LIVE mode users can withdraw' });
    }

    if (user.realBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    user.realBalance -= amount;
    await user.save();

    res.status(200).json({
      message: `Successfully withdrew $${amount}`,
      realBalance: user.realBalance
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//
// ✅ 4. মোড বদল DEMO ↔ LIVE
//
router.post('/switch-mode', verifyToken, async (req, res) => {
  const { mode } = req.body;

  if (!mode || !['DEMO', 'LIVE'].includes(mode)) {
    return res.status(400).json({ message: 'Mode must be DEMO or LIVE' });
  }

  try {
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.mode = mode;
    await user.save();

    res.status(200).json({
      message: `Mode switched to ${mode}`,
      mode: user.mode
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//
// ✅ 5. কারেন্সি আপডেট (USD, EUR, BDT, etc.)
//
router.post('/update-currency', verifyToken, async (req, res) => {
  const { currency } = req.body;

  const allowedCurrencies = ['USD', 'EUR', 'BDT', 'INR'];

  if (!currency || !allowedCurrencies.includes(currency)) {
    return res.status(400).json({ message: 'Invalid currency' });
  }

  try {
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.currency = currency;
    await user.save();

    res.status(200).json({
      message: `Currency updated to ${currency}`,
      currency: user.currency
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//
// ✅ 6. লাভ যোগ করা (WIN হলে ব্যালেন্স ও প্রফিট বাড়ে)
//
router.post('/profit-update', verifyToken, async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount < 0) {
    return res.status(400).json({ message: 'Invalid profit amount' });
  }

  try {
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.mode === 'DEMO') {
      user.balance += amount;
    } else if (user.mode === 'LIVE') {
      user.realBalance += amount;
    }

    user.profit += amount;
    await user.save();

    res.status(200).json({
      message: `Profit of $${amount} added`,
      mode: user.mode,
      balance: user.mode === 'DEMO' ? user.balance : user.realBalance,
      profit: user.profit
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
