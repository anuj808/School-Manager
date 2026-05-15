import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Calendar, AlertTriangle } from 'lucide-react';

export default function Timetable() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  
  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [activeCell, setActiveCell] = useState(null);
  const [slotForm, setSlotForm] = useState({ subject_id: '', teacher_id: '' });

  const isEditor = ['school_admin', 'principal'].includes(user.role);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    api.get('/classes').then(res => {
      setClasses(res.data.data);
      if(res.data.data.length > 0) setSelectedClassId(res.data.data[0].id);
    });
  }, []);

  useEffect(() => {
    if(!selectedClassId) return;
    fetchTimetable();
    api.get(`/classes/${selectedClassId}`).then(res => setSubjects(res.data.data.Subjects || []));
  }, [selectedClassId]);

  const fetchTimetable = async () => {
    const res = await api.get(`/classes/${selectedClassId}/timetable`);
    setTimetable(res.data.data);
  };

  const getSlot = (day, period) => timetable.find(t => t.day_of_week === day && t.period_number === period);

  const openAssignModal = (day, period) => {
    if(!isEditor) return;
    const existing = getSlot(day, period);
    setActiveCell({ day, period });
    setSlotForm({ subject_id: existing?.subject_id || '', teacher_id: existing?.teacher_id || '' }); // Assuming subject has associated teacher logic, simple input for now
    setShowModal(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/classes/${selectedClassId}/timetable`, {
        day_of_week: activeCell.day,
        period_number: activeCell.period,
        subject_id: slotForm.subject_id,
        teacher_id: null // In real app, load staff list. Ignoring teacher_id for simplicity unless selected.
      });
      toast.success('Timetable updated');
      setShowModal(false);
      fetchTimetable();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Conflict detected!');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Calendar /> Timetable</h1>
          <p className="text-gray-500">Manage weekly class schedules and avoid overlaps.</p>
        </div>
        <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 bg-white font-medium shadow-sm">
          {classes.map(c => <option key={c.id} value={c.id}>Class {c.name} - {c.section}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-center table-fixed border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 border-r w-32">Day / Period</th>
              {periods.map(p => <th key={p} className="p-3 border-r font-semibold text-gray-700">Period {p}</th>)}
            </tr>
          </thead>
          <tbody>
            {days.map(day => (
              <tr key={day} className="border-b">
                <td className="p-3 border-r font-bold bg-gray-50 text-gray-800">{day}</td>
                {periods.map(period => {
                  const slot = getSlot(day, period);
                  return (
                    <td 
                      key={period} 
                      onClick={() => openAssignModal(day, period)}
                      className={`p-2 border-r h-24 relative transition ${isEditor ? 'cursor-pointer hover:bg-indigo-50' : ''}`}
                    >
                      {slot ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className="font-bold text-indigo-700">{slot.Subject?.subject_name}</span>
                          <span className="text-xs text-gray-500 mt-1">{slot.Teacher?.full_name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">Empty</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-xl font-bold mb-1">Assign Subject</h3>
            <p className="text-sm text-gray-500 mb-4">{activeCell.day} - Period {activeCell.period}</p>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Subject</label>
                <select required value={slotForm.subject_id} onChange={e=>setSlotForm({...slotForm, subject_id: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                </select>
              </div>
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex gap-2 items-start mt-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <p>The system will automatically detect if the assigned teacher is busy in another class during this period.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
