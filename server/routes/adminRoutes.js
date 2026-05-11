const express = require('express');
const router = express.Router();
const { getUsers, verifyDoctor, deleteUser, getStats } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/users', protect, admin, getUsers);
router.put('/users/:id/verify-doctor', protect, admin, verifyDoctor);
router.delete('/users/:id', protect, admin, deleteUser);
router.get('/stats', protect, admin, getStats);

module.exports = router;
