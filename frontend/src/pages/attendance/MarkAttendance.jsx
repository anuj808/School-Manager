import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function MarkAttendance() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { studentId: 'present'|'absent'|'late' }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/classes').then(res => setClasses(res.data.data));
  }, []);

  useEffect(() => {
    if(!selectedClassId || !date) return;
    fetchStudentsAndExisting();
  }, [selectedClassId, date]);

  const fetchStudentsAndExisting = async () => {
    try {
      const [classRes, existingRes] = await Promise.all([
        api.get(`/classes/${selectedClassId}`),
        api.get(`/attendance/${selectedClassId}/${date}`)
      ]);
      
      const classStudents = classRes.data.data.Students || [];
      const existing = existingRes.data.data || [];
      
      setStudents(classStudents);
      
      // Merge existing
      const initialMap = {};
      classStudents.forEach(s => {
        const found = existing.find(e => e.student_id === s.id);
        initialMap[s.id] = found ? found.status : '';
      });
      setAttendance(initialMap);
    } catch (err) { toast.error('Failed to load data'); }
  };

  const markAll = (status) => {
    const newAtt = {};
    students.forEach(s => newAtt[s.id] = status);
    setAttendance(newAtt);
  };

  const setStatus = (id, status) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const handleSubmit = async () => {
    // Validate all marked
    const missing = students.filter(s => !attendance[s.id]);
    if(missing.length > 0) return toast.error(`Please mark attendance for all students (${missing.length} missing)`);

    setLoading(true);
    try {
      const records = Object.keys(attendance).map(id => ({
        studentId: id,
        status: attendance[id]
      }));
      
      await api.post('/attendance/mark', { classId: selectedClassId, date, records });
      toast.success('Attendance submitted successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit'); }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Toaster position="top-right" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Calendar /> Mark Attendance</h1>
          <p className="text-gray-500">Record daily student attendance.</p>
        </div>
        <div className="flex gap-4">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 bg-white" />
          <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 bg-white min-w-[150px]">
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.id} value={c.id}>Class {c.name} - {c.section}</option>)}
          </select>
        </div>
      </div>

      {selectedClassId ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Total Students: {students.length}</span>
            <button onClick={() => markAll('present')} className="text-sm text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-md font-medium transition">Mark All Present</button>
          </div>
          
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-sm text-gray-500">
                <th className="px-6 py-4">Roll/Admission No</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-gray-600 text-sm">{s.admission_no}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{s.full_name}</td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button 
                      onClick={() => setStatus(s.id, 'present')}
                      className={`flex flex-col items-center p-2 rounded-lg border w-20 transition ${attendance[s.id] === 'present' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                    >
                      <CheckCircle size={20} className="mb-1" /> <span className="text-xs font-semibold">Present</span>
                    </button>
                    <button 
                      onClick={() => setStatus(s.id, 'absent')}
                      className={`flex flex-col items-center p-2 rounded-lg border w-20 transition ${attendance[s.id] === 'absent' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                    >
                      <XCircle size={20} className="mb-1" /> <span className="text-xs font-semibold">Absent</span>
                    </button>
                    <button 
                      onClick={() => setStatus(s.id, 'late')}
                      className={`flex flex-col items-center p-2 rounded-lg border w-20 transition ${attendance[s.id] === 'late' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                    >
                      <Clock size={20} className="mb-1" /> <span className="text-xs font-semibold">Late</span>
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && <tr><td colSpan="3" className="text-center py-8 text-gray-500">No students in this class.</td></tr>}
            </tbody>
          </table>

          {students.length > 0 && (
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button disabled={loading} onClick={handleSubmit} className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm">
                {loading ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
          Select a class to start marking attendance.
        </div>
      )}
    </div>
  );
}
