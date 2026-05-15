import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { DollarSign, Download, PlayCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function PayrollManager() {
  const [payrolls, setPayrolls] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPayroll();
  }, [month, year]);

  const fetchPayroll = async () => {
    try {
      const res = await api.get(`/hr/payroll?month=${month}&year=${year}`);
      setPayrolls(res.data.data);
    } catch (err) { toast.error('Failed to load payroll'); }
  };

  const generatePayroll = async () => {
    if(!window.confirm(`Generate payroll for ${month}/${year}? This will recalculate existing payslips.`)) return;
    setLoading(true);
    try {
      await api.post('/hr/payroll/generate', { month, year });
      toast.success('Payroll generated successfully!');
      fetchPayroll();
    } catch (err) { toast.error('Failed to generate payroll'); }
    setLoading(false);
  };

  const downloadPayslip = async (id) => {
    toast.loading('Downloading Payslip...', { id: 'pdf' });
    try {
      const res = await api.get(`/hr/payroll/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success('Downloaded!', { id: 'pdf' });
    } catch (error) { toast.error('Failed to download PDF', { id: 'pdf' }); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><DollarSign /> Payroll Management</h1>
          <p className="text-gray-500">Generate monthly payslips and manage staff salaries.</p>
        </div>
        <div className="flex gap-4">
          <select value={month} onChange={e => setMonth(e.target.value)} className="border rounded-lg px-4 py-2 bg-white">
            {[...Array(12).keys()].map(i => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
          </select>
          <input type="number" value={year} onChange={e => setYear(e.target.value)} className="border rounded-lg px-4 py-2 w-24 bg-white" />
          <button disabled={loading} onClick={generatePayroll} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm font-medium">
            <PlayCircle size={20} /> {loading ? 'Processing...' : 'Run Payroll'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b text-sm text-gray-600 font-semibold">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Basic</th>
              <th className="px-6 py-4">Allowances</th>
              <th className="px-6 py-4">Deductions</th>
              <th className="px-6 py-4">Net Salary</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payrolls.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{p.Staff?.full_name}</div>
                  <div className="text-xs text-gray-500">{p.Staff?.employee_id}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">${parseFloat(p.basic).toFixed(2)}</td>
                <td className="px-6 py-4 text-green-600 font-medium">+${parseFloat(p.allowances).toFixed(2)}</td>
                <td className="px-6 py-4 text-red-500 font-medium">-${parseFloat(p.deductions).toFixed(2)}</td>
                <td className="px-6 py-4 font-bold text-gray-900">${parseFloat(p.net_salary).toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => downloadPayslip(p.id)} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center justify-end gap-1"><Download size={16}/> Payslip</button>
                </td>
              </tr>
            ))}
            {payrolls.length === 0 && <tr><td colSpan="6" className="text-center py-12 text-gray-500">No payroll records for this month. Run payroll to generate.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
