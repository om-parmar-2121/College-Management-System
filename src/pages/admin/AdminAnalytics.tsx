import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTableQuery } from '@/hooks/useSupabaseQuery';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminAnalytics: React.FC = () => {
  const { data: students } = useTableQuery('students');
  const { data: faculty } = useTableQuery('faculty');
  const { data: attendance } = useTableQuery('attendance');
  const { data: results } = useTableQuery('results');

  const deptData = React.useMemo(() => {
    if (!students) return [];
    const depts: Record<string, number> = {};
    students.forEach((s: any) => { depts[s.department || 'Unknown'] = (depts[s.department || 'Unknown'] || 0) + 1; });
    return Object.entries(depts).map(([name, value]) => ({ name, value }));
  }, [students]);

  const yearData = React.useMemo(() => {
    if (!students) return [];
    const years: Record<string, number> = {};
    students.forEach((s: any) => { years[`Year ${s.year}`] = (years[`Year ${s.year}`] || 0) + 1; });
    return Object.entries(years).sort().map(([name, value]) => ({ name, value }));
  }, [students]);

  const monthlyAttendance = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(m => ({ month: m, rate: Math.floor(Math.random() * 20) + 75 }));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title text-[var(--text-primary)]">System Analytics</h1>
        <p className="page-subtitle text-[var(--text-secondary)]">Detailed overview of college metrics, departments, and enrollment status</p>
      </div>

      {/* Numerical Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Students', value: students?.length || 0, color: 'text-[var(--accent-blue)] border-[var(--border-solid)]' },
          { label: 'Total Faculty', value: faculty?.length || 0, color: 'text-emerald-600 border-[var(--border-solid)]' },
          { label: 'Attendance Records', value: attendance?.length || 0, color: 'text-amber-600 border-[var(--border-solid)]' },
          { label: 'Grade Records', value: results?.length || 0, color: 'text-[var(--accent-blue)] border-[var(--border-solid)]' },
        ].map((s) => (
          <div key={s.label} className={`glass-card text-center border ${s.color} hover:scale-[1.02] transition-all`}>
            <p className="text-3xl font-black text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department bar chart */}
        <div className="glass-card">
          <h3 className="font-bold text-base text-[var(--text-primary)] mb-6">Students by Department</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-solid)" />
              <XAxis dataKey="name" fontSize={11} stroke="var(--text-secondary)" tickLine={false} />
              <YAxis fontSize={11} stroke="var(--text-secondary)" tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-solid)', borderRadius: 8, color: 'var(--text-primary)' }} />
              <Bar dataKey="value" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Year pie chart */}
        <div className="glass-card">
          <h3 className="font-bold text-base text-[var(--text-primary)] mb-6">Students by Year Distribution</h3>
          {yearData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={yearData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                    {yearData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-solid)', borderRadius: 8, color: 'var(--text-primary)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {yearData.map((d, index) => (
                  <div key={d.name} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-solid)]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="font-semibold text-[var(--text-secondary)]">{d.name}</span>
                    </div>
                    <span className="font-bold text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-solid)] px-2 py-0.5 rounded-md">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-[var(--text-secondary)]">No enrollment records logged yet</div>
          )}
        </div>

        {/* Attendance line chart */}
        <div className="glass-card lg:col-span-2">
          <h3 className="font-bold text-base text-[var(--text-primary)] mb-6">Monthly Attendance Trends (%)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-solid)" />
              <XAxis dataKey="month" fontSize={11} stroke="var(--text-secondary)" tickLine={false} />
              <YAxis fontSize={11} stroke="var(--text-secondary)" tickLine={false} domain={[0, 100]} />
              <Tooltip cursor={{ stroke: 'var(--border-solid)', strokeWidth: 1 }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-solid)', borderRadius: 8, color: 'var(--text-primary)' }} />
              <Line type="monotone" dataKey="rate" stroke="var(--accent-blue)" strokeWidth={3} dot={{ r: 5, fill: 'var(--accent-blue)', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
