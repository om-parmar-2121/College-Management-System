import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTableQuery } from '@/hooks/useSupabaseQuery';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudentAttendance: React.FC = () => {
  const studentId = localStorage.getItem('studentId');
  
  const { data: attendance } = useTableQuery('attendance', {
    filters: studentId ? { student_id: studentId } : undefined
  });

  const subjectWise = React.useMemo(() => {
    if (!attendance) return [];
    const subjects: Record<string, { present: number; total: number }> = {};
    attendance.forEach((a: any) => {
      if (!subjects[a.subject]) subjects[a.subject] = { present: 0, total: 0 };
      subjects[a.subject].total++;
      if (a.status === 'present') subjects[a.subject].present++;
    });
    return Object.entries(subjects).map(([subject, { present, total }]) => ({
      subject, present, absent: total - present, percentage: Math.round((present / total) * 100),
    }));
  }, [attendance]);

  const overallPresent = attendance?.filter((a: any) => a.status === 'present').length || 0;
  const overallTotal = attendance?.length || 0;
  const overallPercentage = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title text-[var(--text-primary)]">Attendance Analytics</h1>
        <p className="page-subtitle text-[var(--text-secondary)]">View overall percentage and subject-wise logs</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div className="glass-card text-center flex flex-col justify-center py-8">
          <p className={`text-4xl font-black ${overallPercentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>{overallPercentage}%</p>
          <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mt-2">Overall Attendance</p>
        </div>
        <div className="glass-card text-center flex flex-col justify-center py-8">
          <p className="text-4xl font-black text-[var(--accent-blue)]">{overallPresent}</p>
          <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mt-2">Classes Attended</p>
        </div>
        <div className="glass-card text-center flex flex-col justify-center py-8">
          <p className="text-4xl font-black text-[var(--text-primary)]">{overallTotal}</p>
          <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mt-2">Total Classes Logged</p>
        </div>
      </div>

      {subjectWise.length > 0 && (
        <div className="space-y-6">
          {/* Chart card */}
          <div className="glass-card">
            <h3 className="font-bold text-base text-[var(--text-primary)] mb-6">Subject-wise Analytics</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={subjectWise} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-solid)" />
                <XAxis dataKey="subject" fontSize={11} stroke="var(--text-secondary)" tickLine={false} />
                <YAxis fontSize={11} stroke="var(--text-secondary)" tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-solid)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Bar dataKey="present" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} name="Present" />
                <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table list */}
          <div className="aesthetic-table-container">
            <table className="aesthetic-table">
              <thead>
                <tr>
                  <th>Subject Module</th>
                  <th>Attended</th>
                  <th>Absent</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {subjectWise.map((s) => (
                  <tr key={s.subject}>
                    <td className="font-bold text-[var(--text-primary)]">{s.subject}</td>
                    <td className="text-emerald-600 font-semibold">{s.present} lectures</td>
                    <td className="text-rose-600 font-semibold">{s.absent} lectures</td>
                    <td>
                      <span className={s.percentage >= 75 ? 'badge-success-aesthetic' : 'badge-danger-aesthetic'}>
                        {s.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subjectWise.length === 0 && (
        <div className="glass-card text-center text-slate-500 py-12 text-sm">
          No attendance logs registered in the database for your ID.
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentAttendance;
