import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/summary').then(res => setData(res.data.data)).catch(()=>{});
  }, []);

  if (!data) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-500">Your daily schedule and tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Clock /> Today's Timetable</h2>
          {data.timetable.length === 0 ? (
            <p className="text-gray-500 text-sm">No classes scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {data.timetable.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <div>
                    <p className="font-bold text-indigo-900">{t.subject}</p>
                    <p className="text-sm text-indigo-700">Class {t.class}</p>
                  </div>
                  <span className="px-3 py-1 bg-white text-indigo-600 rounded-full text-sm font-bold shadow-sm">{t.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-red-50 border border-red-100 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-red-800 mb-2 flex items-center gap-2"><AlertCircle /> Attendance Pending</h2>
            <p className="text-sm text-red-600 mb-4">You have classes where attendance has not been marked yet.</p>
            <Link to="/attendance/mark" className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition">Mark Attendance Now</Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Calendar /> Upcoming Homework Deadlines</h2>
            {data.homeworkDue.length === 0 ? (
              <p className="text-gray-500 text-sm">No pending homework deadlines.</p>
            ) : (
              <ul className="space-y-3">
                {data.homeworkDue.map((hw, i) => (
                  <li key={i} className="flex justify-between items-center p-3 border-b last:border-0">
                    <span className="font-medium text-gray-800">{hw.title}</span>
                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Due: {new Date(hw.due_date).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
