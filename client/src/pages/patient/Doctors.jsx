import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';
import { Search, MapPin, Star, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, [specialty]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/users/doctors', {
        params: { specialty }
      });
      setDoctors(data);
    } catch (error) {
      toast.error('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(search.toLowerCase()) || 
    doc.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-800">Find a Doctor</h1>
        <p className="text-gray-500 mt-1">Search and book appointments with our verified specialists.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search doctors by name or specialty..." 
            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          value={specialty} 
          onChange={(e) => setSpecialty(e.target.value)}
          className="px-4 py-3 bg-gray-50 rounded-xl outline-none border-none cursor-pointer focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Specialties</option>
          <option value="Cardiologist">Cardiologist</option>
          <option value="Dermatologist">Dermatologist</option>
          <option value="Neurologist">Neurologist</option>
          <option value="Pediatrician">Pediatrician</option>
          <option value="Psychiatrist">Psychiatrist</option>
          <option value="General Physician">General Physician</option>
        </select>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100"></div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500">No doctors found matching your criteria.</div>
          ) : (
            filteredDoctors.map(doctor => (
              <div key={doctor._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={doctor.profilePic || 'https://via.placeholder.com/150'} 
                    alt={doctor.name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">Dr. {doctor.name}</h3>
                    <p className="text-primary font-medium text-sm">{doctor.specialization}</p>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span>4.8 (120 reviews)</span> {/* Mocked rating */}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{doctor.hospital || 'MediCare Connect Online'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>{doctor.experienceYears || 0} Years Experience</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/dashboard/doctors/${doctor._id}`)}
                  className="w-full py-2.5 bg-primary/10 text-primary font-medium rounded-xl hover:bg-primary hover:text-white transition"
                >
                  View Profile & Book
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Doctors;
