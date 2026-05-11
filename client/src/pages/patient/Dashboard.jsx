import React, { useState, useEffect } from 'react';
import { Pill, CalendarDays, Activity } from 'lucide-react';
import api from '../../api/axios';
import { format } from 'date-fns';
import ReviewForm from '../../components/ReviewForm';

const Dashboard = () => {
  const [reminders, setReminders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [remindersRes, appointmentsRes] = await Promise.all([
          api.get('/reminders'),
          api.get('/appointments')
        ]);
        
        // Filter active reminders for today
        const activeReminders = remindersRes.data.filter(r => r.isActive);
        setReminders(activeReminders);

        // Filter upcoming appointments
        const upcomingAppointments = appointmentsRes.data.filter(a => new Date(a.scheduledAt) >= new Date() && a.status !== 'cancelled');
        setAppointments(upcomingAppointments.slice(0, 3)); // Get next 3

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Activity className="animate-spin text-primary" size={32} /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome & AI Tip */}
      <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-heading font-bold mb-2">Welcome back!</h2>
        <p className="text-primary-50 max-w-2xl text-lg">
          Here is your daily health overview. Don't forget to take your scheduled medications. 
          If you need anything, our AI assistant is just a click away.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reminders Widget */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-heading font-semibold flex items-center gap-2">
              <Pill className="text-accent" /> Today's Medications
            </h3>
          </div>
          
          <div className="space-y-4">
            {reminders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No medications scheduled for today.</p>
            ) : (
              reminders.map(reminder => (
                <div key={reminder._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <h4 className="font-semibold text-gray-800">{reminder.medicineName}</h4>
                    <p className="text-sm text-gray-500">{reminder.dosage} • {reminder.frequency}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {reminder.times.join(', ')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Appointments Widget */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-heading font-semibold flex items-center gap-2">
              <CalendarDays className="text-blue-500" /> Upcoming Appointments
            </h3>
          </div>
          
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming appointments.</p>
            ) : (
              appointments.map(appointment => (
                <div key={appointment._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                      {appointment.doctorId?.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Dr. {appointment.doctorId?.name}</h4>
                      <p className="text-sm text-gray-500">{appointment.doctorId?.specialization} • {appointment.sessionType === 'video' ? 'Video Call' : 'In-Person'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {format(new Date(appointment.scheduledAt), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(appointment.scheduledAt), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Review Form Widget */}
        <div className="lg:col-span-2">
          <ReviewForm />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
