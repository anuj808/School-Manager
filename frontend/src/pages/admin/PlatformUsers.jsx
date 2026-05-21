import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { Users, Search, Filter, ShieldCheck, Power, KeyRound, Copy } from 'lucide-react';

export default function PlatformUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [schools, setSchools] = useState([]);
  
  const [resetModalData, setResetModalData] = useState(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, schoolFilter, page]);

  const fetchSchools = async () => {
    try {
      const res = await api.get('/schools');
      setSchools(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search,
        role: roleFilter,
        schoolId: schoolFilter,
        page,
        limit: 25
      }).toString();
      
      const res = await api.get(`/admin/users?${query}`);
      setUsers(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if(!window.confirm('Deactivate this user? They will not be able to log in.')) return;
    try {
      await api.put(`/admin/users/${id}/deactivate`);
      toast.success('User deactivated successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to deactivate user');
    }
  };

  const handleResetPassword = async (id) => {
    if(!window.confirm("Are you sure you want to reset this user's password?")) return;
    try {
      const res = await api.put(`/admin/users/${id}/reset-password`);
      setResetModalData(res.data.tempPassword);
      toast.success('Password reset successfully');
    } catch (err) {
      toast.error('Failed to reset password');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Users size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Platform Users</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 font-medium">Logged in as {user.username} (Super Admin)</span>
          </div>
        </nav>

        <div className="p-8 max-w-7xl mx-auto">
          <Toaster position="top-right" />
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search username or name..." 
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <select 
                value={roleFilter} 
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
              >
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="school_admin">School Admin</option>
                <option value="principal">Principal</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
              </select>
              <select 
                value={schoolFilter} 
                onChange={(e) => { setSchoolFilter(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
              >
                <option value="">All Schools</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.school_code})</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">School</th>
                    <th className="px-6 py-4">School ID</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Last Login</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="7" className="text-center py-12 text-gray-500">Loading...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-12 text-gray-500">No users found.</td></tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{u.username}</div>
                          <div className="text-xs text-gray-500">{u.email || 'No email'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium border border-indigo-100 capitalize">
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{u.School ? u.School.name : '-'}</td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-500">{u.School ? u.School.school_code : '-'}</td>
                        <td className="px-6 py-4">
                          {u.is_active ? (
                            <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium border border-green-100">Active</span>
                          ) : (
                            <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full font-medium border border-red-100">Inactive</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleResetPassword(u.id)}
                              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition" 
                              title="Reset Password"
                            >
                              <KeyRound size={18} />
                            </button>
                            {u.is_active && u.role !== 'super_admin' && (
                              <button 
                                onClick={() => handleDeactivate(u.id)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                                title="Deactivate User"
                              >
                                <Power size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {!loading && totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button 
                    disabled={page === 1} 
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 border border-gray-300 rounded bg-white disabled:opacity-50 hover:bg-gray-50 text-sm"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={page === totalPages} 
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 border border-gray-300 rounded bg-white disabled:opacity-50 hover:bg-gray-50 text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {resetModalData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Password Reset</h3>
              <p className="text-gray-500 text-sm mb-6">The user's password has been reset to a secure temporary password. Please copy it now.</p>
              
              <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center mb-6">
                <code className="text-lg font-mono font-bold text-gray-800">{resetModalData}</code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(resetModalData);
                    toast.success('Copied to clipboard');
                  }}
                  className="text-gray-500 hover:text-indigo-600 transition"
                >
                  <Copy size={20} />
                </button>
              </div>

              <button 
                onClick={() => setResetModalData(null)}
                className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
