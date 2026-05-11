const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Google Auth
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String, sparse: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  profilePic: { type: String, default: '' },
  phone: { type: String, default: '' },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  medicalHistory: [{ type: String }], // For patients
  // Doctor specific fields
  specialization: { type: String },
  licenseNumber: { type: String },
  hospital: { type: String },
  experienceYears: { type: Number },
  isVerified: { type: Boolean, default: false }, // For doctors
  availability: {
    type: Map,
    of: new mongoose.Schema({
      isWorking: { type: Boolean, default: true },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    }, { _id: false }),
    default: {}
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
