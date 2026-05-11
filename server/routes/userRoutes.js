const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getDoctors, getDoctorById, uploadProfilePic, updateAvailability } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/doctors', protect, getDoctors);
router.get('/doctors/:id', protect, getDoctorById);
router.post('/upload-profile-pic', protect, upload.single('image'), uploadProfilePic);
router.put('/availability', protect, updateAvailability);

module.exports = router;
