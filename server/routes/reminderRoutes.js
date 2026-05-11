const express = require('express');
const router = express.Router();
const { createReminder, getReminders, updateReminder, deleteReminder, toggleReminder } = require('../controllers/reminderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, restrictTo('patient'), createReminder)
  .get(protect, restrictTo('patient'), getReminders);

router.route('/:id')
  .put(protect, restrictTo('patient'), updateReminder)
  .delete(protect, restrictTo('patient'), deleteReminder);

router.patch('/:id/toggle', protect, restrictTo('patient'), toggleReminder);

module.exports = router;
