require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./server/config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic test route
app.get('/', (req, res) => res.send('API is running!'));

// Auth routes
const authRoutes = require('./server/routes/auth');
app.use('/api', authRoutes);

// Transaction routes
const transactionRoutes = require('./server/routes/transactions');
app.use('/api/transactions', transactionRoutes);

// DB Connection and sync
const db = require('./server/models');

sequelize.authenticate()
  .then(() => {
    console.log('✅ PostgreSQL connected');
    return db.sequelize.sync(); // sync models
  })
  .then(() => {
    console.log('✅ All models synced');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Error starting app:', err);
  });
