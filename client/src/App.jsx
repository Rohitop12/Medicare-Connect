import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthContext } from './context/AuthContext';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Components
import ChatBot from './components/ChatBot';
import DashboardLayout from './components/DashboardLayout';

// Dashboards
import PatientDashboard from './pages/patient/Dashboard';
import Reminders from './pages/patient/Reminders';
import Doctors from './pages/patient/Doctors';
import DoctorProfile from './pages/patient/DoctorProfile';
import Appointments from './pages/patient/Appointments';
import Messages from './pages/patient/Messages';
import AIAssistant from './pages/patient/AIAssistant';
import Profile from './pages/patient/Profile';
import SymptomQuiz from './pages/patient/SymptomQuiz';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import PatientRecords from './pages/doctor/PatientRecords';
import DoctorAvailability from './pages/doctor/DoctorAvailability';
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Patient Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <DashboardLayout title="My Dashboard" />
          </ProtectedRoute>
        }>
          <Route index element={<PatientDashboard />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="doctors/:id" element={<DoctorProfile />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="quiz/:id" element={<SymptomQuiz />} />
          <Route path="messages" element={<Messages />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Doctor Routes */}
        <Route path="/doctor/dashboard" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DashboardLayout title="Doctor Dashboard" />
          </ProtectedRoute>
        }>
           <Route index element={<DoctorDashboard />} />
           <Route path="profile" element={<Profile />} />
           <Route path="messages" element={<Messages />} />
           <Route path="appointments" element={<DoctorAppointments />} />
           <Route path="records" element={<PatientRecords />} />
           <Route path="availability" element={<DoctorAvailability />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout title="Admin Dashboard" />
          </ProtectedRoute>
        }>
           <Route index element={<AdminDashboard />} />
        </Route>
      </Routes>
      <ChatBot />
    </Router>
  );
}

export default App;
