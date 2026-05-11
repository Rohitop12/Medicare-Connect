import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axios';
import { Users, Calendar as CalendarIcon, MessageSquare, TrendingUp, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import ReviewForm from '../../components/ReviewForm';

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    unreadMessages: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mocking fetch stats - typically you'd have a specific endpoint for this
      const { data } = await axiosInstance.get('/appointments');
      const today = new Date().toISOString().split('T')[0];
      const todayApps = data.filter(app => app.scheduledAt.startsWith(today));
      
      setStats({
        todayAppointments: todayApps.length,
        totalPatients: new Set(data.map(app => app.patientId?._id)).size,
        unreadMessages: 3 // Mocked
      });
      setAppointments(todayApps);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Today's Appointments", value: stats.todayAppointments, icon: <CalendarIcon size={24} />, color: "bg-blue-50 text-blue-600" },
    { title: "Total Patients", value: stats.totalPatients, icon: <Users size={24} />, color: "bg-green-50 text-green-600" },
    { title: "Unread Messages", value: stats.unreadMessages, icon: <MessageSquare size={24} />, color: "bg-orange-50 text-orange-600" },
    { title: "Weekly Revenue", value: "$1,240", icon: <TrendingUp size={24} />, color: "bg-purple-50 text-purple-600" },
  ];

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-800">Welcome, Dr. {user?.name}</h1>
          <p className="text-gray-500 mt-1">Here is what's happening with your practice today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-heading">Today's Schedule</h2>
            <button className="text-primary text-sm font-medium hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No appointments scheduled for today.</p>
            ) : (
              appointments.map(app => (
                <div key={app._id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:shadow-md transition bg-gray-50/50">
                  <div className="w-16 h-16 bg-white rounded-xl flex flex-col items-center justify-center border border-gray-200 text-primary">
                    <span className="text-lg font-bold">{format(new Date(app.scheduledAt), 'HH:mm')}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{app.patientId?.name || 'Patient'}</h3>
                    <p className="text-sm text-gray-500">{app.sessionType} • {app.duration} mins</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition text-gray-700">View File</button>
                    <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition">Start</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
           <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-heading">Recent Patients</h2>
          </div>
          <div className="space-y-4">
            {/* Mocking recent patients list */}
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3">
                <img src={`https://i.pravatar.cc/150?img=${i+10}`} alt="Patient" className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-gray-800">Jane Doe {i}</h4>
                  <p className="text-xs text-gray-500">Last visit: 2 days ago</p>
                </div>
                <button className="text-gray-400 hover:text-primary"><FileText size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Review Form Widget */}
        <div className="lg:col-span-3 mt-2">
          <ReviewForm />
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
