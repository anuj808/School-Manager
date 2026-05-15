import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { UserCircle, Download, CalendarClock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function MyHr() {
  const [payrolls, setPayrolls] = useState([]);
  const [leaves, setLeaves] = useState([]);
  
  const [leaveForm, setLeaveForm] = useState({ leave_type: 'Sick Leave', from_date: '', to_date: '', days: 1, reason: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, lRes] = await Promise.all([
        api.get('/hr/payroll'),
        api.get('/hr/leaves')
      ]);
      setPayrolls(pRes.data.data);
      setLeaves(lRes.data.data);
    } catch (err) { toast.error('Failed to load data'); }
  };

  const applyLeave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hr/leaves', leaveForm);
      toast.success('Leave application submitted!');
      fetchData();
      setLeaveForm({ leave_type: 'Sick Leave', from_date: '', to_date: '', days: 1, reason: '' });
    } catch (err) { toast.error('Failed to apply for leave'); }
  };

  const downloadPayslip = async (id, month, year) => {
    toast.loading('Downloading Payslip...', { id: 'pdf' });
    try {
      const res = await api.get(`/hr/payroll/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success('Downloaded!', { id: 'pdf' });
    } catch (error) { toast.error('Failed to download PDF', { id: 'pdf' }); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Toaster position="top-right" />
      
      {/* Left Column: Payslips */}
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><UserCircle /> My Payslips</h1>
          <p className="text-gray-500">Download your monthly salary slips.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {payrolls.map(p => (
              <li key={p.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <div className="font-bold text-gray-900">{new Date(p.year, p.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                  <div className="text-sm text-gray-500">Net Salary: ${parseFloat(p.net_salary).toFixed(2)}</div>
                </div>
                <button onClick={() => downloadPayslip(p.id, p.month, p.year)} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-100 flex items-center gap-2">
                  <Download size={16}/> Download
                </button>
              </li>
            ))}
            {payrolls.length === 0 && <li className="p-6 text-center text-gray-500">No payslips available yet.</li>}
          </ul>
        </div>
      </div>

      {/* Right Column: Leaves */}
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><CalendarClock /> Leave Management</h1>
          <p className="text-gray-500">Apply for leave and view past requests.</p>
        </div>
        
        {/* Apply Leave Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="font-bold text-gray-800 mb-4">Apply for Leave</h3>
          <form onSubmit={applyLeave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Leave Type</label>
                <select value={leaveForm.leave_type} onChange={e=>setLeaveForm({...leaveForm, leave_type: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
                  <option>Sick Leave</option><option>Casual Leave</option><option>Maternity Leave</option><option>Unpaid Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Total Days</label>
                <input type="number" min="1" required value={leaveForm.days} onChange={e=>setLeaveForm({...leaveForm, days: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">From Date</label>
                <input type="date" required value={leaveForm.from_date} onChange={e=>setLeaveForm({...leaveForm, from_date: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">To Date</label>
                <input type="date" required value={leaveForm.to_date} onChange={e=>setLeaveForm({...leaveForm, to_date: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Reason</label>
              <textarea required value={leaveForm.reason} onChange={e=>setLeaveForm({...leaveForm, reason: e.target.value})} className="w-full border rounded-lg px-3 py-2 h-20" placeholder="Brief reason for leave..." />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition">Submit Application</button>
          </form>
        </div>

        {/* Leave History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 font-bold text-gray-800">Application History</div>
          <ul className="divide-y divide-gray-100">
            {leaves.map(l => (
              <li key={l.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-900">{l.leave_type} ({l.days} days)</span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${l.status === 'pending' ? 'bg-amber-100 text-amber-700' : l.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{l.status.toUpperCase()}</span>
                </div>
                <div className="text-sm text-gray-500 mb-1">{l.from_date} to {l.to_date}</div>
                {l.remarks && <div className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded mt-2">Note: {l.remarks}</div>}
              </li>
            ))}
            {leaves.length === 0 && <li className="p-6 text-center text-gray-500">No leave applications found.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
