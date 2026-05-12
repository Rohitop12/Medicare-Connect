const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { GoogleGenAI } = require('@google/genai');
// const generateMeetingLink = require('../utils/generateMeetingLink'); // Mock for Daily.co

// @desc    Create an appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
const createAppointment = async (req, res) => {
  try {
    const { doctorId, scheduledAt, sessionType, symptoms } = req.body;
    
    // Validate Doctor Availability
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const requestedDate = new Date(scheduledAt);
    const requestedEndTime = new Date(requestedDate.getTime() + (req.body.duration || 30) * 60000);
    
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[requestedDate.getDay()];

    const doctorAvailability = doctor.availability?.get(dayName);
    
    // 1. Check if doctor is working on this day
    if (!doctorAvailability || !doctorAvailability.isWorking) {
      return res.status(400).json({ message: "Doctor not available, please try a different date and time." });
    }

    // 2. Check if requested time is within working hours
    const requestedTimeStr = requestedDate.toTimeString().slice(0, 5); // "HH:MM"
    const requestedEndTimeStr = requestedEndTime.toTimeString().slice(0, 5);
    
    if (requestedTimeStr < doctorAvailability.start || requestedEndTimeStr > doctorAvailability.end) {
      return res.status(400).json({ message: "Doctor not available, please try a different date and time." });
    }

    // 3. Check for overlapping appointments
    const overlappingAppointment = await Appointment.findOne({
      doctorId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          // Existing appointment starts before new one ends, and ends after new one starts
          scheduledAt: { $lt: requestedEndTime },
          $expr: {
            $gt: [
              { $add: ["$scheduledAt", { $multiply: ["$duration", 60000] }] },
              requestedDate
            ]
          }
        }
      ]
    });

    if (overlappingAppointment) {
      return res.status(400).json({ message: "Doctor not available, please try a different date and time." });
    }

    // TODO: We could also validate the start and end times here
    
    const appointment = new Appointment({
      patientId: req.user._id,
      doctorId,
      scheduledAt,
      sessionType,
      symptoms
    });

    const createdAppointment = await appointment.save();
    res.status(201).json(createdAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user appointments (handles both patient and doctor)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email profilePic phone')
      .populate('doctorId', 'name email profilePic specialization hospital')
      .sort({ scheduledAt: 1 });
      
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email profilePic phone medicalHistory')
      .populate('doctorId', 'name email profilePic specialization');

    if (appointment) {
      // Access check
      if (appointment.patientId._id.toString() !== req.user._id.toString() && 
          appointment.doctorId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this appointment' });
      }
      res.json(appointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm appointment (Doctor only)
// @route   PUT /api/appointments/:id/confirm
// @access  Private (Doctor only)
const confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
      if (appointment.doctorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      appointment.status = 'confirmed';
      
      // If video session, generate meeting link
      if (appointment.sessionType === 'video') {
        // Mock Daily.co link generation
        appointment.meetingLink = `https://medicare.daily.co/room-${appointment._id}`;
      }

      const updatedAppointment = await appointment.save();
      // TODO: Send confirmation email to both patient and doctor
      
      res.json(updatedAppointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
       if (appointment.patientId.toString() !== req.user._id.toString() && 
           appointment.doctorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      appointment.status = 'cancelled';
      const updatedAppointment = await appointment.save();
      
      res.json(updatedAppointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete appointment and add prescription
// @route   PUT /api/appointments/:id/complete
// @access  Private (Doctor only)
const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
      if (appointment.doctorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      appointment.status = 'completed';
      appointment.prescription = req.body.prescription || appointment.prescription;
      appointment.notes = req.body.notes || appointment.notes;
      
      const updatedAppointment = await appointment.save();
      res.json(updatedAppointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available slots for a doctor
// @route   GET /api/appointments/available-slots/:doctorId
// @access  Private
const getAvailableSlots = async (req, res) => {
  try {
    // This is a simplified mock. In a real app, you'd calculate free slots based on doctor's schedule and existing appointments.
    const { date } = req.query; // pass date in YYYY-MM-DD format
    const slots = [
      "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"
    ];
    res.json({ date, slots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit symptom quiz answers and generate summary
// @route   POST /api/appointments/:id/quiz
// @access  Private (Patient only)
const submitQuiz = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { quizAnswers } = req.body;
    appointment.quizAnswers = quizAnswers;

    // Generate AI Summary
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are a medical assistant AI. A patient has submitted the following pre-session symptom quiz answers. Please generate a concise, professional clinical summary for the doctor to review before the session. Do not diagnose the patient yourself. Just summarize the reported symptoms, severity, and history clearly.
      
      Quiz Answers:
      ${quizAnswers.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      appointment.healthSummary = response.text;
    } catch (aiError) {
      console.error('AI Summary Generation Error:', aiError);
      appointment.healthSummary = "AI Summary generation failed. Please review the raw quiz answers.";
    }

    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update final diagnosis
// @route   PUT /api/appointments/:id/diagnosis
// @access  Private (Doctor only)
const updateDiagnosis = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    appointment.finalDiagnosis = req.body.finalDiagnosis;
    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  getAvailableSlots,
  submitQuiz,
  updateDiagnosis
};
