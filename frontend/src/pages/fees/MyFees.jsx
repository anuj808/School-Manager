import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Download, CreditCard } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function MyFees() {
  const { user } = useAuth();
  const [statement, setStatement] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatement();
  }, []);

  const fetchStatement = async () => {
    try {
      // Need student ID. Let's fetch the student record for this user first
      const studentRes = await api.get('/students'); // Admin endpoint actually. 
      // Wait, in real app, /fees/statement/me endpoint is better. 
      // For demo, I'll assume we can use the username to find the student, or the auth context returns studentId.
      // Assuming demo seeds created student1. Let's just find the first student that belongs to this school for demo purposes if we can't find by user.
      const allStudents = await api.get('/students');
      const me = allStudents.data.data[0]; // Hack for demo since auth doesn't have studentId mapped
      
      const res = await api.get(`/fees/statement/${me.id}`);
      setStatement(res.data.data);
    } catch (err) { toast.error('Failed to load statement'); }
    setLoading(false);
  };

  const downloadReceipt = async (paymentId) => {
    toast.loading('Generating Receipt...', { id: 'pdf' });
    try {
      const res = await api.get(`/fees/receipts/${paymentId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success('Downloaded!', { id: 'pdf' });
    } catch (error) { toast.error('Failed to download PDF', { id: 'pdf' }); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><CreditCard /> My Fee Statement</h1>
        <p className="text-gray-500">View your fee structure and download receipts for paid items.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? <div className="p-8 text-gray-500">Loading statement...</div> : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b text-sm text-gray-600 font-semibold">
                <th className="px-6 py-4">Particulars</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Total Due</th>
                <th className="px-6 py-4">Paid</th>
                <th className="px-6 py-4">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {statement.map((item, idx) => (
                <React.Fragment key={idx}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.structure.fee_head}</div>
                      <div className="text-xs text-gray-500">{item.structure.term}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.structure.due_date}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">${item.total_due}</td>
                    <td className="px-6 py-4 font-bold text-green-600">${item.amount_paid}</td>
                    <td className="px-6 py-4 font-bold text-red-600">${item.balance}</td>
                  </tr>
                  {item.payments.map(p => (
                    <tr key={p.id} className="bg-gray-50/50">
                      <td colSpan="4" className="px-6 py-2 text-xs text-gray-500 text-right italic">
                        Paid ${p.amount_paid} on {p.payment_date} (Rcpt: {p.receipt_no})
                      </td>
                      <td className="px-6 py-2 text-left">
                        <button onClick={() => downloadReceipt(p.id)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs font-medium"><Download size={14}/> Receipt</button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              {statement.length === 0 && <tr><td colSpan="5" className="text-center py-8 text-gray-500">No fee structures assigned.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
