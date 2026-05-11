const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Reminder = require('../models/Reminder');

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) {
      query.role = role;
    }
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify a doctor account
// @route   PUT /api/admin/users/:id/verify-doctor
// @access  Private (Admin only)
const verifyDoctor = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user && user.role === 'doctor') {
      user.isVerified = true;
      await user.save();
      res.json({ message: 'Doctor verified', user });
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    
    // Get today's start and end date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointmentsToday = await Appointment.countDocuments({
      scheduledAt: { $gte: today, $lt: tomorrow }
    });

    const activeReminders = await Reminder.countDocuments({ isActive: true });

    res.json({
      totalPatients,
      totalDoctors,
      appointmentsToday,
      activeReminders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  verifyDoctor,
  deleteUser,
  getStats
};
