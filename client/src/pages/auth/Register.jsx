import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    specialization: '',
    licenseNumber: '',
    hospital: '',
    experienceYears: ''
  });
  const [loading, setLoading] = useState(false);
  const { register, googleLogin, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'patient') navigate('/dashboard', { replace: true });
      else if (user.role === 'doctor') navigate('/doctor/dashboard', { replace: true });
      else if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const user = await googleLogin(credentialResponse.credential);
      toast.success('Google Login successful!');
      if (user.role === 'patient') navigate('/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    } catch (error) {
      toast.error('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(formData);
      toast.success('Registration successful!');
      if (user.role === 'patient') navigate('/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
    } catch (error) {
      console.error("REGISTRATION ERROR:", error);
      toast.error(error.response?.data?.message || error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 text-primary">
          <Activity size={40} />
          <span className="text-3xl font-heading font-bold">MediCare</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-heading font-extrabold text-gray-900">
          Create an account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="flex justify-center space-x-4 mb-6">
              <label className={`cursor-pointer px-4 py-2 rounded-full border ${formData.role === 'patient' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300'}`}>
                <input type="radio" name="role" value="patient" className="hidden" checked={formData.role === 'patient'} onChange={handleChange} />
                I am a Patient
              </label>
              <label className={`cursor-pointer px-4 py-2 rounded-full border ${formData.role === 'doctor' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300'}`}>
                <input type="radio" name="role" value="doctor" className="hidden" checked={formData.role === 'doctor'} onChange={handleChange} />
                I am a Doctor
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
              </div>

              {formData.role === 'doctor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Specialization</label>
                    <input type="text" name="specialization" required value={formData.specialization} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">License Number</label>
                    <input type="text" name="licenseNumber" required value={formData.licenseNumber} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hospital/Clinic</label>
                    <input type="text" name="hospital" required value={formData.hospital} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                    <input type="number" name="experienceYears" required value={formData.experienceYears} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                  </div>
                </>
              )}
            </div>

            <div>
              <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
