import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { CalendarClock, Check, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function LeaveManager() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/hr/leaves');
      setLeaves(res.data.data);
    } catch (err) { toast.error('Failed to load leaves'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/hr/leaves/${id}`, { status, remarks: status === 'approved' ? 'Approved by Admin' : 'Rejected' });
      toast.success(`Leave ${status}`);
      fetchLeaves();
    } catch (err) { toast.error('Failed to update status'); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><CalendarClock /> Leave Requests</h1>
        <p className="text-gray-500">Manage staff leave applications.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b text-sm text-gray-600 font-semibold">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Leave Type</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Reason</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leaves.map(l => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{l.Staff?.full_name}</div>
                  <div className="text-xs text-gray-500">{l.Staff?.employee_id}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{l.leave_type}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-800">{l.days} days</div>
                  <div className="text-xs text-gray-500">{l.from_date} to {l.to_date}</div>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate" title={l.reason}>{l.reason}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${l.status === 'pending' ? 'bg-amber-100 text-amber-700' : l.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {l.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {l.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => updateStatus(l.id, 'approved')} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check size={18}/></button>
                      <button onClick={() => updateStatus(l.id, 'rejected')} className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"><X size={18}/></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {leaves.length === 0 && <tr><td colSpan="6" className="text-center py-8 text-gray-500">No leave requests found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
