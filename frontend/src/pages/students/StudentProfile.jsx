import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { User, BookOpen, CreditCard, Activity, ArrowLeft } from 'lucide-react';

export default function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProfile();
    fetchSummary();
  }, [id]);

  const fetchProfile = async () => {
    const res = await api.get(`/students/${id}`);
    setStudent(res.data.data);
  };

  const fetchSummary = async () => {
    const res = await api.get(`/students/${id}/summary`);
    setSummary(res.data.data);
  };

  if (!student) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link to="/students" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-6 transition">
        <ArrowLeft size={20} /> Back to Directory
      </Link>
      
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
        <div className="h-32 w-32 rounded-full bg-indigo-100 flex items-center justify-center text-4xl text-indigo-700 font-bold shadow-inner">
          {student.full_name.charAt(0)}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">{student.full_name}</h1>
          <div className="text-gray-500 mt-1 flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium">
            <span>Admission No: <span className="text-gray-800">{student.admission_no}</span></span>
            <span>Class: <span className="text-gray-800">{student.Class ? `${student.Class.name} - ${student.Class.section}` : 'Unassigned'}</span></span>
            <span>Status: <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{student.status.toUpperCase()}</span></span>
          </div>
          
          <div className="mt-6 flex gap-4 border-b border-gray-200">
            <button onClick={() => setActiveTab('overview')} className={`pb-3 px-4 font-semibold text-sm transition ${activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}>Overview</button>
            <button onClick={() => setActiveTab('attendance')} className={`pb-3 px-4 font-semibold text-sm transition ${activeTab === 'attendance' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}>Attendance</button>
            <button onClick={() => setActiveTab('fees')} className={`pb-3 px-4 font-semibold text-sm transition ${activeTab === 'fees' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}>Fees</button>
            <button onClick={() => setActiveTab('results')} className={`pb-3 px-4 font-semibold text-sm transition ${activeTab === 'results' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}>Results</button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><User className="text-indigo-600" size={20}/> Personal Details</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between"><span className="text-gray-500">Date of Birth</span> <span className="font-medium text-gray-900">{student.dob}</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Gender</span> <span className="font-medium text-gray-900">{student.gender}</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Blood Group</span> <span className="font-medium text-gray-900">{student.blood_group || '-'}</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Date of Admission</span> <span className="font-medium text-gray-900">{student.admission_date}</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Address</span> <span className="font-medium text-gray-900 text-right max-w-[200px]">{student.address}</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><User className="text-indigo-600" size={20}/> Parent Details</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between"><span className="text-gray-500">Father's Name</span> <span className="font-medium text-gray-900">{student.ParentInfo?.father_name}</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Mother's Name</span> <span className="font-medium text-gray-900">{student.ParentInfo?.mother_name}</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Phone</span> <span className="font-medium text-gray-900">{student.ParentInfo?.phone}</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Email</span> <span className="font-medium text-gray-900">{student.ParentInfo?.email}</span></li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
             <Activity size={48} className="text-indigo-300 mb-4" />
             <h3 className="text-2xl font-bold text-gray-800">Attendance: {summary?.attendance_percentage}%</h3>
             <p className="text-gray-500 mt-2">Attendance module detailed view coming soon.</p>
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
             <CreditCard size={48} className="text-emerald-300 mb-4" />
             <h3 className="text-2xl font-bold text-gray-800">Fee Status: {summary?.fee_status}</h3>
             <p className="text-gray-500 mt-2">Payments and invoices view coming soon.</p>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
             <BookOpen size={48} className="text-amber-300 mb-4" />
             <h3 className="text-2xl font-bold text-gray-800">Latest Result: {summary?.latest_result}</h3>
             <p className="text-gray-500 mt-2">Report cards and exam marks view coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
