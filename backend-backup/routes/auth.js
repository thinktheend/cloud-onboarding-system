const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, position, department } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      profile: {
        firstName,
        lastName,
        position,
        department,
        startDate: new Date()
      },
      onboardingTasks: [
        {
          taskName: 'Complete Profile',
          description: 'Fill out your personal information',
          status: 'pending',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
          taskName: 'Read Employee Handbook',
          description: 'Review company policies and procedures',
          status: 'pending',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        },
        {
          taskName: 'Setup Workstation',
          description: 'Configure your computer and accounts',
          status: 'pending',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        }
      ]
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.correctPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        role: user.role,
        onboardingTasks: user.onboardingTasks
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;