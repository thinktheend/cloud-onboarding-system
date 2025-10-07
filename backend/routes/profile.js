const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/', auth, async (req, res) => {
  try {
    const { firstName, lastName, position, department, phone } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'profile.firstName': firstName,
          'profile.lastName': lastName,
          'profile.position': position,
          'profile.department': department,
          'profile.phone': phone
        }
      },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get onboarding tasks
router.get('/tasks', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('onboardingTasks');
    res.json(user.onboardingTasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task status
router.put('/tasks/:taskId', auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const user = await User.findOneAndUpdate(
      { _id: req.user.id, 'onboardingTasks._id': taskId },
      { $set: { 'onboardingTasks.$.status': status } },
      { new: true }
    ).select('-password');

    res.json({ message: 'Task updated successfully', tasks: user.onboardingTasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;