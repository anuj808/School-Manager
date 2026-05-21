import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Users, Plus, Layers } from 'lucide-react';
import Owly from '../../components/Owly';

export default function ClassList() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', section: '', room_no: '', max_students: 40 });

  const isEditor = ['school_admin', 'principal'].includes(user.role);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data.data);
    } catch (err) { toast.error('Failed to fetch classes'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/classes', formData);
      toast.success('Class created successfully');
      setShowModal(false);
      fetchClasses();
      setFormData({ name: '', section: '', room_no: '', max_students: 40 });
    } catch (err) { toast.error('Failed to create class'); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Layers /> Class Management</h1>
          <p className="text-gray-500">Manage all academic classes and sections.</p>
        </div>
        {isEditor && (
          <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition">
            <Plus size={20} /> Add Class
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <p>Loading classes...</p> : classes.map(c => (
          <Link to={`/classes/${c.id}`} key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-indigo-50 text-indigo-700 h-14 w-14 rounded-lg flex flex-col items-center justify-center font-bold">
                <span className="text-xl leading-none">{c.name}</span>
                <span className="text-xs">{c.section}</span>
              </div>
              <span className="text-gray-400 group-hover:text-indigo-600 transition">View Details &rarr;</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Class {c.name} - {c.section}</h3>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between"><span>Teacher:</span> <span className="font-medium text-gray-900">{c.ClassTeacher?.full_name || 'Unassigned'}</span></div>
              <div className="flex justify-between"><span>Room:</span> <span className="font-medium text-gray-900">{c.room_no || '-'}</span></div>
              <div className="flex justify-between"><span>Capacity:</span> <span className="font-medium text-gray-900">{c.max_students}</span></div>
            </div>
          </Link>
        ))}
        {!loading && classes.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center py-16 text-gray-400">
            <Owly size={120} />
            <p className="mt-4 text-lg font-medium text-gray-600">No classes found</p>
            <p className="text-sm">Add your first class to get started</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b"><h3 className="text-xl font-bold">Add New Class</h3></div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Class Name</label>
                  <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. 10" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Section</label>
                  <input value={formData.section} onChange={e=>setFormData({...formData, section: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. A" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Room No</label>
                <input value={formData.room_no} onChange={e=>setFormData({...formData, room_no: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. 101" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Students</label>
                <input type="number" value={formData.max_students} onChange={e=>setFormData({...formData, max_students: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
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
