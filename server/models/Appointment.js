const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 30 }, // in minutes
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  sessionType: { type: String, enum: ['video', 'chat'], required: true },
  meetingLink: { type: String }, // For video sessions (Daily.co)
  symptoms: { type: String },
  quizAnswers: [{
    question: String,
    answer: String
  }],
  healthSummary: { type: String },
  finalDiagnosis: { type: String },
  prescription: { type: String },
  notes: { type: String } // Doctor's notes
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
