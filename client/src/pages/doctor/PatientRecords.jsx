import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, FilePlus, ChevronRight } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const PatientRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await axiosInstance.get('/appointments');
        // Extract unique patients from appointments
        const uniquePatientsMap = new Map();
        
        data.forEach(app => {
          if (app.patientId && !uniquePatientsMap.has(app.patientId._id)) {
            uniquePatientsMap.set(app.patientId._id, {
              id: app.patientId._id,
              name: app.patientId.name,
              email: app.patientId.email,
              phone: app.patientId.phone,
              avatar: app.patientId.profilePic || 'https://via.placeholder.com/150',
              lastVisit: app.scheduledAt,
              gender: 'Not specified', // Since gender is not returned in the populated data
              condition: app.symptoms || 'Routine Checkup'
            });
          } else if (app.patientId && uniquePatientsMap.has(app.patientId._id)) {
             // Update lastVisit if this appointment is more recent
             const existing = uniquePatientsMap.get(app.patientId._id);
             if (new Date(app.scheduledAt) > new Date(existing.lastVisit)) {
               existing.lastVisit = app.scheduledAt;
               uniquePatientsMap.set(app.patientId._id, existing);
             }
          }
        });
        
        setPatients(Array.from(uniquePatientsMap.values()));
      } catch (error) {
        toast.error('Failed to load patient records');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewFile = (patientName) => {
    toast.info(`Patient file for ${patientName} will open in a modal (Coming soon)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-800">Patient Records</h1>
          <p className="text-gray-500 mt-1">Directory of all your assigned and past patients.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-teal-700 transition">
          <FilePlus size={20} /> Add New Patient
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search patients by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition">
            <Filter size={20} /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-sm">
                <th className="pb-3 font-medium">Patient Info</th>
                <th className="pb-3 font-medium">Patient ID</th>
                <th className="pb-3 font-medium">Gender</th>
                <th className="pb-3 font-medium">Condition</th>
                <th className="pb-3 font-medium">Last Visit</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">Loading patients...</td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">No patients found.</td>
                </tr>
              ) : (
                filteredPatients.map(patient => (
                  <tr key={patient.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={patient.avatar} alt={patient.name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex flex-col">
                           <span className="font-bold text-gray-800">{patient.name}</span>
                           <span className="text-xs text-gray-500">{patient.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-gray-600 text-sm">...{patient.id.slice(-6)}</td>
                    <td className="py-4 text-gray-600">{patient.gender}</td>
                    <td className="py-4">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{patient.condition}</span>
                    </td>
                    <td className="py-4 text-gray-600">{format(new Date(patient.lastVisit), 'MMM dd, yyyy')}</td>
                    <td className="py-4">
                      <button onClick={() => handleViewFile(patient.name)} className="flex items-center gap-2 text-primary font-medium hover:underline opacity-0 group-hover:opacity-100 transition">
                        View File <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientRecords;
