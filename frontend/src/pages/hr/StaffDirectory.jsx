import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, Plus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function StaffDirectory() {
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', employee_id: '', designation: '', department: '', phone: '', email: '', salary_basic: '', bank_account: '' });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/hr/staff');
      setStaff(res.data.data);
    } catch (err) { toast.error('Failed to load staff'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hr/staff', formData);
      toast.success('Staff member added successfully!');
      setShowModal(false);
      fetchStaff();
    } catch (err) { toast.error('Failed to add staff'); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Users /> Staff Directory</h1>
          <p className="text-gray-500">Manage all school employees and their profiles.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm font-medium">
          <Plus size={20} /> Add Staff
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b text-sm text-gray-600 font-semibold">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Basic Salary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{s.full_name}</div>
                  <div className="text-xs text-gray-500">{s.designation} | {s.employee_id}</div>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  <div>{s.email}</div>
                  <div>{s.phone}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{s.department}</td>
                <td className="px-6 py-4 font-bold text-gray-900">${s.salary_basic}</td>
              </tr>
            ))}
            {staff.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-gray-500">No staff records found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b"><h3 className="text-xl font-bold">Add Staff Member</h3></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Full Name</label><input required value={formData.full_name} onChange={e=>setFormData({...formData, full_name: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Employee ID</label><input required value={formData.employee_id} onChange={e=>setFormData({...formData, employee_id: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Designation</label><input required value={formData.designation} onChange={e=>setFormData({...formData, designation: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <select required value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
                    <option value="">Select</option><option>Teaching</option><option>Administration</option><option>Maintenance</option><option>Transport</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" required value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Phone</label><input required value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Basic Salary ($)</label><input type="number" required value={formData.salary_basic} onChange={e=>setFormData({...formData, salary_basic: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Bank Account</label><input required value={formData.bank_account} onChange={e=>setFormData({...formData, bank_account: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg">Save Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
