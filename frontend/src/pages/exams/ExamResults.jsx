import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, TrendingUp, Award, AlertCircle, FileCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ExamResults() {
  const { id } = useParams();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      const [examRes, marksRes] = await Promise.all([
        api.get(`/exams/${id}`),
        api.get(`/exams/${id}/results`)
      ]);
      setExam(examRes.data.data);
      setMarks(marksRes.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handlePublish = async () => {
    if(!window.confirm('Are you sure? This will generate Report Cards for all students and make them visible.')) return;
    setPublishing(true);
    try {
      // 1. Generate Report Cards
      await api.post(`/report-cards/generate/${id}/${exam.class_id}`);
      // 2. Mark exam as published
      await api.post(`/report-cards/publish/${id}`);
      toast.success('Report cards generated and published!');
      fetchResults(); // refresh
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish');
    }
    setPublishing(false);
  };

  if (loading) return <div className="p-8">Loading results...</div>;
  if (!exam) return <div className="p-8 text-red-500">Failed to load exam.</div>;

  // Aggregate Data
  const passCount = marks.filter(m => !m.is_absent && m.grade !== 'F').length;
  const failCount = marks.filter(m => m.is_absent || m.grade === 'F').length;
  const total = passCount + failCount;
  const passRate = total > 0 ? ((passCount / total) * 100).toFixed(1) : 0;

  // Average per subject
  const subjectStats = {};
  marks.forEach(m => {
    const sub = m.Subject?.subject_name;
    if(!sub) return;
    if(!subjectStats[sub]) subjectStats[sub] = { total: 0, count: 0 };
    if(!m.is_absent) {
      subjectStats[sub].total += parseFloat(m.marks_obtained);
      subjectStats[sub].count++;
    }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <Link to="/exams" className="inline-flex items-center gap-2 text-indigo-600 font-medium mb-6 hover:underline"><ArrowLeft size={20} /> Back to Exams</Link>
      
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results: {exam.exam_name}</h1>
          <p className="text-gray-500">Class {exam.Class?.name}-{exam.Class?.section}</p>
        </div>
        <div>
          {!exam.is_published && ['school_admin', 'principal'].includes(user.role) && (
            <button 
              onClick={handlePublish}
              disabled={publishing}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <FileCheck size={20} /> {publishing ? 'Publishing...' : 'Publish & Generate Report Cards'}
            </button>
          )}
          {exam.is_published && <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold">✓ Published</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-green-100 text-green-700 rounded-full"><TrendingUp size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Pass Rate</p><p className="text-2xl font-bold text-gray-900">{passRate}%</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-indigo-100 text-indigo-700 rounded-full"><Award size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Students Passed</p><p className="text-2xl font-bold text-gray-900">{passCount}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-red-100 text-red-700 rounded-full"><AlertCircle size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Students Failed</p><p className="text-2xl font-bold text-gray-900">{failCount}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 font-bold text-gray-800">Raw Mark Entries</div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-sm text-gray-500">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Marks</th>
                <th className="px-6 py-4 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {marks.map((m, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{m.Student?.full_name}</td>
                  <td className="px-6 py-4 text-gray-600">{m.Subject?.subject_name}</td>
                  <td className="px-6 py-4">
                    {m.is_absent ? <span className="text-red-500 font-medium">Absent</span> : <span>{m.marks_obtained} <span className="text-gray-400 text-xs">/ {m.max_marks}</span></span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${m.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {m.grade}
                    </span>
                  </td>
                </tr>
              ))}
              {marks.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-gray-500">No marks recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
          <div className="p-4 border-b bg-gray-50 font-bold text-gray-800">Subject Averages</div>
          <ul className="divide-y divide-gray-100">
            {Object.keys(subjectStats).map(sub => {
              const stats = subjectStats[sub];
              const avg = stats.count > 0 ? (stats.total / stats.count).toFixed(1) : 0;
              return (
                <li key={sub} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <span className="font-medium text-gray-700">{sub}</span>
                  <span className="font-bold text-indigo-600">{avg}</span>
                </li>
              )
            })}
            {Object.keys(subjectStats).length === 0 && <li className="p-6 text-center text-gray-500">No data available</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
