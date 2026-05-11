const express = require('express');
const router = express.Router();
const { 
  createAppointment, 
  getAppointments, 
  getAppointmentById, 
  confirmAppointment, 
  cancelAppointment, 
  completeAppointment, 
  getAvailableSlots,
  submitQuiz,
  updateDiagnosis
} = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, restrictTo('patient'), createAppointment)
  .get(protect, getAppointments);

router.get('/available-slots/:doctorId', protect, getAvailableSlots);

router.route('/:id')
  .get(protect, getAppointmentById);

router.put('/:id/confirm', protect, restrictTo('doctor'), confirmAppointment);
router.put('/:id/cancel', protect, cancelAppointment);
router.put('/:id/complete', protect, restrictTo('doctor'), completeAppointment);

router.post('/:id/quiz', protect, restrictTo('patient'), submitQuiz);
router.put('/:id/diagnosis', protect, restrictTo('doctor'), updateDiagnosis);

module.exports = router;
