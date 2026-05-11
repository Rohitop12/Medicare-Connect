const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.profilePic = req.body.profilePic || user.profilePic;
      user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
      user.gender = req.body.gender || user.gender;
      
      if (user.role === 'patient' && req.body.medicalHistory) {
        user.medicalHistory = req.body.medicalHistory;
      }
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePic: updatedUser.profilePic,
        phone: updatedUser.phone,
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender,
        medicalHistory: updatedUser.medicalHistory,
        specialization: updatedUser.specialization,
        licenseNumber: updatedUser.licenseNumber,
        hospital: updatedUser.hospital,
        experienceYears: updatedUser.experienceYears,
        isVerified: updatedUser.isVerified
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all verified doctors
// @route   GET /api/users/doctors
// @access  Private
const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single doctor profile
// @route   GET /api/users/doctors/:id
// @access  Private
const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' }).select('-password');
    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/upload-profile-pic
// @access  Private
const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePic = req.file.path; // Cloudinary secure URL
    await user.save();

    res.json({
      message: 'Profile picture updated',
      profilePic: user.profilePic
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update doctor availability
// @route   PUT /api/users/availability
// @access  Private (Doctor only)
const updateAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (user.role !== 'doctor') {
        return res.status(403).json({ message: 'Only doctors can set availability' });
      }

      user.availability = req.body.availability || user.availability;
      
      const updatedUser = await user.save();
      res.json({
        message: 'Availability updated successfully',
        availability: updatedUser.availability
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getDoctors,
  getDoctorById,
  uploadProfilePic,
  updateAvailability
};
