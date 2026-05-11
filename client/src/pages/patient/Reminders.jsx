import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';
import { Plus, Clock, Calendar as CalendarIcon, Trash2, Power, PowerOff } from 'lucide-react';
import { format } from 'date-fns';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'daily',
    times: ['08:00'],
    startDate: '',
    endDate: '',
    reminderType: 'both',
    notes: ''
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const { data } = await axiosInstance.get('/reminders');
      setReminders(data);
    } catch (error) {
      toast.error('Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTimeChange = (index, value) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  const addTimeField = () => {
    setFormData({ ...formData, times: [...formData.times, '12:00'] });
  };

  const removeTimeField = (index) => {
    const newTimes = formData.times.filter((_, i) => i !== index);
    setFormData({ ...formData, times: newTimes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/reminders', formData);
      toast.success('Reminder added successfully');
      setShowModal(false);
      fetchReminders();
      // Reset form
      setFormData({
        medicineName: '', dosage: '', frequency: 'daily', times: ['08:00'],
        startDate: '', endDate: '', reminderType: 'both', notes: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding reminder');
    }
  };

  const toggleReminder = async (id) => {
    try {
      await axiosInstance.patch(`/reminders/${id}/toggle`);
      fetchReminders();
    } catch (error) {
      toast.error('Failed to toggle reminder');
    }
  };

  const deleteReminder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    try {
      await axiosInstance.delete(`/reminders/${id}`);
      toast.success('Reminder deleted');
      fetchReminders();
    } catch (error) {
      toast.error('Failed to delete reminder');
    }
  };

  if (loading) return <div>Loading reminders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-heading text-gray-800">Medicine Reminders</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          <Plus size={20} />
          Add Reminder
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reminders.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-10">No reminders set yet. Add one to get started!</p>
        ) : (
          reminders.map((reminder) => (
            <div key={reminder._id} className={`bg-white p-6 rounded-2xl shadow-sm border ${reminder.isActive ? 'border-primary/20' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{reminder.medicineName}</h3>
                  <p className="text-sm text-gray-500">{reminder.dosage} • {reminder.frequency}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleReminder(reminder._id)} className={`p-2 rounded-full ${reminder.isActive ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50'}`}>
                    {reminder.isActive ? <Power size={18} /> : <PowerOff size={18} />}
                  </button>
                  <button onClick={() => deleteReminder(reminder._id)} className="p-2 text-red-600 bg-red-50 rounded-full hover:bg-red-100">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Clock size={16} />
                  <span>{reminder.times.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <CalendarIcon size={16} />
                  <span>{format(new Date(reminder.startDate), 'MMM d, yyyy')} - {format(new Date(reminder.endDate), 'MMM d, yyyy')}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${reminder.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {reminder.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium capitalize">
                  {reminder.reminderType}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Reminder Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4 font-heading">Add Medicine Reminder</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                <input type="text" name="medicineName" required value={formData.medicineName} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dosage (e.g., 500mg, 1 pill)</label>
                <input type="text" name="dosage" required value={formData.dosage} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" name="startDate" required value={formData.startDate} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" name="endDate" required value={formData.endDate} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Times</label>
                {formData.times.map((time, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input type="time" required value={time} onChange={(e) => handleTimeChange(index, e.target.value)} className="flex-1 border rounded-lg p-2" />
                    {formData.times.length > 1 && (
                      <button type="button" onClick={() => removeTimeField(index)} className="p-2 text-red-600 bg-red-50 rounded-lg"><Trash2 size={20} /></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addTimeField} className="text-sm text-primary font-medium mt-1">+ Add another time</button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Type</label>
                <select name="reminderType" value={formData.reminderType} onChange={handleInputChange} className="w-full border rounded-lg p-2">
                  <option value="both">Both (Email & In-App)</option>
                  <option value="in-app">In-App Only</option>
                  <option value="email">Email Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} className="w-full border rounded-lg p-2" rows="2" placeholder="e.g., Take after meals"></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-teal-700">Save Reminder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;
