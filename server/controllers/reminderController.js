const Reminder = require('../models/Reminder');

// @desc    Create a new reminder
// @route   POST /api/reminders
// @access  Private (Patient only)
const createReminder = async (req, res) => {
  try {
    const { medicineName, dosage, frequency, times, startDate, endDate, reminderType, notes } = req.body;
    
    const reminder = new Reminder({
      patientId: req.user._id,
      medicineName,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
      reminderType,
      notes
    });

    const createdReminder = await reminder.save();
    res.status(201).json(createdReminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reminders for logged in patient
// @route   GET /api/reminders
// @access  Private (Patient only)
const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ patientId: req.user._id });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private (Patient only)
const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (reminder) {
      if (reminder.patientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this reminder' });
      }

      const updatedReminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedReminder);
    } else {
      res.status(404).json({ message: 'Reminder not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private (Patient only)
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (reminder) {
      if (reminder.patientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this reminder' });
      }

      await reminder.deleteOne();
      res.json({ message: 'Reminder removed' });
    } else {
      res.status(404).json({ message: 'Reminder not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle reminder active status
// @route   PATCH /api/reminders/:id/toggle
// @access  Private (Patient only)
const toggleReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (reminder) {
      if (reminder.patientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this reminder' });
      }

      reminder.isActive = !reminder.isActive;
      const updatedReminder = await reminder.save();
      res.json(updatedReminder);
    } else {
      res.status(404).json({ message: 'Reminder not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder,
  toggleReminder
};
