import React, { useState, useEffect } from 'react';
import { Clock, Check, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axios';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorAvailability = () => {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState(
    DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: { isWorking: day !== 'Sunday', start: '09:00', end: '17:00' }
    }), {})
  );

  const handleToggle = (day) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], isWorking: !schedule[day].isWorking }
    });
  };

  const handleTimeChange = (day, field, value) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], [field]: value }
    });
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const { data } = await axiosInstance.get('/users/profile');
        if (data.availability && Object.keys(data.availability).length > 0) {
          setSchedule(data.availability);
        }
      } catch (error) {
        console.error('Failed to fetch availability', error);
      }
    };
    fetchAvailability();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axiosInstance.put('/users/availability', { availability: schedule });
      toast.success('Availability settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-800">Availability</h1>
        <p className="text-gray-500 mt-1">Set your working hours for patient appointments.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
        
        <div className="space-y-6">
          {DAYS.map(day => (
            <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b border-gray-50 last:border-0">
              
              <div className="w-48 flex items-center gap-3">
                <button 
                  onClick={() => handleToggle(day)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${schedule[day].isWorking ? 'bg-primary' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${schedule[day].isWorking ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </button>
                <span className={`font-medium ${schedule[day].isWorking ? 'text-gray-800' : 'text-gray-400'}`}>{day}</span>
              </div>

              {schedule[day].isWorking ? (
                <div className="flex flex-1 items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <input 
                      type="time" 
                      value={schedule[day].start} 
                      onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <span className="text-gray-400">to</span>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <input 
                      type="time" 
                      value={schedule[day].end} 
                      onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <span className="text-sm text-gray-400 italic bg-gray-50 px-4 py-2 rounded-xl">Not available</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-teal-700 transition disabled:opacity-70 shadow-lg shadow-primary/20"
          >
            {loading ? 'Saving...' : <><Save size={20} /> Save Schedule</>}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DoctorAvailability;
