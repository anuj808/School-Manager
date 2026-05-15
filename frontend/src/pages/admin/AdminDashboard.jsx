import React, { useState, useEffect } from 'react';
import { Users, BookOpen, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

const COLORS = ['#4f46e5', '#f59e0b', '#ef4444', '#10b981'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/summary').then(res => setData(res.data.data)).catch(()=>{});
  }, []);

  if (!data) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500">School performance metrics and quick actions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-indigo-100 p-4 rounded-full text-indigo-600"><Users size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Total Students</p><p className="text-2xl font-bold text-gray-900">{data.kpis.totalStudents}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600"><BookOpen size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Total Teachers</p><p className="text-2xl font-bold text-gray-900">{data.kpis.totalTeachers}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-full text-green-600"><Calendar size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Today's Attendance</p><p className="text-2xl font-bold text-gray-900">{data.kpis.attendancePercent}%</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-600"><DollarSign size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Fees Collected</p><p className="text-2xl font-bold text-gray-900">${data.kpis.feeCollected}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Weekly Attendance Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="percent" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Fee Collection Status</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.charts.feeData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {data.charts.feeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/students/new" className="p-4 border rounded-xl text-center hover:bg-indigo-50 hover:border-indigo-200 transition font-medium text-indigo-700">Add New Student</Link>
            <Link to="/attendance/mark" className="p-4 border rounded-xl text-center hover:bg-indigo-50 hover:border-indigo-200 transition font-medium text-indigo-700">Mark Attendance</Link>
            <Link to="/notices" className="p-4 border rounded-xl text-center hover:bg-indigo-50 hover:border-indigo-200 transition font-medium text-indigo-700">Send Notice</Link>
            <Link to="/fees/collect" className="p-4 border rounded-xl text-center hover:bg-indigo-50 hover:border-indigo-200 transition font-medium text-indigo-700">Collect Fee</Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><AlertCircle className="text-red-500"/> Action Required</h2>
          <ul className="space-y-4">
            <li className="flex justify-between items-center p-3 bg-red-50 rounded-lg text-red-700 font-medium">
              <span>Absent 3+ Days</span>
              <span className="bg-red-200 px-2 py-1 rounded-full text-xs">View Report</span>
            </li>
            <li className="flex justify-between items-center p-3 bg-orange-50 rounded-lg text-orange-700 font-medium">
              <span>Pending Leaves</span>
              <span className="bg-orange-200 px-2 py-1 rounded-full text-xs">{data.kpis.pendingLeaves} pending</span>
            </li>
            <li className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg text-indigo-700 font-medium">
              <span>Active Notices</span>
              <span className="bg-indigo-200 px-2 py-1 rounded-full text-xs">{data.kpis.activeNotices} active</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
