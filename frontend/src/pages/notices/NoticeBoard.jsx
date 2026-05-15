import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Bell, Plus, Megaphone, Calendar } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function NoticeBoard() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [classes, setClasses] = useState([]);
  
  const [form, setForm] = useState({ title: '', content: '', target_role: 'all', target_class_id: '' });

  useEffect(() => {
    fetchNotices();
    if (['school_admin', 'principal'].includes(user.role)) {
      api.get('/classes').then(res => setClasses(res.data.data)).catch(()=>{});
    }
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data.data);
    } catch (e) { toast.error('Failed to load notices'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notices', { ...form, target_class_id: form.target_class_id || null });
      toast.success('Notice published!');
      setShowModal(false);
      setForm({ title: '', content: '', target_role: 'all', target_class_id: '' });
      fetchNotices();
    } catch (e) { toast.error('Failed to publish notice'); }
  };

  const canCreate = ['school_admin', 'principal'].includes(user.role);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Megaphone /> Notice Board</h1>
          <p className="text-gray-500">Important announcements and updates.</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm font-medium">
            <Plus size={20} /> Publish Notice
          </button>
        )}
      </div>

      <div className="space-y-6">
        {notices.map(n => (
          <div key={n.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold text-gray-900">{n.title}</h2>
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                Target: {n.target_role.toUpperCase()} {n.target_class_id && `(Class)`}
              </span>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mb-4">
              <Calendar size={14}/> Published on {new Date(n.publish_date).toLocaleDateString()}
            </div>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{n.content}</p>
          </div>
        ))}
        {notices.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-700">No New Notices</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b"><h3 className="text-xl font-bold text-gray-900">Publish New Notice</h3></div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Title</label><input required value={form.title} onChange={e=>setForm({...form, title:e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Content</label><textarea required value={form.content} onChange={e=>setForm({...form, content:e.target.value})} className="w-full border rounded-lg px-3 py-2 h-32" /></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Role</label>
                  <select required value={form.target_role} onChange={e=>setForm({...form, target_role:e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
                    <option value="all">All Users</option>
                    <option value="student">Students Only</option>
                    <option value="parent">Parents Only</option>
                    <option value="teacher">Teachers Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target Class (Optional)</label>
                  <select value={form.target_class_id} onChange={e=>setForm({...form, target_class_id:e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white" disabled={['teacher', 'all'].includes(form.target_role)}>
                    <option value="">All Classes</option>
                    {classes.map(c=><option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg font-medium text-gray-700">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Publish Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
