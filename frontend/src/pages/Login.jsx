import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [step, setStep] = useState(1);
  const [schoolId, setSchoolId] = useState('');
  const [schoolData, setSchoolData] = useState(null);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleVerifySchool = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.get(`/schools/verify/${schoolId}`);
      if (res.data.success) {
        setSchoolData(res.data.school);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const decoded = await login(schoolId, username, password);
      // Determine redirection based on the user role
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {step === 1 ? (
          <div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
              School ERP
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your School ID to continue
            </p>
            <form className="mt-8 space-y-6" onSubmit={handleVerifySchool}>
              {error && <div className="text-red-600 text-sm font-medium text-center bg-red-50 border border-red-200 p-3 rounded-md">{error}</div>}
              <div>
                <label htmlFor="school-id" className="sr-only">School ID</label>
                <input
                  id="school-id"
                  name="school_id"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="e.g. SCH-DEMO-001"
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Continue'}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex flex-col items-center">
              {schoolData?.logo_url ? (
                <img src={schoolData.logo_url} alt="School Logo" className="h-16 w-auto mb-4" />
              ) : (
                <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600 font-bold text-2xl uppercase shadow-sm">
                  {schoolData?.name?.charAt(0)}
                </div>
              )}
              <h2 className="text-center text-2xl font-extrabold text-gray-900">
                {schoolData?.name}
              </h2>
              <button onClick={() => setStep(1)} type="button" className="text-sm text-indigo-600 mt-2 font-medium hover:underline">
                Not your school? Change ID
              </button>
            </div>
            
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              {error && <div className="text-red-600 text-sm font-medium text-center bg-red-50 border border-red-200 p-3 rounded-md">{error}</div>}
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="username" className="sr-only">Username</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
