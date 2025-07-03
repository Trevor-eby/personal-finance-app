const express = require('express');
const router = express.Router();
const db = require('../models');
const auth = require('../middleware/auth');

// GET /api/budgets - get budgets with total spending and over-limit flag
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const budgets = await db.Budget.findAll({ where: { userId } });

    const response = [];

    for (const budget of budgets) {
      const transactions = await db.Transaction.findAll({
        where: {
          userId,
          category: budget.category,
        },
      });

      const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
      const overLimit = totalSpent > budget.limit;

      response.push({
        id: budget.id,
        category: budget.category,
        limit: budget.limit,
        totalSpent,
        overLimit,
      });
    }

    res.json(response);
  } catch (err) {
    console.error('Error fetching budgets:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/budgets - create or update a budget limit
router.post('/', auth, async (req, res) => {
  const { category, limit } = req.body;

  if (!category || limit === undefined) {
    return res.status(400).json({ message: 'Category and limit are required.' });
  }

  try {
    console.log('🧾 Incoming Budget:', { category, limit });
    console.log('🔐 User ID:', req.user?.userId);

    const [budget, created] = await db.Budget.upsert(
      {
        category,
        limit,
        userId: req.user.userId,
      },
      {
        returning: true,
        conflictFields: ['userId', 'category'],
      }
    );

    res.json({
      message: created ? 'Budget created' : 'Budget updated',
      budget,
    });
  } catch (err) {
    console.error('💥 Budget creation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/budgets/warnings - get warnings if spending exceeds budget limits
router.get('/warnings', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's budgets
    const budgets = await db.Budget.findAll({
      where: { userId },
      raw: true,
    });

    // Get total spent per category
    const transactions = await db.Transaction.findAll({
      where: { userId },
      attributes: [
        'category',
        [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'totalSpent'],
      ],
      group: ['category'],
      raw: true,
    });

    // Map spending by category
    const spendingMap = {};
    transactions.forEach(tx => {
      spendingMap[tx.category] = parseFloat(tx.totalSpent);
    });

    // Build warnings array
    const warnings = budgets.map(budget => {
      const spent = spendingMap[budget.category] || 0;
      return {
        category: budget.category,
        budgetLimit: budget.limit,
        totalSpent: spent,
        overLimit: spent > budget.limit,
      };
    });

    res.json(warnings);
  } catch (err) {
    console.error('💥 Budget warning error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
