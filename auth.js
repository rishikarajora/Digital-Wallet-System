const express = require('express');
const router = express.Router();
const User = require('../models/user');  // agar aapka user model yahan hai to path adjust karna
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

//Middleware to verify JWT token and attach user to req.user
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Auth token missing' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid auth token' });
  }
};

// Fraud detection utility
const isSuspiciousActivity = (user, type, amount) => {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60000);

  const recentWithdrawals = user.transactions.filter(tx =>
    tx.type === 'withdraw' && new Date(tx.date) > oneMinuteAgo
  );

  if (type === 'withdraw' && recentWithdrawals.length >= 3) {
    return 'Too many withdrawals in a short time';
  }

  if ((type === 'withdraw' || type === 'transfer') && amount > 10000) {
    return 'High amount transaction flagged';
  }

  return null;
};



// User Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check agar user already exist karta hai
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // New user create karo
    const user = new User({ email, password });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});router.get('/test', (req, res) => {
  res.send('Auth route working!');
});




// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // User dhundo
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Password check karo
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // JWT Token generate karo
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

//Depoit virtual cash
router.post('/deposit', authenticate, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Amount must be positive' });

    req.user.balance += amount;
    req.user.transactions.push({ type: 'deposit', amount });

    await req.user.save();
    res.json({ message: 'Deposit successful', balance: req.user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//withdraw virtual cash
router.post('/withdraw', authenticate, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Amount must be positive' });
    if (req.user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });

    req.user.balance -= amount;
    req.user.transactions.push({ type: 'withdraw', amount });

    await req.user.save();
    res.json({ message: 'Withdrawal successful', balance: req.user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


//Transfer funds to another user
router.post('/transfer', authenticate, async (req, res) => {
  try {
    const { recipientEmail, amount } = req.body;
    if (!recipientEmail || !amount || amount <= 0) return res.status(400).json({ message: 'Invalid transfer details' });
    if (req.user.email === recipientEmail) return res.status(400).json({ message: 'Cannot transfer to yourself' });
    if (req.user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });

    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

    // Deduct from sender
    req.user.balance -= amount;
    req.user.transactions.push({ type: 'transfer', amount, details: `To: ${recipientEmail}` });

    // Credit recipient
    recipient.balance += amount;
    recipient.transactions.push({ type: 'transfer', amount, details: `From: ${req.user.email}` });

    await req.user.save();
    await recipient.save();

    res.json({ message: 'Transfer successful', balance: req.user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get current user profile
router.get('/profile', authenticate, async (req, res) => {
  const { username, email, balance } = req.user;
  res.json({ username, email, balance });
});

// Get transaction history
router.get('/transactions', authenticate, async (req, res) => {
  res.json(req.user.transactions);
});

module.exports = router;



      
