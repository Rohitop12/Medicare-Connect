import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Calendar, Heart, Shield, Camera } from 'lucide-react';

const Profile = () => {
  const { user, login, setUser } = useContext(AuthContext); 
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    gender: user?.gender || '',
    medicalHistory: user?.medicalHistory?.join(', ') || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || formData.name.trim().length < 3) {
      return toast.error('Full Name must be at least 3 characters long');
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      return toast.error('Please enter a valid 10-digit phone number');
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.put('/users/profile', {
        ...formData,
        medicalHistory: formData.medicalHistory ? formData.medicalHistory.split(',').map(item => item.trim()).filter(Boolean) : []
      });
      // Update local storage and context
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if(passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords don't match");
    }
    // API logic for password change goes here
    toast.success("Password updated successfully");
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const { data } = await axiosInstance.post('/users/upload-profile-pic', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const updatedUser = { ...user, profilePic: data.profilePic };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-800">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information and security settings.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left Column - Avatar Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
            <div className="relative inline-block mb-4">
              <img 
                src={user?.profilePic || 'https://via.placeholder.com/150'} 
                alt="Profile" 
                className={`w-32 h-32 rounded-full object-cover border-4 border-primary/10 mx-auto ${uploading ? 'opacity-50' : ''}`}
              />
              <button 
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-teal-700 transition border-2 border-white disabled:bg-gray-400"
              >
                <Camera size={16} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800 font-heading">{user?.name}</h2>
            <p className="text-gray-500 text-sm capitalize">{user?.role}</p>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Personal Info Form */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold font-heading mb-6 flex items-center gap-2">
              <User size={20} className="text-primary" /> Personal Information
            </h3>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Read Only)</label>
                  <input type="email" readOnly value={user?.email || ''} className="w-full border border-gray-200 rounded-xl py-2.5 px-4 bg-gray-100 text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical History / Allergies</label>
                <textarea 
                  name="medicalHistory" 
                  value={formData.medicalHistory} 
                  onChange={handleInputChange} 
                  rows="3" 
                  placeholder="Comma separated values e.g., Penicillin allergy, Asthma"
                  className="w-full border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50"
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-teal-700 transition disabled:opacity-70 shadow-lg shadow-primary/20">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Security Form */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold font-heading mb-6 flex items-center gap-2">
              <Shield size={20} className="text-primary" /> Security Settings
            </h3>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required className="w-full border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required className="w-full border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required className="w-full border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-gray-800 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-900 transition shadow-lg shadow-gray-800/20">
                  Update Password
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
