import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Layers, Calendar, LayoutDashboard, LogOut, CheckSquare, BarChart3, 
  FileText, CreditCard, DollarSign, AlertCircle, Briefcase, CalendarClock, 
  UserCircle, Book, Bus, PencilLine, Bell, Megaphone, Settings, Shield, 
  Menu, X, ChevronRight, GraduationCap
} from 'lucide-react';
import api from '../api/axios';

export default function SchoolLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notices, setNotices] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.get('/notices').then(res => setNotices(res.data.data)).catch(()=>{});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: `/${user.role === 'school_admin' ? 'school' : user.role}/dashboard`, icon: LayoutDashboard },
    
    // Admin, Principal, Teacher
    { name: 'Students', path: '/students', icon: Users, roles: ['school_admin', 'principal', 'teacher'] },
    { name: 'Classes & Timetable', path: '/classes', icon: Layers, roles: ['school_admin', 'principal', 'teacher'] },
    { name: 'Attendance', path: '/attendance/mark', icon: CheckSquare, roles: ['school_admin', 'principal', 'teacher'] },
    { name: 'Examinations', path: '/exams', icon: FileText, roles: ['school_admin', 'principal', 'teacher'] },
    
    // Report Cards
    { name: 'Report Cards', path: '/report-cards', icon: BarChart3, roles: ['school_admin', 'principal', 'student', 'parent'] },
    
    // Fees
    { name: 'Fee Management', path: '/fees/structures', icon: DollarSign, roles: ['school_admin', 'principal'] },
    { name: 'My Fees', path: '/my-fees', icon: CreditCard, roles: ['student', 'parent'] },
    
    // HR
    { name: 'Staff & HR', path: '/hr/staff', icon: Briefcase, roles: ['school_admin', 'principal'] },
    { name: 'My HR Portal', path: '/hr/me', icon: UserCircle, roles: ['teacher'] },
    
    // Library
    { name: 'Library', path: '/library', icon: Book, roles: ['school_admin', 'principal'] },
    { name: 'My Books', path: '/my-books', icon: Book, roles: ['student', 'parent'] },
    
    // Transport
    { name: 'Transport', path: '/transport', icon: Bus, roles: ['school_admin', 'principal'] },
    { name: 'My Transport', path: '/my-transport', icon: Bus, roles: ['student', 'parent'] },
    
    // Homework
    { name: 'Homework', path: '/homework', icon: PencilLine, roles: ['teacher', 'student', 'parent'] },
    
    // Shared
    { name: 'Notice Board', path: '/notices', icon: Megaphone },
    
    // Admin Only
    { name: 'Audit Logs', path: '/audit-logs', icon: Shield, roles: ['school_admin', 'principal'] },
    { name: 'Settings', path: '/settings/notifications', icon: Settings, roles: ['school_admin', 'principal'] }
  ];

  const allowedNavItems = navItems.filter(i => !i.roles || i.roles.includes(user.role));

  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(x => x);
    return (
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link to={`/${user.role === 'school_admin' ? 'school' : user.role}/dashboard`} className="hover:text-indigo-600">Home</Link>
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          const label = path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return (
            <React.Fragment key={path}>
              <ChevronRight size={14} className="mx-2" />
              <span className={isLast ? "text-gray-900 font-medium" : ""}>
                {isLast ? label : <Link to={`/${paths.slice(0, index + 1).join('/')}`} className="hover:text-indigo-600">{label}</Link>}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex flex-col bg-slate-900 text-white transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} z-20 shadow-xl`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0 bg-slate-950">
          <div className="flex items-center gap-3 overflow-hidden">
            <GraduationCap className="text-indigo-400 shrink-0" size={28} />
            {!isCollapsed && <span className="font-bold text-lg whitespace-nowrap tracking-tight">School ERP</span>}
          </div>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition hidden md:block">
            <Menu size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {allowedNavItems.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                title={isCollapsed ? item.name : ''}
                className={`flex items-center rounded-lg transition-all duration-200 group ${isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5 gap-3'} ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
              >
                <Icon size={20} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} /> 
                {!isCollapsed && <span className="font-medium whitespace-nowrap text-sm">{item.name}</span>}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden md:block font-bold text-gray-800 text-lg">
              Demo High School
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <Link to="/notices" className="relative text-gray-500 hover:text-indigo-600 transition p-2 rounded-full hover:bg-gray-100">
              <Bell size={20} />
              {notices.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {notices.length}
                </span>
              )}
            </Link>
            
            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
            
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="hidden md:block text-right">
                <p className="font-bold text-gray-900 text-sm leading-tight">{user?.username || 'User'}</p>
                <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">{user?.role?.replace('_', ' ')}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-inner ring-2 ring-white border border-indigo-200 group-hover:ring-indigo-100 transition uppercase">
                {(user?.username || user?.role || 'U').charAt(0)}
              </div>
            </div>

            <button onClick={handleLogout} title="Log Out" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-2 hidden md:block">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {generateBreadcrumbs()}
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom/Side Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 text-white shadow-2xl h-full slide-in-left">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3">
                <GraduationCap className="text-indigo-400" size={24} />
                <span className="font-bold text-lg">School ERP</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
              <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Navigation</p>
              {allowedNavItems.map(item => {
                const isActive = location.pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                  >
                    <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} /> 
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-950/50">
              <button onClick={handleLogout} className="flex items-center justify-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl w-full transition font-bold">
                <LogOut size={20} /> <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
