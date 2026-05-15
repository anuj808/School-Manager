import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Users, BookOpen } from 'lucide-react';

export default function ClassDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [classData, setClassData] = useState(null);
  
  const [showSubModal, setShowSubModal] = useState(false);
  const [subForm, setSubForm] = useState({ subject_name: '', subject_code: '', max_marks: 100, passing_marks: 33 });
  
  const isEditor = ['school_admin', 'principal'].includes(user.role);

  useEffect(() => { fetchClassDetail(); }, [id]);

  const fetchClassDetail = async () => {
    try {
      const res = await api.get(`/classes/${id}`);
      setClassData(res.data.data);
    } catch (err) { toast.error('Failed to load class details'); }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/classes/${id}/subjects`, subForm);
      toast.success('Subject added');
      setShowSubModal(false);
      fetchClassDetail();
      setSubForm({ subject_name: '', subject_code: '', max_marks: 100, passing_marks: 33 });
    } catch (err) { toast.error('Failed to add subject'); }
  };

  if(!classData) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <Link to="/classes" className="inline-flex items-center gap-2 text-indigo-600 font-medium mb-6"><ArrowLeft size={20} /> Back to Classes</Link>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class {classData.name} - {classData.section}</h1>
          <p className="text-gray-500 mt-1">Class Teacher: {classData.ClassTeacher?.full_name || 'Unassigned'} • Room: {classData.room_no}</p>
        </div>
        <Link to="/timetable" className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition">View Timetable</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Students List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center gap-2 font-bold text-gray-800"><Users size={20}/> Enrolled Students ({classData.Students?.length || 0}/{classData.max_students})</div>
          <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {classData.Students?.map(s => (
              <li key={s.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <span className="font-medium">{s.full_name}</span>
                <span className="text-sm text-gray-500">{s.admission_no}</span>
              </li>
            ))}
            {!classData.Students?.length && <li className="p-6 text-center text-gray-500">No students enrolled yet.</li>}
          </ul>
        </div>

        {/* Subjects List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <div className="font-bold text-gray-800 flex items-center gap-2"><BookOpen size={20}/> Subjects</div>
            {isEditor && <button onClick={() => setShowSubModal(true)} className="text-sm text-indigo-600 font-medium hover:underline">+ Add Subject</button>}
          </div>
          <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {classData.Subjects?.map(sub => (
              <li key={sub.id} className="p-4 flex flex-col hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{sub.subject_name} <span className="text-xs text-gray-500">({sub.subject_code})</span></span>
                </div>
                <span className="text-sm text-gray-500">Teacher: {sub.SubjectTeacher?.full_name || 'Unassigned'}</span>
              </li>
            ))}
            {!classData.Subjects?.length && <li className="p-6 text-center text-gray-500">No subjects added yet.</li>}
          </ul>
        </div>
      </div>

      {showSubModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Add Subject</h3>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <div><label className="block text-sm mb-1">Subject Name</label><input required value={subForm.subject_name} onChange={e=>setSubForm({...subForm, subject_name: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm mb-1">Subject Code</label><input value={subForm.subject_code} onChange={e=>setSubForm({...subForm, subject_code: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowSubModal(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
