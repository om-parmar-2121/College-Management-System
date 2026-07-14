import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTableQuery } from '@/hooks/useSupabaseQuery';
import { CalendarDays, BookOpen, User, ArrowDownToLine } from 'lucide-react';

const StudentAssignments: React.FC = () => {
  const { data: assignments } = useTableQuery('assignments', { orderBy: { column: 'created_at' } });

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title text-[var(--text-primary)]">Course Assignments</h1>
        <p className="page-subtitle text-[var(--text-secondary)]">Download course materials and submit by the due dates</p>
      </div>

      <div className="space-y-4">
        {assignments?.map((a: any) => (
          <div key={a.id} className="glass-card flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-[var(--bg-input)] transition-all">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] border border-[#ddd6fe] flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-5 h-5 text-[var(--accent-blue)]" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)] text-base">{a.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">{a.description}</p>
                <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Subject: {a.subject}</span>
                  <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Class: {a.class_name}</span>
                  {a.due_date && (
                    <span className="text-rose-600">
                      Due: {new Date(a.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {a.file_url && (
              <a
                href={a.file_url}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary-aesthetic self-start sm:self-center flex items-center gap-2 text-xs py-2 px-3 border border-[var(--border-solid)] hover:bg-[var(--bg-input)] text-[var(--accent-blue)]"
              >
                <ArrowDownToLine className="w-4 h-4" /> Download Material
              </a>
            )}
          </div>
        ))}
        {(!assignments || assignments.length === 0) && (
          <div className="glass-card text-center text-slate-500 py-12 text-sm">
            No coursework assignments have been posted yet.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentAssignments;
