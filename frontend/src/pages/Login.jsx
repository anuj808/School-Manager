import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Loader2, Building2, UserCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import Owly from '../components/Owly';

export default function Login() {
  const [step, setStep] = useState(1);
  const [schoolId, setSchoolId] = useState('');
  const [schoolData, setSchoolData] = useState(null);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleVerifySchool = async (e) => {
    e.preventDefault();
    if (schoolId.trim().toUpperCase() === 'SUPERADMIN') {
      setIsSuperAdmin(true);
      setStep(2);
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const res = await api.get(`/schools/verify/${schoolId}`);
      if (res.data.success) {
        setSchoolData(res.data.school);
        setIsSuperAdmin(false);
        setStep(2);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('School not found. Please check your School ID.');
      } else {
        setError(err.response?.data?.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuperAdminShortcut = () => {
    setSchoolId('SUPERADMIN');
    setIsSuperAdmin(true);
    setSchoolData(null);
    setStep(2);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const decoded = await login(isSuperAdmin ? 'SUPERADMIN' : schoolId, username, password);
      const rolePaths = {
        super_admin: '/admin/dashboard',
        school_admin: '/school/dashboard',
        principal: '/principal/dashboard',
        teacher: '/teacher/dashboard',
        student: '/student/dashboard',
        parent: '/parent/dashboard'
      };
      navigate(rolePaths[decoded.role] || '/');
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Account is locked. Try again later.');
      } else if (err.response?.status === 401) {
        setError('Invalid username or password.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* Owly mascot */}
      <div className="mb-4">
        <Owly size={200} />
      </div>

      {/* App name */}
      <h1 className="text-3xl font-bold text-violet-700 mb-1">
        School ERP
      </h1>
      <p className="text-gray-500 mb-6 text-sm">
        Smart management for every school
      </p>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-white/50 transition-all duration-500">
          
          {step === 1 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-center text-xl font-bold text-gray-800 tracking-tight">
                Welcome Back
              </h2>
              <p className="mt-2 mb-6 text-center text-sm text-gray-500">
                Enter your School ID to continue
              </p>
              
              <form className="space-y-6" onSubmit={handleVerifySchool}>
                {error && (
                  <div className="text-red-600 text-sm font-medium text-center bg-red-50 border border-red-200 p-3 rounded-xl animate-in shake">
                    {error}
                  </div>
                )}
                
                <div className="relative group">
                  <label htmlFor="school-id" className="sr-only">School ID</label>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                  </div>
                  <input
                    id="school-id"
                    name="school_id"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all sm:text-sm"
                    placeholder="e.g. SCH-DEMO-001"
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-violet-500 disabled:opacity-50 transition-all hover:shadow-lg"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                    <>
                      Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="pt-6 mt-6 border-t border-gray-100 text-center">
                  <button
                    type="button"
                    onClick={handleSuperAdminShortcut}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 transition-colors group"
                  >
                    <ShieldCheck className="w-4 h-4 text-gray-400 group-hover:text-violet-500" />
                    Log in as Super Admin
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex flex-col items-center mb-8">
                {isSuperAdmin ? (
                  <div className="bg-purple-100 p-4 rounded-2xl border border-purple-200 mb-4">
                    <ShieldCheck className="w-10 h-10 text-purple-600" />
                  </div>
                ) : schoolData?.logo_url ? (
                  <img src={schoolData.logo_url} alt="School Logo" className="h-16 w-auto mb-4 rounded-xl shadow-md" />
                ) : (
                  <div className="h-16 w-16 bg-violet-100 rounded-2xl border border-violet-200 flex items-center justify-center mb-4 text-violet-600 font-bold text-3xl uppercase">
                    {schoolData?.name?.charAt(0) || 'S'}
                  </div>
                )}
                
                <h2 className="text-center text-xl font-bold text-gray-800">
                  {isSuperAdmin ? 'System Administration' : schoolData?.name}
                </h2>
                
                <button 
                  onClick={() => {
                    setStep(1);
                    setPassword('');
                  }} 
                  type="button" 
                  className="text-xs text-violet-500 mt-2 font-medium hover:text-violet-700 hover:underline transition-colors"
                >
                  {isSuperAdmin ? 'Switch to School Login' : 'Not your school? Change ID'}
                </button>
              </div>
              
              <form className="space-y-5" onSubmit={handleLogin}>
                {error && (
                  <div className="text-red-600 text-sm font-medium text-center bg-red-50 border border-red-200 p-3 rounded-xl animate-in shake">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="relative group">
                    <label htmlFor="username" className="sr-only">Username</label>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCircle2 className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all sm:text-sm"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  
                  <div className="relative group">
                    <label htmlFor="password" className="sr-only">Password</label>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="h-5 w-5 flex items-center justify-center text-gray-400 group-focus-within:text-violet-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </div>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all sm:text-sm"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <a href="#" className="text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors">
                    Forgot your password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 transition-all hover:shadow-lg ${
                    isSuperAdmin 
                      ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' 
                      : 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500'
                  }`}
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Secure Sign In'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
