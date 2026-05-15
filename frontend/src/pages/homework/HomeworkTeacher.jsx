import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PencilLine, Plus, Users, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function HomeworkTeacher() {
  const [homeworks, setHomeworks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [hwForm, setHwForm] = useState({ class_id: '', subject_id: '', title: '', description: '', due_date: '' });

  const [viewSubmissions, setViewSubmissions] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);

  useEffect(() => {
    fetchHomeworks();
    api.get('/classes').then(res => setClasses(res.data.data));
  }, []);

  const fetchHomeworks = async () => {
    try { const res = await api.get('/homework'); setHomeworks(res.data.data); } catch (e) {}
  };

  const handleClassChange = async (e) => {
    const cid = e.target.value;
    setHwForm({...hwForm, class_id: cid, subject_id: ''});
    if(cid) {
      const clsRes = await api.get(`/classes/${cid}`);
      setSubjects(clsRes.data.data.Subjects || []);
    } else { setSubjects([]); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/homework', hwForm);
      toast.success('Homework assigned successfully!');
      setShowModal(false);
      fetchHomeworks();
    } catch (e) { toast.error('Failed to create homework'); }
  };

  const openSubmissions = async (hw) => {
    try {
      const res = await api.get(`/homework/${hw.id}/submissions`);
      setSubmissionsList(res.data.data);
      setViewSubmissions(hw);
    } catch (e) { toast.error('Failed to load submissions'); }
  };

  if (viewSubmissions) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <button onClick={()=>setViewSubmissions(null)} className="text-indigo-600 hover:underline font-bold mb-4">← Back to Homework List</button>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{viewSubmissions.title}</h2>
          <p className="text-gray-600 mb-4">{viewSubmissions.description}</p>
          <div className="flex gap-4 text-sm font-medium text-gray-500">
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded">Class: {viewSubmissions.Class?.name}</span>
            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded">Subject: {viewSubmissions.Subject?.subject_name}</span>
          </div>
        </div>
        
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Users /> Student Submissions ({submissionsList.length})</h3>
        <div className="space-y-4">
          {submissionsList.map(sub => (
            <div key={sub.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-3 border-b pb-2">
                <span className="font-bold text-gray-900">{sub.Student?.full_name} <span className="text-gray-400 text-xs font-mono ml-2">({sub.Student?.admission_no})</span></span>
                <span className="text-xs text-gray-500">Submitted at: {new Date(sub.submitted_at).toLocaleString()}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-800 font-mono whitespace-pre-wrap">{sub.feedback}</div>
            </div>
          ))}
          {submissionsList.length === 0 && <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-dashed">No submissions yet for this homework.</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><PencilLine /> Manage Homework</h1>
          <p className="text-gray-500">Create assignments and review student submissions.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm font-medium">
          <Plus size={20} /> Assign Homework
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {homeworks.map(hw => (
          <div key={hw.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full">{hw.Class?.name}-{hw.Class?.section}</span>
              <span className="text-xs font-bold text-gray-500">{hw.Subject?.subject_name}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{hw.title}</h3>
            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{hw.description}</p>
            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs font-bold text-red-500">Due: {hw.due_date}</span>
              <button onClick={()=>openSubmissions(hw)} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1">View Submissions →</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b"><h3 className="text-xl font-bold text-gray-900">Create New Homework</h3></div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Class</label>
                  <select required value={hwForm.class_id} onChange={handleClassChange} className="w-full border rounded-lg px-3 py-2 bg-white">
                    <option value="">Select Class</option>
                    {classes.map(c=><option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <select required value={hwForm.subject_id} onChange={e=>setHwForm({...hwForm, subject_id:e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white" disabled={!hwForm.class_id}>
                    <option value="">Select Subject</option>
                    {subjects.map(s=><option key={s.id} value={s.id}>{s.subject_name}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Title</label><input required value={hwForm.title} onChange={e=>setHwForm({...hwForm, title:e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Description / Instructions</label><textarea required value={hwForm.description} onChange={e=>setHwForm({...hwForm, description:e.target.value})} className="w-full border rounded-lg px-3 py-2 h-24" /></div>
              <div><label className="block text-sm font-medium mb-1">Due Date</label><input type="date" required value={hwForm.due_date} onChange={e=>setHwForm({...hwForm, due_date:e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg font-medium text-gray-700">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Assign Homework</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
