import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { AlertCircle } from 'lucide-react';

export default function PendingDues() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/fees/pending').then(res => {
      setPending(res.data.data.sort((a,b) => b.pendingAmount - a.pendingAmount));
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><AlertCircle /> Pending Dues</h1>
        <p className="text-gray-500">List of all students with outstanding fee balances.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b text-sm text-gray-600 font-semibold">
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Admission No</th>
              <th className="px-6 py-4">Class</th>
              <th className="px-6 py-4 text-right">Total Outstanding Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan="4" className="p-8 text-center">Loading...</td></tr> : pending.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{p.student.full_name}</td>
                <td className="px-6 py-4 text-gray-600 font-mono">{p.student.admission_no}</td>
                <td className="px-6 py-4 text-gray-600">{p.student.Class?.name}-{p.student.Class?.section}</td>
                <td className="px-6 py-4 text-right font-bold text-red-600">${p.pendingAmount.toFixed(2)}</td>
              </tr>
            ))}
            {!loading && pending.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-gray-500">No pending dues across the school.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
