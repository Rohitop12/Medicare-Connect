import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import { toast } from 'react-hot-toast';
import { MapPin, Star, Calendar as CalendarIcon, Clock, ArrowLeft, Video, MessageSquare } from 'lucide-react';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Booking Form State
  const [bookingData, setBookingData] = useState({
    scheduledAt: '',
    duration: 30,
    sessionType: 'video',
    symptoms: ''
  });

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await axiosInstance.get(`/users/doctors/${id}`);
        setDoctor(data);
      } catch (error) {
        toast.error('Failed to load doctor profile');
        navigate('/dashboard/doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id, navigate]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/appointments', {
        doctorId: id,
        ...bookingData
      });
      toast.success('Appointment booked successfully! Please complete the pre-session quiz.');
      setShowBookingModal(false);
      navigate(`/dashboard/quiz/${response.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!doctor) return <div>Doctor not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-primary transition"
      >
        <ArrowLeft size={20} /> Back to Doctors
      </button>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <img 
            src={doctor.profilePic || 'https://via.placeholder.com/200'} 
            alt={doctor.name} 
            className="w-32 h-32 md:w-48 md:h-48 rounded-2xl object-cover shadow-md"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold font-heading text-gray-800 mb-2">Dr. {doctor.name}</h1>
            <p className="text-primary font-medium text-lg mb-4">{doctor.specialization}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="text-gray-500 text-sm mb-1">Experience</div>
                <div className="font-semibold">{doctor.experienceYears || 0} Years</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="text-gray-500 text-sm mb-1">Rating</div>
                <div className="font-semibold flex items-center gap-1">
                  4.8 <Star size={14} className="text-yellow-400 fill-current" />
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl col-span-2">
                <div className="text-gray-500 text-sm mb-1">Hospital</div>
                <div className="font-semibold truncate">{doctor.hospital || 'MediCare Connect Online'}</div>
              </div>
            </div>

            <button 
              onClick={() => setShowBookingModal(true)}
              className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-teal-700 transition shadow-lg shadow-primary/30"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold font-heading mb-6 flex items-center gap-2">
          <Clock className="text-primary" /> Working Hours
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
            const avail = doctor.availability?.[day];
            return (
              <div key={day} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                <span className="font-medium text-gray-700">{day}</span>
                {avail?.isWorking ? (
                  <span className="text-primary font-medium text-sm">{avail.start} - {avail.end}</span>
                ) : (
                  <span className="text-gray-400 text-sm italic">Not Available</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8">
            <h2 className="text-2xl font-bold mb-6 font-heading">Book Appointment</h2>
            <form onSubmit={handleBookingSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={bookingData.scheduledAt}
                  onChange={(e) => setBookingData({...bookingData, scheduledAt: e.target.value})}
                  className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`border rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition ${bookingData.sessionType === 'video' ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-gray-50'}`}>
                    <input 
                      type="radio" 
                      name="sessionType" 
                      value="video" 
                      className="hidden"
                      checked={bookingData.sessionType === 'video'}
                      onChange={(e) => setBookingData({...bookingData, sessionType: e.target.value})}
                    />
                    <Video size={24} />
                    <span className="font-medium">Video Call</span>
                  </label>
                  <label className={`border rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition ${bookingData.sessionType === 'chat' ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-gray-50'}`}>
                    <input 
                      type="radio" 
                      name="sessionType" 
                      value="chat" 
                      className="hidden"
                      checked={bookingData.sessionType === 'chat'}
                      onChange={(e) => setBookingData({...bookingData, sessionType: e.target.value})}
                    />
                    <MessageSquare size={24} />
                    <span className="font-medium">Chat Only</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms / Reason for Visit</label>
                <textarea 
                  required
                  rows="3"
                  value={bookingData.symptoms}
                  onChange={(e) => setBookingData({...bookingData, symptoms: e.target.value})}
                  className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Please briefly describe your symptoms..."
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-3 border rounded-xl hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-teal-700 font-medium transition"
                >
                  Confirm Booking
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorProfile;
