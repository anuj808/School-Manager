import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BarChart3, Download } from 'lucide-react';

export default function AttendanceReport() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/classes').then(res => setClasses(res.data.data));
  }, []);

  useEffect(() => {
    fetchReport();
  }, [month, selectedClass]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const [year, m] = month.split('-');
      const res = await api.get(`/attendance/report?year=${year}&month=${m}&classId=${selectedClass}`);
      setReportData(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><BarChart3 /> Monthly Attendance Report</h1>
          <p className="text-gray-500">View aggregated monthly attendance statistics.</p>
        </div>
        <div className="flex gap-4">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 bg-white" />
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 bg-white min-w-[150px]">
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>Class {c.name} - {c.section}</option>)}
          </select>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b text-sm text-gray-600 font-semibold">
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Class</th>
              <th className="px-6 py-4 text-center">Present</th>
              <th className="px-6 py-4 text-center">Absent</th>
              <th className="px-6 py-4 text-center">Late</th>
              <th className="px-6 py-4 text-center">Total %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-12">Loading report...</td></tr>
            ) : reportData.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-12 text-gray-500">No attendance data found for this month.</td></tr>
            ) : (
              reportData.map((row, i) => {
                const total = row.present + row.absent + row.late;
                const perc = total > 0 ? ((row.present / total) * 100).toFixed(1) : 0;
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.name}</td>
                    <td className="px-6 py-4 text-gray-600">{row.class}</td>
                    <td className="px-6 py-4 text-center font-medium text-green-600">{row.present}</td>
                    <td className="px-6 py-4 text-center font-medium text-red-600">{row.absent}</td>
                    <td className="px-6 py-4 text-center font-medium text-amber-600">{row.late}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${perc >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {perc}%
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
