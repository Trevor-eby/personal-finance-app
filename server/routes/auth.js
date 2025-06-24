const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const auth = require('../middleware/auth');  // JWT validation middleware

// Register new user — removed manual hashing here
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    // Pass plain password; model hook will hash it
    const newUser = await db.User.create({ email, password });

    res.status(201).json({ message: 'User registered successfully.', userId: newUser.id });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login user and return JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await db.User.findOne({ where: { email } });
    console.log("User from DB:", user?.email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Example protected route
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.userId, {
      attributes: ['id', 'email', 'createdAt'], // Only expose safe fields
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Delete user by email
router.delete('/delete-user', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const deletedCount = await db.User.destroy({ where: { email } });
    if (deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: `User with email ${email} deleted.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
