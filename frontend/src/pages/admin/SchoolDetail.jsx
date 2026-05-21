import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeft, Plus, Users, Shield, Loader2, Info, CreditCard, Settings as SettingsIcon } from 'lucide-react';

export default function SchoolDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    password: '',
    role: 'school_admin',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [id]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/admin/schools/${id}/users`);
      if(res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/schools/${id}/users`, formData);
      setShowModal(false);
      fetchUsers();
      setFormData({
        full_name: '',
        username: '',
        password: '',
        role: 'school_admin',
        email: '',
        phone: ''
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleSeedUsers = async () => {
    try {
      await api.post(`/admin/schools/${id}/users/seed`);
      fetchUsers();
      alert('Test users created successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to seed users');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <button 
        onClick={() => navigate('/admin/dashboard')}
        className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors mb-6"
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="text-indigo-600" /> School Management
            </h1>
            <p className="text-gray-500 mt-1">Manage users and settings for this school instance.</p>
          </div>
          {activeTab === 'users' && (
            <div className="flex gap-3">
              <button 
                onClick={handleSeedUsers}
                className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-green-700 transition-colors font-medium text-sm"
              >
                Create Test Users
              </button>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 hover:bg-indigo-700 transition-colors font-medium text-sm"
              >
                <Plus size={18} /> Add User
              </button>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button 
                onClick={() => setActiveTab('overview')} 
                className={`${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <Info size={18} /> Overview
              </button>
              <button 
                onClick={() => setActiveTab('users')} 
                className={`${activeTab === 'users' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <Users size={18} /> Users
              </button>
              <button 
                onClick={() => setActiveTab('subscription')} 
                className={`${activeTab === 'subscription' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <CreditCard size={18} /> Subscription
              </button>
              <button 
                onClick={() => setActiveTab('settings')} 
                className={`${activeTab === 'settings' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <SettingsIcon size={18} /> Settings
              </button>
            </nav>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-600 h-8 w-8" /></div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="py-8 text-center text-gray-500">
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Overview</h3>
                  <p>School details and quick stats (students, teachers, classes) will appear here.</p>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3 font-semibold rounded-tl-lg">Username</th>
                        <th className="px-6 py-3 font-semibold">Role</th>
                        <th className="px-6 py-3 font-semibold">Email</th>
                        <th className="px-6 py-3 font-semibold rounded-tr-lg">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{u.username}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                              {u.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{u.email || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {u.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                            No users found for this school.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'subscription' && (
                <div className="py-8 text-center text-gray-500">
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Subscription Details</h3>
                  <p>Current plan, trial end date, and change plan button will appear here.</p>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="py-8 text-center text-gray-500">
                  <h3 className="text-xl font-medium text-gray-700 mb-2">School Settings</h3>
                  <p>Suspend school toggle and delete school button will appear here.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Add New User</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="johndoe" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="••••••••" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white">
                  <option value="school_admin">School Admin</option>
                  <option value="principal">Principal</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="+1 234 567 890" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
