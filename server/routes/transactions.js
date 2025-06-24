const express = require('express');
const router = express.Router();
const db = require('../models');
const auth = require('../middleware/auth');

// Add a new transaction
router.post('/', auth, async (req, res) => {
  try {
    const { amount, category, date, description } = req.body;

    if (!amount || !category || !date) {
      return res.status(400).json({ message: 'Amount, category, and date are required.' });
    }

    const transaction = await db.Transaction.create({
      amount,
      category,
      date,
      description,
      userId: req.user.userId,  // from JWT middleware
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all transactions for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await db.Transaction.findAll({
      where: { userId: req.user.userId },
      order: [['date', 'DESC']],
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
