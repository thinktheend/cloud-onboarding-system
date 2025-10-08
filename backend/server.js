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

// Health check route (important for Cyclic)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Onboarding System API'
  });
});

// Simple test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Onboarding System API is running on Cyclic! 🚀',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/profile',
      tasks: 'GET /api/profile/tasks',
      health: 'GET /health'
    },
    deployed_on: 'Cyclic.sh',
    status: 'Active'
  });
});

// MongoDB Connection with better error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    // Don't exit process on Cyclic - it will auto-restart
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB disconnected - attempting reconnect...');
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Initial connection
connectDB();

// Start server - Cyclic provides PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health check available at: /health`);
});