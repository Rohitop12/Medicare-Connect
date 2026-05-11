const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');
const sendEmail = require('./sendEmail');

const startCronJobs = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    console.log('Running reminder cron job...');
    try {
      const now = new Date();
      // Format current time as HH:MM
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      // Find active reminders that match today's date range and current time
      const reminders = await Reminder.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        times: currentTimeStr
      }).populate('patientId', 'name email');

      for (const reminder of reminders) {
        const title = `Time to take ${reminder.medicineName}`;
        const body = `Reminder: Please take your medication (${reminder.dosage}) now. Notes: ${reminder.notes || 'None'}`;

        // 1. Create in-app notification
        await Notification.create({
          userId: reminder.patientId._id,
          type: 'reminder',
          title,
          body
        });

        // 2. Emit Socket.io event if user is connected
        if (global.io) {
          global.io.to(`user_${reminder.patientId._id}`).emit('new_reminder', {
            title,
            body,
            reminderId: reminder._id
          });
        }

        // 3. Send Email if requested
        if (reminder.reminderType === 'email' || reminder.reminderType === 'both') {
          // Mock email sending. Needs valid credentials in .env
          try {
            await sendEmail({
              email: reminder.patientId.email,
              subject: title,
              message: body
            });
          } catch (emailErr) {
            console.error(`Failed to send email to ${reminder.patientId.email}:`, emailErr.message);
          }
        }
      }

    } catch (error) {
      console.error('Cron Job Error:', error);
    }
  });
};

module.exports = startCronJobs;
