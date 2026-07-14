import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTableQuery } from '@/hooks/useSupabaseQuery';
import { Bell, Calendar } from 'lucide-react';

const StudentNotices: React.FC = () => {
  const { data: notices } = useTableQuery('notices', { orderBy: { column: 'created_at' } });

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title text-[var(--text-primary)]">Campus Notices</h1>
        <p className="page-subtitle text-[var(--text-secondary)]">Announcements and official updates</p>
      </div>

      <div className="space-y-4">
        {notices?.map((n: any) => (
          <div key={n.id} className="glass-card flex items-start gap-4 hover:bg-[var(--bg-input)] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] border border-[#ddd6fe] flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-[var(--accent-blue)]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="font-bold text-[var(--text-primary)] text-base">{n.title}</h3>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  n.priority === 'urgent' ? 'badge-danger-aesthetic' :
                  n.priority === 'high' ? 'badge-warning-aesthetic' :
                  'badge-info-aesthetic'
                }`}>
                  {n.priority}
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">{n.message}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold mt-3.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(n.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
        {(!notices || notices.length === 0) && (
          <div className="glass-card text-center text-slate-500 py-12 text-sm">
            No campus notices posted yet.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentNotices;
