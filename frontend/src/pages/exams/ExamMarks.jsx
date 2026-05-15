import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Edit3, Save } from 'lucide-react';

export default function ExamMarks() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [subjectId, setSubjectId] = useState('');
  
  const [records, setRecords] = useState({}); // { studentId: { marks_obtained: 0, is_absent: false } }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExam();
  }, [id]);

  const fetchExam = async () => {
    try {
      const res = await api.get(`/exams/${id}`);
      const data = res.data.data;
      setExam(data);
      if(data.Class?.Subjects?.length > 0) setSubjectId(data.Class.Subjects[0].id);
      
      // Initialize records
      const initial = {};
      data.Class?.Students?.forEach(s => {
        initial[s.id] = { marks_obtained: '', is_absent: false };
      });
      setRecords(initial);
    } catch (err) { toast.error('Failed to load exam details'); }
  };

  const handleUpdate = (studentId, field, value) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = Object.keys(records).map(sId => ({
        studentId: sId,
        marks_obtained: records[sId].marks_obtained,
        is_absent: records[sId].is_absent
      }));

      await api.post('/exams/marks/bulk', { examId: id, subjectId, records: payload });
      toast.success('Marks saved successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save marks'); }
    setLoading(false);
  };

  if(!exam) return <div className="p-8">Loading...</div>;

  const currentSubject = exam.Class?.Subjects?.find(s => s.id === parseInt(subjectId));

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Toaster position="top-right" />
      <Link to="/exams" className="inline-flex items-center gap-2 text-indigo-600 font-medium mb-6 hover:underline"><ArrowLeft size={20} /> Back to Exams</Link>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Edit3 /> Enter Marks: {exam.exam_name}</h1>
          <p className="text-gray-500">Class {exam.Class?.name}-{exam.Class?.section}</p>
        </div>
        <div className="flex gap-4">
          <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 bg-white font-medium shadow-sm">
            <option value="">Select Subject</option>
            {exam.Class?.Subjects?.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
          </select>
        </div>
      </div>

      {subjectId ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Max Marks: {currentSubject?.max_marks || 100}</span>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-sm text-gray-500">
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4 w-48 text-center">Marks Obtained</th>
                <th className="px-6 py-4 w-32 text-center">Absent?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {exam.Class?.Students?.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{s.full_name}</div>
                    <div className="text-xs text-gray-500 font-mono">{s.admission_no}</div>
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number" 
                      min="0"
                      max={currentSubject?.max_marks || 100}
                      disabled={records[s.id]?.is_absent}
                      value={records[s.id]?.marks_obtained || ''}
                      onChange={e => handleUpdate(s.id, 'marks_obtained', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-indigo-500"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={records[s.id]?.is_absent || false}
                      onChange={e => handleUpdate(s.id, 'is_absent', e.target.checked)}
                      className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
                    />
                  </td>
                </tr>
              ))}
              {exam.Class?.Students?.length === 0 && <tr><td colSpan="3" className="text-center py-8 text-gray-500">No students enrolled.</td></tr>}
            </tbody>
          </table>
          <div className="p-6 border-t bg-gray-50 flex justify-end">
             <button disabled={loading} onClick={handleSubmit} className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm flex items-center gap-2">
               {loading ? 'Saving...' : <><Save size={20}/> Save Marks</>}
             </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
          Please select a subject to enter marks.
        </div>
      )}
    </div>
  );
}
