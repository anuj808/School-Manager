import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Plus, Building2, Users, Settings, LogOut, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [successModal, setSuccessModal] = useState(null);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    city: '', 
    state: '',
    contact_email: '',
    contact_phone: '',
    academic_year: '2026-2027',
    admin_username: '',
    admin_password: '',
    plan: 'Free Trial'
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const res = await api.get('/schools');
      if(res.data.success) {
        setSchools(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    const suggestedUsername = val.toLowerCase().replace(/[^a-z0-9]/g, '') + '_admin';
    setFormData(prev => ({
      ...prev,
      name: val,
      admin_username: suggestedUsername
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/schools', formData);
      setShowModal(false);
      setSuccessModal(res.data.message || `School created successfully!`);
      fetchSchools();
      setFormData({ 
        name: '', city: '', state: '', contact_email: '', contact_phone: '', 
        academic_year: '2026-2027', admin_username: '', admin_password: '', plan: 'Free Trial' 
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create school');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-950 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 font-bold text-2xl border-b border-indigo-900 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Building2 size={24} className="text-white" />
          </div>
          ERP Platform
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/dashboard" className="flex items-center gap-3 bg-indigo-900 p-3 rounded-lg text-indigo-100 shadow-sm border border-indigo-800">
            <Building2 size={20} /> Registered Schools
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 hover:bg-indigo-900 p-3 rounded-lg text-indigo-300 transition-colors">
            <Users size={20} /> Platform Users
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-3 hover:bg-indigo-900 p-3 rounded-lg text-indigo-300 transition-colors">
            <Settings size={20} /> Global Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-indigo-900">
          <button onClick={logout} className="flex items-center gap-3 w-full p-3 rounded-lg text-red-300 hover:bg-red-500 hover:text-white transition-colors">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center z-0">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Super Admin Hub</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">System Administrator</div>
              <div className="text-xs text-gray-500">Super Admin Access</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-indigo-200">
              SA
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Schools Management</h2>
              <p className="text-sm text-gray-500 mt-1">View, register, and manage independent school instances.</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-md flex items-center gap-2 hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 font-medium"
            >
              <Plus size={20} /> Register School
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-indigo-600 h-10 w-10" /></div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">School ID</th>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Academic Year</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {schools.map(school => (
                      <tr key={school.id} className="hover:bg-indigo-50/50 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-indigo-900">{school.school_code}</td>
                        <td className="px-6 py-4 text-gray-800 font-medium">{school.name}</td>
                        <td className="px-6 py-4 text-gray-600">{school.academic_year}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wide ${school.is_active ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                            {school.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => navigate(`/admin/schools/${school.id}`)} className="text-indigo-600 hover:text-indigo-900 font-semibold text-sm bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition">Manage</button>
                        </td>
                      </tr>
                    ))}
                    {schools.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-3">
                            <Building2 size={48} className="text-gray-300" />
                            <p className="text-lg font-medium">No schools found</p>
                            <p className="text-sm">Click 'Register School' to onboard a new tenant.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create School Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all">
            <div className="bg-indigo-600 p-6 text-white border-b border-indigo-700">
              <h3 className="text-xl font-bold">Register New School</h3>
              <p className="text-indigo-200 text-sm mt-1">Create a new isolated tenant environment.</p>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">School Name</label>
                  <input required type="text" value={formData.name} onChange={handleNameChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" placeholder="e.g. Springfield Elementary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                  <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" placeholder="e.g. New York" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                  <input required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" placeholder="e.g. NY" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Email</label>
                  <input required type="email" value={formData.contact_email} onChange={e => setFormData({...formData, contact_email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" placeholder="admin@school.edu" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone</label>
                  <input required type="text" value={formData.contact_phone} onChange={e => setFormData({...formData, contact_phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" placeholder="+1 234 567 8900" />
                </div>
                <div className="col-span-2 border-t pt-4 mt-2">
                  <h4 className="font-semibold text-gray-900 mb-4">Initial Admin Account</h4>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Username</label>
                  <input required type="text" value={formData.admin_username} onChange={e => setFormData({...formData, admin_username: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" placeholder="Suggested username" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Password</label>
                  <input required type="text" value={formData.admin_password} onChange={e => setFormData({...formData, admin_password: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" placeholder="Initial password" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Subscription Plan</label>
                  <select required value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option>Free Trial</option>
                    <option>Starter</option>
                    <option>Growth</option>
                    <option>Pro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Academic Year</label>
                  <input required type="text" value={formData.academic_year} onChange={e => setFormData({...formData, academic_year: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div className="pt-4 flex gap-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-semibold transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-semibold shadow-md transition-all active:scale-95">Register Tenant</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600 mb-6">{successModal}</p>
            <button 
              onClick={() => setSuccessModal(null)}
              className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
