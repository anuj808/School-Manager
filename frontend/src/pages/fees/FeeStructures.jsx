import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { DollarSign, Plus } from 'lucide-react';

export default function FeeStructures() {
  const [structures, setStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ class_id: '', fee_head: '', amount: '', term: 'Term 1', due_date: '', late_fine_per_day: '0' });

  useEffect(() => {
    fetchStructures();
    api.get('/classes').then(res => setClasses(res.data.data));
  }, []);

  const fetchStructures = async () => {
    try {
      const res = await api.get('/fees/structures');
      setStructures(res.data.data);
    } catch (err) { toast.error('Failed to load structures'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fees/structures', formData);
      toast.success('Fee structure added successfully!');
      setShowModal(false);
      fetchStructures();
    } catch (err) { toast.error('Failed to add fee structure'); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><DollarSign /> Fee Structures</h1>
          <p className="text-gray-500">Manage fee heads, terms, and late fines across classes.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm font-medium">
          <Plus size={20} /> Add Fee Head
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b text-sm text-gray-600 font-semibold">
              <th className="px-6 py-4">Class</th>
              <th className="px-6 py-4">Fee Head</th>
              <th className="px-6 py-4">Term</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Late Fine (/day)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {structures.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{s.Class?.name} - {s.Class?.section}</td>
                <td className="px-6 py-4 text-gray-600">{s.fee_head}</td>
                <td className="px-6 py-4 text-gray-600">{s.term}</td>
                <td className="px-6 py-4 font-bold text-green-600">${s.amount}</td>
                <td className="px-6 py-4 text-gray-600">{s.due_date}</td>
                <td className="px-6 py-4 text-red-500">${s.late_fine_per_day}</td>
              </tr>
            ))}
            {structures.length === 0 && <tr><td colSpan="6" className="text-center py-8 text-gray-500">No fee structures created yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b"><h3 className="text-xl font-bold">Add Fee Structure</h3></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <select required value={formData.class_id} onChange={e=>setFormData({...formData, class_id: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium mb-1">Fee Head (e.g. Tuition, Transport)</label><input required value={formData.fee_head} onChange={e=>setFormData({...formData, fee_head: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Amount ($)</label><input type="number" required value={formData.amount} onChange={e=>setFormData({...formData, amount: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Term</label><input required value={formData.term} onChange={e=>setFormData({...formData, term: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Due Date</label><input type="date" required value={formData.due_date} onChange={e=>setFormData({...formData, due_date: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Late Fine/Day ($)</label><input type="number" value={formData.late_fine_per_day} onChange={e=>setFormData({...formData, late_fine_per_day: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
