import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, GraduationCap, CalendarDays,
  ClipboardList, Bell, BookOpen, BarChart3, Menu, X, LogOut, User as UserIcon
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Students', path: '/admin/students', icon: GraduationCap },
  { label: 'Faculty', path: '/admin/faculty', icon: UserCheck },
  { label: 'Notices', path: '/admin/notices', icon: Bell },
  { label: 'Timetable', path: '/admin/timetable', icon: CalendarDays },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
];

const facultyNav: NavItem[] = [
  { label: 'Dashboard', path: '/faculty', icon: LayoutDashboard },
  { label: 'Attendance', path: '/faculty/attendance', icon: ClipboardList },
  { label: 'Results', path: '/faculty/results', icon: BookOpen },
  { label: 'Assignments', path: '/faculty/assignments', icon: CalendarDays },
  { label: 'Students', path: '/faculty/students', icon: GraduationCap },
];

const studentNav: NavItem[] = [
  { label: 'Dashboard', path: '/student', icon: LayoutDashboard },
  { label: 'Attendance', path: '/student/attendance', icon: ClipboardList },
  { label: 'Results', path: '/student/results', icon: BookOpen },
  { label: 'Timetable', path: '/student/timetable', icon: CalendarDays },
  { label: 'Notices', path: '/student/notices', icon: Bell },
  { label: 'Assignments', path: '/student/assignments', icon: CalendarDays },
];

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userRole = (localStorage.getItem('role') || 'student') as 'admin' | 'faculty' | 'student';
  const userName = localStorage.getItem('name') || 'Guest User';
  const userEmail = localStorage.getItem('email') || '';

  const activeNav = userRole === 'admin' ? adminNav : userRole === 'faculty' ? facultyNav : studentNav;
  const currentSection = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  const handleSignOut = async () => {
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });
    } catch {
      // Continue with logout even if API call fails
    }
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-[var(--bg-main)]/80 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col
        bg-[var(--bg-sidebar)] border-r border-[var(--border-solid)]
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-[var(--border-solid)]">
          <div className="w-10 h-10 rounded bg-[var(--accent-blue)] flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-extrabold text-base tracking-tight text-[var(--text-primary)]">
              College CMS
            </p>
            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Academic Portal</p>
          </div>
          <button className="ml-auto lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)]" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-8 px-4 space-y-6 overflow-y-auto">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] px-3 mb-3">{currentSection} Space</p>
            <div className="space-y-1">
              {activeNav.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold relative
                      ${isActive
                        ? 'bg-[#F5F3FF] text-[var(--accent-blue)] border border-[#ddd6fe]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)] border border-transparent'
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[var(--accent-blue)] rounded" />
                    )}
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[var(--accent-blue)]' : 'text-[var(--text-secondary)]'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer profile panel */}
        <div className="p-4 border-t border-[var(--border-solid)] bg-[var(--bg-sidebar)]">
          <div className="flex items-center gap-3.5 mb-4 px-2.5">
            <div className="w-10 h-10 rounded bg-[var(--bg-input)] border border-[var(--border-solid)] flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-[var(--accent-blue)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">{userName}</p>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold truncate capitalize">{userRole} account</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:text-rose-500 bg-[var(--bg-input)] hover:bg-rose-50 border border-[var(--border-solid)] hover:border-rose-200 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main container */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[var(--bg-main)]">
          {/* Mobile top bar (only visible on mobile to toggle sidebar) */}
          <div className="flex items-center justify-between lg:hidden mb-6">
            <button className="p-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-solid)] hover:bg-[var(--bg-main)]" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-[var(--text-primary)]" />
            </button>
          </div>

          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
