import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import SchoolLayout from './components/SchoolLayout';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import SchoolDetail from './pages/admin/SchoolDetail';
import StudentList from './pages/students/StudentList';
import StudentForm from './pages/students/StudentForm';
import StudentProfile from './pages/students/StudentProfile';
import ClassList from './pages/classes/ClassList';
import ClassDetail from './pages/classes/ClassDetail';
import Timetable from './pages/timetable/Timetable';
import MarkAttendance from './pages/attendance/MarkAttendance';
import AttendanceReport from './pages/attendance/AttendanceReport';
import ExamList from './pages/exams/ExamList';
import ExamMarks from './pages/exams/ExamMarks';
import ExamResults from './pages/exams/ExamResults';
import ReportCards from './pages/exams/ReportCards';
import FeeStructures from './pages/fees/FeeStructures';
import FeeCollect from './pages/fees/FeeCollect';
import PendingDues from './pages/fees/PendingDues';
import MyFees from './pages/fees/MyFees';
import StaffDirectory from './pages/hr/StaffDirectory';
import PayrollManager from './pages/hr/PayrollManager';
import LeaveManager from './pages/hr/LeaveManager';
import MyHr from './pages/hr/MyHr';

import LibraryAdmin from './pages/library/LibraryAdmin';
import TransportAdmin from './pages/transport/TransportAdmin';
import HomeworkRouter from './pages/homework/HomeworkRouter';
import MyBooks from './pages/library/MyBooks';
import MyTransport from './pages/transport/MyTransport';
import NoticeBoard from './pages/notices/NoticeBoard';
import NotificationSettings from './pages/notices/NotificationSettings';
import AdminDashboard from './pages/admin/AdminDashboard';
import TeacherDashboard from './pages/admin/TeacherDashboard';
import StudentDashboard from './pages/admin/StudentDashboard';
import AuditLogs from './pages/admin/AuditLogs';

// Simple placeholder components for dashboards
const DashboardPlaceholder = ({ title }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="font-bold text-xl text-indigo-600">{title}</div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Role: <span className="font-medium">{user?.role}</span></span>
          <button 
            onClick={handleLogout} 
            className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="p-8 flex-1">
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Welcome to your Dashboard</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">This is the dashboard placeholder. Use the sidebar on the left to navigate to the fully built modules!</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
            <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/admin/schools/:id" element={<SchoolDetail />} />
          </Route>
          
          {/* Admin & Teacher Routes */}
          <Route element={<ProtectedRoute allowedRoles={['school_admin', 'principal', 'teacher']} />}>
            <Route element={<SchoolLayout />}>
              <Route path="/school/dashboard" element={<AdminDashboard />} />
              <Route path="/principal/dashboard" element={<AdminDashboard />} />
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              
              <Route path="/students" element={<StudentList />} />
              <Route path="/students/new" element={<StudentForm />} />
              <Route path="/students/:id" element={<StudentProfile />} />
              
              <Route path="/classes" element={<ClassList />} />
              <Route path="/classes/:id" element={<ClassDetail />} />
              <Route path="/timetable" element={<Timetable />} />
              
              <Route path="/attendance/mark" element={<MarkAttendance />} />
              <Route path="/attendance/report" element={<AttendanceReport />} />
              
              <Route path="/exams" element={<ExamList />} />
              <Route path="/exams/:id/marks" element={<ExamMarks />} />
              <Route path="/exams/:id/results" element={<ExamResults />} />
              
              <Route path="/hr/staff" element={<StaffDirectory />} />
              <Route path="/hr/payroll" element={<PayrollManager />} />
              <Route path="/hr/leaves" element={<LeaveManager />} />
              
              <Route path="/hr/me" element={<MyHr />} />
            </Route>
          </Route>

          {/* Admin Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['school_admin', 'principal']} />}>
            <Route element={<SchoolLayout />}>
              <Route path="/fees/structures" element={<FeeStructures />} />
              <Route path="/fees/collect" element={<FeeCollect />} />
              <Route path="/fees/pending" element={<PendingDues />} />
              <Route path="/library" element={<LibraryAdmin />} />
              <Route path="/transport" element={<TransportAdmin />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
            </Route>
          </Route>

          {/* Student & Parent Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student', 'parent']} />}>
            <Route element={<SchoolLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/parent/dashboard" element={<StudentDashboard />} />
              
              <Route path="/my-fees" element={<MyFees />} />
              <Route path="/my-books" element={<MyBooks />} />
              <Route path="/my-transport" element={<MyTransport />} />
            </Route>
          </Route>

          {/* Globally Shared Routes (All users) */}
          <Route element={<ProtectedRoute allowedRoles={['school_admin', 'principal', 'teacher', 'student', 'parent']} />}>
            <Route element={<SchoolLayout />}>
              <Route path="/report-cards" element={<ReportCards />} />
              <Route path="/homework" element={<HomeworkRouter />} />
              <Route path="/notices" element={<NoticeBoard />} />
              <Route path="/settings/notifications" element={<NotificationSettings />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center border-t-4 border-red-500">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized</h2>
                <p className="text-gray-600 mb-6">You do not have permission to view this page.</p>
                <a href="/" className="text-indigo-600 hover:underline">Return Home</a>
              </div>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
