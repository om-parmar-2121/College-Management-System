import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTableQuery } from '@/hooks/useSupabaseQuery';
import { ClipboardList, BookOpen, CalendarDays, Bell } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const studentId = localStorage.getItem('studentId');
  
  const { data: students } = useTableQuery('students', {
    filters: studentId ? { id: studentId } : undefined
  });
  
  const { data: notices } = useTableQuery('notices', { 
    limit: 3, 
    orderBy: { column: 'created_at' } 
  });

  const student = students?.[0] as any;

  return (
    <DashboardLayout>
      {/* Flat Welcome Banner */}
      <div className="relative overflow-hidden rounded-lg bg-[#F5F3FF] p-8 border border-[#ddd6fe]">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--accent-blue)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Welcome back, <span className="text-[var(--text-primary)]">{student?.name || 'Student'}</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {student ? `${student.course} — Year ${student.year} — Department of ${student.department}` : 'Access your class timetable, grades, attendance logs, and download assignments.'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Student ID', value: student?.enrollment_number || '—', icon: ClipboardList, color: 'bg-violet-50 border-violet-100 text-violet-600' },
          { label: 'Course Program', value: student?.course || '—', icon: BookOpen, color: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
          { label: 'Current Year', value: student?.year ? `Year ${student.year}` : '—', icon: CalendarDays, color: 'bg-amber-50 border-amber-100 text-amber-600' },
          { label: 'Active Notices', value: notices?.length || 0, icon: Bell, color: 'bg-sky-50 border-sky-100 text-sky-600' },
        ].map((s) => (
          <div key={s.label} className={`glass-card border ${s.color} flex items-center justify-between`}>
            <div>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-black mt-2 tracking-tight text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>{s.value}</p>
            </div>
            <div className="w-12 h-12 rounded bg-[var(--bg-card)] border border-[var(--border-solid)] flex items-center justify-center">
              <s.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Notices */}
      <div className="glass-card">
        <h3 className="font-bold text-base text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[var(--accent-blue)]" /> Recent notices
        </h3>
        {notices && notices.length > 0 ? (
          <div className="space-y-4">
            {notices.map((n: any) => (
              <div key={n.id} className="p-4 rounded bg-[var(--bg-input)] border border-[var(--border-solid)] hover:border-[var(--border-hover)] transition-colors">
                <p className="text-sm font-bold text-[var(--text-primary)]">{n.title}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 py-4 text-center">No notices posted recently</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
