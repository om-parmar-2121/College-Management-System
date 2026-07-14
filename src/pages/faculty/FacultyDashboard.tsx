import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTableQuery } from '@/hooks/useSupabaseQuery';
import { ClipboardList, BookOpen, CalendarDays, Users } from 'lucide-react';

const FacultyDashboard: React.FC = () => {
  const { data: faculty } = useTableQuery('faculty');
  const { data: students } = useTableQuery('students');
  const { data: attendance } = useTableQuery('attendance');
  const { data: assignments } = useTableQuery('assignments');

  const stats = [
    { label: 'Total Students', value: students?.length || 0, icon: Users, color: 'bg-violet-50 border-violet-100 text-violet-600' },
    { label: 'Attendance Records', value: attendance?.length || 0, icon: ClipboardList, color: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
    { label: 'Assignments', value: assignments?.length || 0, icon: CalendarDays, color: 'bg-amber-50 border-amber-100 text-amber-600' },
    { label: 'Faculty Members', value: faculty?.length || 0, icon: BookOpen, color: 'bg-sky-50 border-sky-100 text-sky-600' },
  ];

  return (
    <DashboardLayout>
      {/* Flat Welcome Banner */}
      <div className="relative overflow-hidden rounded-lg bg-[#F5F3FF] p-8 border border-[#ddd6fe]">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--accent-blue)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Faculty <span className="text-[var(--text-primary)]">Dashboard</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Manage student attendance logs, input exam results, post assignments, and oversee class timetables for your subjects.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div key={s.label} className={`glass-card border ${s.color} flex items-center justify-between`}>
            <div>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{s.label}</p>
              <p className="text-3xl font-black mt-2 tracking-tight text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>{s.value}</p>
            </div>
            <div className="w-12 h-12 rounded bg-[var(--bg-card)] border border-[var(--border-solid)] flex items-center justify-center">
              <s.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;
