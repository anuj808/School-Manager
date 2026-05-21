import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { FileText, Plus, CheckCircle, Clock } from 'lucide-react';
import Owly from '../../components/Owly';

export default function ExamList() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ exam_name: '', exam_type: 'Unit Test', class_id: '', start_date: '', end_date: '' });

  const isEditor = ['school_admin', 'principal'].includes(user.role);

  useEffect(() => {
    fetchExams();
    if(isEditor) api.get('/classes').then(res => setClasses(res.data.data));
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data.data);
    } catch (err) { toast.error('Failed to load exams'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exams', formData);
      toast.success('Exam created successfully');
      setShowModal(false);
      fetchExams();
    } catch (err) { toast.error('Failed to create exam'); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileText /> Examinations</h1>
          <p className="text-gray-500">Manage exams, term papers, and results.</p>
        </div>
        {isEditor && (
          <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm font-medium">
            <Plus size={20} /> Create Exam
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map(exam => (
          <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${exam.is_published ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                {exam.is_published ? 'PUBLISHED' : 'UPCOMING'}
              </span>
              <span className="text-sm font-semibold text-gray-500">{exam.exam_type}</span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900">{exam.exam_name}</h3>
            <p className="text-gray-600 mt-1">Class: <span className="font-semibold">{exam.Class?.name} - {exam.Class?.section}</span></p>
            
            <div className="mt-4 flex gap-4 text-sm text-gray-500 font-medium">
              <span className="flex items-center gap-1"><Clock size={16}/> {exam.start_date || 'TBD'}</span>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3 mt-auto">
              {['school_admin', 'principal', 'teacher'].includes(user.role) && !exam.is_published && (
                <Link to={`/exams/${exam.id}/marks`} className="flex-1 bg-indigo-50 text-indigo-700 text-center py-2 rounded-lg font-medium hover:bg-indigo-100 transition">
                  Enter Marks
                </Link>
              )}
              {exam.is_published && (
                <Link to={`/exams/${exam.id}/results`} className="flex-1 bg-white border border-gray-300 text-gray-700 text-center py-2 rounded-lg font-medium hover:bg-gray-50 transition">
                  View Results
                </Link>
              )}
            </div>
          </div>
        ))}
        {exams.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center py-16 text-gray-400">
            <Owly size={120} />
            <p className="mt-4 text-lg font-medium text-gray-600">No exams found</p>
            <p className="text-sm">Create your first exam to get started</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b"><h3 className="text-xl font-bold">Create New Exam</h3></div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Exam Name</label><input required value={formData.exam_name} onChange={e=>setFormData({...formData, exam_name: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Term 1 Finals" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select value={formData.exam_type} onChange={e=>setFormData({...formData, exam_type: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
                    <option>Unit Test</option><option>Quarterly</option><option>Mid-Term</option><option>Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Class</label>
                  <select required value={formData.class_id} onChange={e=>setFormData({...formData, class_id: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
                    <option value="">Select</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Start Date</label><input type="date" value={formData.start_date} onChange={e=>setFormData({...formData, start_date: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">End Date</label><input type="date" value={formData.end_date} onChange={e=>setFormData({...formData, end_date: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
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
