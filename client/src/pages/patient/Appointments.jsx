import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';
import { format, isPast, isFuture, differenceInMinutes } from 'date-fns';
import { Video, MessageSquare, Calendar as CalendarIcon, Clock, XCircle, FileText } from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [joinVideo, setJoinVideo] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await axiosInstance.get('/appointments');
      setAppointments(data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    if(!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await axiosInstance.put(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const renderTabs = () => {
    return (
      <div className="flex space-x-2 border-b mb-6">
        {['upcoming', 'past', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium capitalize transition-colors border-b-2 ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    );
  };

  const filteredAppointments = appointments.filter(app => {
    if (activeTab === 'cancelled') return app.status === 'cancelled';
    if (activeTab === 'past') return app.status === 'completed';
    return app.status === 'pending' || app.status === 'confirmed';
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-800">My Appointments</h1>
        <p className="text-gray-500 mt-1">Manage your upcoming sessions and view past records.</p>
      </div>

      {renderTabs()}

      {joinVideo && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold">Telehealth Session</h3>
            <button onClick={() => setJoinVideo(null)} className="bg-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-700">Leave Session</button>
          </div>
          <iframe 
            src={joinVideo} 
            allow="camera; microphone; fullscreen" 
            className="w-full h-full border-none"
            title="Video Consultation"
          ></iframe>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading appointments...</div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <CalendarIcon size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No {activeTab} appointments</h3>
              <p className="text-gray-500">You don't have any {activeTab} appointments at the moment.</p>
            </div>
          ) : (
            filteredAppointments.map(app => {
              const isJoinable = app.status === 'confirmed' && app.sessionType === 'video' && app.meetingLink;
              // In production, check if within 5 mins of start time:
              // const minsToStart = differenceInMinutes(new Date(app.scheduledAt), new Date());
              // const canJoin = isJoinable && minsToStart <= 5 && minsToStart >= -app.duration;
              const canJoin = isJoinable; // Mocked to always allow joining for demo

              return (
                <div key={app._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
                  
                  <div className="flex items-center gap-4 flex-1">
                    <img 
                      src={app.doctorId?.profilePic || 'https://via.placeholder.com/60'} 
                      alt="Doctor" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                    />
                    <div>
                      <h3 className="font-bold text-lg">Dr. {app.doctorId?.name || 'Unknown Doctor'}</h3>
                      <p className="text-primary font-medium text-sm">{app.doctorId?.specialization || 'General'}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><CalendarIcon size={14} /> {format(new Date(app.scheduledAt), 'MMM d, yyyy')}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {format(new Date(app.scheduledAt), 'h:mm a')} ({app.duration}m)</span>
                        <span className="flex items-center gap-1">
                          {app.sessionType === 'video' ? <Video size={14}/> : <MessageSquare size={14}/>} 
                          <span className="capitalize">{app.sessionType}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto flex flex-col gap-2">
                    <div className="flex justify-between items-center mb-2 md:mb-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        app.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        app.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    {activeTab === 'upcoming' && app.status !== 'cancelled' && (
                      <div className="flex gap-2">
                        {canJoin && (
                          <button 
                            onClick={() => setJoinVideo(app.meetingLink)}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition flex items-center gap-2"
                          >
                            <Video size={16} /> Join Session
                          </button>
                        )}
                        <button 
                          onClick={() => cancelAppointment(app._id)}
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition flex items-center gap-2"
                        >
                          <XCircle size={16} /> Cancel
                        </button>
                      </div>
                    )}

                    {activeTab === 'past' && app.prescription && (
                      <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition flex items-center gap-2">
                        <FileText size={16} /> View Prescription
                      </button>
                    )}
                  </div>

                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Appointments;
