const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register a new user (Patient or Doctor)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    console.log('--- Register Request Received ---');
    console.log('Body:', req.body);
    const { name, email, password, role, specialization, licenseNumber, hospital, experienceYears } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userData = {
      name, email, password, role: role || 'patient'
    };

    if (role === 'doctor') {
      userData.specialization = specialization;
      userData.licenseNumber = licenseNumber;
      userData.hospital = hospital;
      userData.experienceYears = experienceYears;
    }

    const user = await User.create(userData);

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        medicalHistory: user.medicalHistory,
        specialization: user.specialization,
        licenseNumber: user.licenseNumber,
        hospital: user.hospital,
        experienceYears: user.experienceYears,
        isVerified: user.isVerified,
        token: generateToken(user._id),
        refreshToken: generateRefreshToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        medicalHistory: user.medicalHistory,
        specialization: user.specialization,
        licenseNumber: user.licenseNumber,
        hospital: user.hospital,
        experienceYears: user.experienceYears,
        isVerified: user.isVerified,
        token: generateToken(user._id),
        refreshToken: generateRefreshToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user with Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    
    let user = await User.findOne({ email });
    
    if (user) {
      // Link googleId if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        profilePic: picture,
        authProvider: 'google',
        googleId,
        role: 'patient' // Default role for new Google signups
      });
    }
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      medicalHistory: user.medicalHistory,
      specialization: user.specialization,
      licenseNumber: user.licenseNumber,
      hospital: user.hospital,
      experienceYears: user.experienceYears,
      isVerified: user.isVerified,
      token: generateToken(user._id),
      refreshToken: generateRefreshToken(user._id)
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Not authenticated' });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Refresh token is not valid' });
      
      const newAccessToken = generateToken(decoded.id);
      res.status(200).json({
        token: newAccessToken
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  refreshToken,
  getMe
};
