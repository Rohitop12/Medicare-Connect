const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  times: [{ type: String, required: true }], // e.g., ["08:00", "20:00"]
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  reminderType: { type: String, enum: ['email', 'in-app', 'both'], default: 'both' },
  notes: { type: String }
}, { timestamps: true });

const Reminder = mongoose.model('Reminder', reminderSchema);
module.exports = Reminder;
