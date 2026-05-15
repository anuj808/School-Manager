import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, FileText, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

const COLORS = ['#10b981', '#ef4444'];

export default function StudentDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/summary').then(res => setData(res.data.data)).catch(()=>{});
  }, []);

  if (!data) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  const attendanceData = [
    { name: 'Present', value: data.attendancePercent },
    { name: 'Absent', value: 100 - data.attendancePercent }
  ];

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500">Quick overview of your academics and updates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative">
          <h2 className="text-lg font-bold text-gray-800 mb-2 w-full text-left">Attendance</h2>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attendanceData} innerRadius={35} outerRadius={50} dataKey="value" startAngle={90} endAngle={-270}>
                  <Cell fill={COLORS[0]} />
                  <Cell fill={COLORS[1]} />
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute top-[60%] text-xl font-bold text-emerald-600">{data.attendancePercent}%</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><DollarSign className="text-indigo-600"/> Fee Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <p className="text-sm text-gray-500 font-medium">Pending Dues</p>
              <p className="text-3xl font-bold text-red-600">${data.feeStatus.due}</p>
            </div>
            {data.feeStatus.due > 0 && (
              <Link to="/my-fees" className="block w-full text-center bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition">Pay Now</Link>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText className="text-blue-600"/> Results</h2>
          <p className="text-sm text-gray-500 mb-4">Latest terminal examinations report card is available.</p>
          <Link to="/report-cards" className="block w-full text-center border-2 border-indigo-600 text-indigo-600 py-2 rounded-lg font-bold hover:bg-indigo-50 transition">View Report Card</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Calendar className="text-purple-600"/> Pending Homework</h2>
          {data.pendingHomework.length === 0 ? (
             <p className="text-sm text-gray-500">All caught up on homework!</p>
          ) : (
            <ul className="space-y-3">
              {data.pendingHomework.map((hw, i) => (
                <li key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-medium text-gray-800">{hw.title}</span>
                  <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">Due: {new Date(hw.due_date).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Bell className="text-orange-500"/> Recent Notices</h2>
          {data.recentNotices?.length === 0 ? (
             <p className="text-sm text-gray-500">No recent notices.</p>
          ) : (
            <ul className="space-y-3">
              {data.recentNotices?.map((n, i) => (
                <li key={i} className="p-3 border-b last:border-0">
                  <p className="font-bold text-gray-800 text-sm">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(n.publish_date).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
