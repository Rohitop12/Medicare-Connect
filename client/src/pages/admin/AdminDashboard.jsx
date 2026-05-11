import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { Users, UserCheck, ShieldCheck, Activity, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        axiosInstance.get('/admin/stats'),
        axiosInstance.get(`/admin/users${filter !== 'all' ? `?role=${filter}` : ''}`)
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const verifyDoctor = async (id) => {
    try {
      await axiosInstance.put(`/admin/users/${id}/verify-doctor`);
      toast.success('Doctor verified successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to verify doctor');
    }
  };

  const deleteUser = async (id) => {
    if(!window.confirm('Are you sure you want to delete this user? This action is irreversible.')) return;
    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  if (loading && !stats) return <div>Loading Admin Dashboard...</div>;

  const statCards = [
    { title: "Total Patients", value: stats?.totalPatients || 0, icon: <Users size={24} />, color: "bg-blue-50 text-blue-600" },
    { title: "Total Doctors", value: stats?.totalDoctors || 0, icon: <UserCheck size={24} />, color: "bg-green-50 text-green-600" },
    { title: "Appointments Today", value: stats?.appointmentsToday || 0, icon: <Activity size={24} />, color: "bg-orange-50 text-orange-600" },
    { title: "Active Reminders", value: stats?.activeReminders || 0, icon: <ShieldCheck size={24} />, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and user management.</p>
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

      {/* User Management */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold font-heading">User Management</h2>
          <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
            {['all', 'patient', 'doctor'].map(role => (
              <button 
                key={role}
                onClick={() => setFilter(role)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition ${filter === role ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-sm">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={u.profilePic || 'https://via.placeholder.com/40'} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="font-medium text-gray-800">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'doctor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.role === 'doctor' ? (
                      <span className={`flex items-center gap-1 text-xs font-medium ${u.isVerified ? 'text-green-600' : 'text-orange-500'}`}>
                        {u.isVerified ? <><CheckCircle size={14}/> Verified</> : 'Pending Verification'}
                      </span>
                    ) : (
                      <span className="text-green-600 text-xs font-medium">Active</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {u.role === 'doctor' && !u.isVerified && (
                      <button 
                        onClick={() => verifyDoctor(u._id)}
                        className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition inline-flex"
                        title="Verify Doctor"
                      >
                        <UserCheck size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteUser(u._id)}
                      className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition inline-flex"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
