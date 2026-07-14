import React from 'react';
import { useTableQuery } from '@/hooks/useSupabaseQuery';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { UserCheck, GraduationCap, Bell, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#7BB8FF', '#10b981', '#f59e0b', '#ef4444', '#B8A9FF'];

const AdminDashboard: React.FC = () => {
  const { data: students } = useTableQuery('students');
  const { data: faculty } = useTableQuery('faculty');
  const { data: notices } = useTableQuery('notices', { limit: 5, orderBy: { column: 'created_at' } });
  const { data: attendance } = useTableQuery('attendance');

  const stats = [
    { label: 'Total Students', value: students?.length || 0, icon: GraduationCap, color: 'bg-violet-50 border-violet-100 text-violet-600' },
    { label: 'Total Faculty', value: faculty?.length || 0, icon: UserCheck, color: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
    { label: 'Active Notices', value: notices?.length || 0, icon: Bell, color: 'bg-amber-50 border-amber-100 text-amber-600' },
    { label: 'Attendance Logs', value: attendance?.length || 0, icon: TrendingUp, color: 'bg-sky-50 border-sky-100 text-sky-600' },
  ];

  const deptData = React.useMemo(() => {
    if (!students) return [];
    const depts: Record<string, number> = {};
    students.forEach((s: any) => { depts[s.department || 'Unknown'] = (depts[s.department || 'Unknown'] || 0) + 1; });
    return Object.entries(depts).map(([name, value]) => ({ name, value }));
  }, [students]);

  const attendanceData = React.useMemo(() => {
    if (!attendance || attendance.length === 0) {
      return [
        { day: 'Mon', present: 0, absent: 0 },
        { day: 'Tue', present: 0, absent: 0 },
        { day: 'Wed', present: 0, absent: 0 },
        { day: 'Thu', present: 0, absent: 0 },
        { day: 'Fri', present: 0, absent: 0 },
      ];
    }

    const daysMap: Record<number, { present: number; absent: number }> = {
      1: { present: 0, absent: 0 }, // Monday
      2: { present: 0, absent: 0 }, // Tuesday
      3: { present: 0, absent: 0 }, // Wednesday
      4: { present: 0, absent: 0 }, // Thursday
      5: { present: 0, absent: 0 }, // Friday
    };

    attendance.forEach((att: any) => {
      if (!att.date) return;
      const dateObj = new Date(att.date);
      const day = dateObj.getUTCDay(); // 0 is Sunday, 1 is Monday, ..., 5 is Friday
      if (day >= 1 && day <= 5) {
        const status = String(att.status).toLowerCase();
        if (status === 'present') {
          daysMap[day].present += 1;
        } else if (status === 'absent') {
          daysMap[day].absent += 1;
        }
      }
    });

    return [
      { day: 'Mon', present: daysMap[1].present, absent: daysMap[1].absent },
      { day: 'Tue', present: daysMap[2].present, absent: daysMap[2].absent },
      { day: 'Wed', present: daysMap[3].present, absent: daysMap[3].absent },
      { day: 'Thu', present: daysMap[4].present, absent: daysMap[4].absent },
      { day: 'Fri', present: daysMap[5].present, absent: daysMap[5].absent },
    ];
  }, [attendance]);

  return (
    <DashboardLayout>
      {/* Flat Banner */}
      <div className="relative overflow-hidden rounded-lg bg-white p-8 border border-[#ddd6fe]">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--accent-blue)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Welcome back, <span className="text-[var(--text-primary)]">Administrator</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Monitor admissions, faculty records, student progress, scheduling, and overall academic status of your institution.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className={`glass-card border ${stat.color} flex items-center justify-between`}>
            <div>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-black mt-2 tracking-tight text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>{stat.value}</p>
            </div>
            <div className="w-12 h-12 rounded bg-[var(--bg-card)] border border-[var(--border-solid)] flex items-center justify-center">
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-base text-[var(--text-primary)] tracking-wide">Weekly Attendance Summary</h3>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] bg-[var(--bg-input)] border border-[var(--border-solid)] px-3 py-1 rounded">
              Live Chart
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-solid)" />
              <XAxis dataKey="day" fontSize={11} stroke="var(--text-secondary)" tickLine={false} />
              <YAxis fontSize={11} stroke="var(--text-secondary)" tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-solid)', borderRadius: 8, color: 'var(--text-primary)' }} />
              <Bar dataKey="present" fill="var(--accent-blue)" radius={0} name="Present" />
              <Bar dataKey="absent" fill="#ef4444" radius={0} name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-[var(--text-primary)] tracking-wide">Students by Department</h3>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] bg-[var(--bg-input)] border border-[var(--border-solid)] px-3 py-1 rounded">
              Distribution
            </span>
          </div>
          {deptData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={deptData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} dataKey="value" stroke="none">
                    {deptData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-solid)', borderRadius: 8, color: 'var(--text-primary)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5">
                {deptData.map((d, index) => (
                  <div key={d.name} className="flex items-center justify-between text-xs p-2 rounded bg-[var(--bg-input)] border border-[var(--border-solid)]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="font-semibold text-[var(--text-primary)]">{d.name}</span>
                    </div>
                    <span className="font-bold text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-solid)] px-2 py-0.5 rounded">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-[var(--text-secondary)]">No student records created yet</div>
          )}
        </div>
      </div>

      {/* Notices */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-base text-[var(--text-primary)] tracking-wide flex items-center gap-2">
            <Bell className="w-5 h-5 text-[var(--accent-blue)]" /> Recent Campus Notices
          </h3>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent-blue)] bg-[#F5F3FF] border border-[#ddd6fe] px-3 py-1 rounded">
            Announcements
          </span>
        </div>
        {notices && notices.length > 0 ? (
          <div className="space-y-4">
            {notices.map((notice: any) => (
              <div key={notice.id} className="flex items-start gap-4 p-4 rounded bg-[var(--bg-card)] border border-[var(--border-solid)] hover:border-[var(--border-hover)] transition-colors">
                <div className="w-8 h-8 rounded bg-[var(--bg-input)] flex items-center justify-center flex-shrink-0 border border-[var(--border-solid)]">
                  <Bell className="w-4 h-4 text-[var(--accent-blue)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">{notice.title}</p>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                      notice.priority === 'urgent' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                      notice.priority === 'high' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                      'bg-violet-50 text-violet-600 border border-violet-100'
                    }`}>
                      {notice.priority}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">{notice.message}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-2">{new Date(notice.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--text-secondary)] text-sm">No notices posted yet</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
