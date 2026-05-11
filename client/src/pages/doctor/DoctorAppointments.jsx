import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Video, User, CheckCircle, XCircle, BrainCircuit, Activity } from 'lucide-react';
import { format } from 'date-fns';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'completed', 'cancelled'
  const [diagnosisInputs, setDiagnosisInputs] = useState({});

  const fetchAppointments = async () => {
    try {
      const { data } = await axiosInstance.get('/appointments');
      setAppointments(data);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleConfirm = async (id) => {
    try {
      await axiosInstance.put(`/appointments/${id}/confirm`);
      toast.success('Appointment confirmed. Meeting link generated.');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm appointment');
    }
  };

  const handleCancel = async (id) => {
    try {
      await axiosInstance.put(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleDiagnosisSubmit = async (id) => {
    if (!diagnosisInputs[id]) return toast.error('Please enter a diagnosis');
    try {
      await axiosInstance.put(`/appointments/${id}/diagnosis`, { finalDiagnosis: diagnosisInputs[id] });
      toast.success('Diagnosis saved successfully!');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save diagnosis');
    }
  };

  const handleStartSession = (meetingLink) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    } else {
      toast.error('Meeting link not available yet.');
    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'upcoming') return app.status === 'pending' || app.status === 'confirmed';
    if (filter === 'completed') return app.status === 'completed';
    if (filter === 'cancelled') return app.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-800">Appointments</h1>
          <p className="text-gray-500 mt-1">Manage your upcoming and past patient sessions.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex gap-4">
          <button onClick={() => setFilter('upcoming')} className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === 'upcoming' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Upcoming</button>
          <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === 'completed' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Completed</button>
          <button onClick={() => setFilter('cancelled')} className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === 'cancelled' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Cancelled</button>
        </div>
        
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading appointments...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No {filter} appointments found.</div>
          ) : (
            filteredAppointments.map((app) => (
              <div key={app._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                <div className="p-6 flex items-center gap-6">
                
                <div className="flex flex-col items-center justify-center w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl">
                  <span className="text-xl font-bold">{format(new Date(app.scheduledAt), 'dd')}</span>
                  <span className="text-sm font-medium uppercase">{format(new Date(app.scheduledAt), 'MMM')}</span>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <User size={18} className="text-gray-400" /> {app.patientId?.name || 'Unknown Patient'}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={16} /> {format(new Date(app.scheduledAt), 'HH:mm')} ({app.duration || 30} mins)</span>
                    <span className="flex items-center gap-1 capitalize"><Video size={16} /> {app.sessionType}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      app.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      app.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 bg-gray-100 inline-block px-3 py-1 rounded-lg">Reason: {app.symptoms || 'Routine checkup'}</p>
                </div>

                <div className="flex flex-col gap-2">
                  {app.status === 'pending' && (
                     <>
                       <button onClick={() => handleConfirm(app._id)} className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition">
                         <CheckCircle size={16} /> Confirm
                       </button>
                       <button onClick={() => handleCancel(app._id)} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition">
                         <XCircle size={16} /> Cancel
                       </button>
                     </>
                  )}
                  {app.status === 'confirmed' && (
                    <button onClick={() => handleStartSession(app.meetingLink)} className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition">
                      <Video size={16} /> Start Session
                    </button>
                  )}
                  {app.status === 'completed' && (
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <CheckCircle size={18} /> Completed
                    </span>
                  )}
                </div>

                </div>
              
                {/* AI Health Summary and Diagnosis Section */}
                {(app.healthSummary || app.status === 'completed' || app.status === 'confirmed') && (
                  <div className="bg-gray-50/50 p-6 border-t border-gray-100 flex flex-col gap-4">
                    {app.healthSummary && (
                      <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm">
                        <h4 className="text-sm font-bold text-teal-800 flex items-center gap-2 mb-2">
                          <BrainCircuit size={16} /> AI Pre-Session Summary
                        </h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{app.healthSummary}</p>
                      </div>
                    )}

                    {(app.status === 'completed' || app.status === 'confirmed') && (
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                          <Activity size={16} /> Doctor's Final Diagnosis
                        </h4>
                        {app.finalDiagnosis ? (
                          <p className="text-sm text-gray-700 font-medium">{app.finalDiagnosis}</p>
                        ) : (
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Enter final diagnosis after session..."
                              value={diagnosisInputs[app._id] || ''}
                              onChange={(e) => setDiagnosisInputs({...diagnosisInputs, [app._id]: e.target.value})}
                              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary text-sm"
                            />
                            <button onClick={() => handleDiagnosisSubmit(app._id)} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition">
                              Save
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;
