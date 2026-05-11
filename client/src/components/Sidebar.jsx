import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  Calendar, 
  CalendarDays, 
  MessageSquare, 
  Bot, 
  UserCircle, 
  LogOut,
  Users
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const patientLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Reminders', path: '/dashboard/reminders', icon: <Clock size={20} /> },
    { name: 'Find Doctor', path: '/dashboard/doctors', icon: <Users size={20} /> },
    { name: 'Appointments', path: '/dashboard/appointments', icon: <CalendarDays size={20} /> },
    { name: 'Messages', path: '/dashboard/messages', icon: <MessageSquare size={20} /> },
    { name: 'AI Assistant', path: '/dashboard/ai-assistant', icon: <Bot size={20} /> },
    { name: 'Profile', path: '/dashboard/profile', icon: <UserCircle size={20} /> },
  ];

  const doctorLinks = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Appointments', path: '/doctor/dashboard/appointments', icon: <CalendarDays size={20} /> },
    { name: 'Patient Records', path: '/doctor/dashboard/records', icon: <Users size={20} /> },
    { name: 'Messages', path: '/doctor/dashboard/messages', icon: <MessageSquare size={20} /> },
    { name: 'Availability', path: '/doctor/dashboard/availability', icon: <Calendar size={20} /> },
    { name: 'Profile', path: '/doctor/dashboard/profile', icon: <UserCircle size={20} /> },
  ];

  const links = user?.role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed top-0 left-0">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <Bot size={28} /> {/* Using Bot as a placeholder logo */}
          <span className="text-xl font-heading font-bold">MediCare</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              location.pathname === link.path 
                ? 'bg-primary text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
            }`}
          >
            {link.icon}
            <span className="font-medium">{link.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl w-full transition-colors font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
