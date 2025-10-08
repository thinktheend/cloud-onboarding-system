const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));

// Simple test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Onboarding System API is running!',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/profile',
      tasks: 'GET /api/profile/tasks'
    }
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Access your API at: http://localhost:${PORT}`);
});