import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { CreditCard, Search, Download } from 'lucide-react';

export default function FeeCollect() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [statement, setStatement] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal for payment
  const [showModal, setShowModal] = useState(false);
  const [payItem, setPayItem] = useState(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');

  useEffect(() => {
    api.get('/students').then(res => setStudents(res.data.data));
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredStudents = search.length > 2 ? students.filter(s => 
    s.full_name.toLowerCase().includes(search.toLowerCase()) || 
    s.admission_no.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    setSearch('');
    fetchStatement(student.id);
  };

  const fetchStatement = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/fees/statement/${id}`);
      setStatement(res.data.data);
    } catch (err) { toast.error('Failed to load statement'); }
    setLoading(false);
  };

  const initiatePayment = (item) => {
    setPayItem(item);
    setAmountPaid(item.balance); // default to full balance
    setShowModal(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fees/collect', {
        student_id: selectedStudent.id,
        fee_structure_id: payItem.structure.id,
        amount_paid: amountPaid,
        payment_mode: paymentMode
      });
      toast.success('Payment collected successfully!');
      setShowModal(false);
      fetchStatement(selectedStudent.id);
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed'); }
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
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><CreditCard /> Collect Fees</h1>
        <p className="text-gray-500">Search student to view outstanding dues and collect payments.</p>
      </div>

      <div className="relative max-w-md mb-8 z-20">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          placeholder="Search by Name or Admission No..."
          value={search}
          onChange={handleSearch}
        />
        {filteredStudents.length > 0 && (
          <div className="absolute mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 overflow-hidden">
            {filteredStudents.map(s => (
              <div key={s.id} onClick={() => selectStudent(s)} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900">{s.full_name}</div>
                  <div className="text-xs text-gray-500">Class {s.Class?.name} | {s.admission_no}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selectedStudent.full_name}</h2>
              <p className="text-gray-500 text-sm">Admission No: {selectedStudent.admission_no} | Class {selectedStudent.Class?.name}-{selectedStudent.Class?.section}</p>
            </div>
          </div>
          
          <div className="p-0">
            {loading ? <div className="p-8 text-gray-500">Loading statement...</div> : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b text-sm text-gray-600 font-semibold">
                    <th className="px-6 py-4">Particulars</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Base Amount</th>
                    <th className="px-6 py-4">Late Fine</th>
                    <th className="px-6 py-4">Total Due</th>
                    <th className="px-6 py-4">Paid</th>
                    <th className="px-6 py-4">Balance</th>
                    <th className="px-6 py-4 text-right">Action</th>
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
                        <td className="px-6 py-4 text-gray-600">${item.structure.amount}</td>
                        <td className="px-6 py-4 text-red-500">${item.fine}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">${item.total_due}</td>
                        <td className="px-6 py-4 font-bold text-green-600">${item.amount_paid}</td>
                        <td className="px-6 py-4 font-bold text-red-600">${item.balance}</td>
                        <td className="px-6 py-4 text-right">
                          {item.balance > 0 ? (
                            <button onClick={() => initiatePayment(item)} className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-700 font-medium">Pay Now</button>
                          ) : (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">PAID</span>
                          )}
                        </td>
                      </tr>
                      {item.payments.map(p => (
                        <tr key={p.id} className="bg-gray-50/50">
                          <td colSpan="7" className="px-6 py-2 text-xs text-gray-500 text-right italic">
                            Paid ${p.amount_paid} on {p.payment_date} via {p.payment_mode} (Rcpt: {p.receipt_no})
                          </td>
                          <td className="px-6 py-2 text-right">
                            <button onClick={() => downloadReceipt(p.id)} className="text-indigo-600 hover:text-indigo-800 flex items-center justify-end gap-1 text-xs font-medium"><Download size={14}/> Receipt</button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  {statement.length === 0 && <tr><td colSpan="8" className="text-center py-8 text-gray-500">No fee structures assigned to this class.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b"><h3 className="text-xl font-bold">Collect Payment</h3></div>
            <form onSubmit={handlePayment} className="p-6 space-y-4">
              <div className="p-4 bg-indigo-50 text-indigo-900 rounded-lg text-sm border border-indigo-100">
                <strong>{payItem.structure.fee_head}</strong> - {payItem.structure.term}<br/>
                Total Balance Due: <span className="font-bold">${payItem.balance}</span>
              </div>
              <div><label className="block text-sm font-medium mb-1">Amount to Pay ($)</label><input type="number" required max={payItem.balance} value={amountPaid} onChange={e=>setAmountPaid(e.target.value)} className="w-full border rounded-lg px-3 py-2 font-bold text-lg" /></div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Mode</label>
                <select value={paymentMode} onChange={e=>setPaymentMode(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-white">
                  <option>Cash</option><option>Card</option><option>Bank Transfer</option><option>Cheque</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 transition text-white rounded-lg font-bold">Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
