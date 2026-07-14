import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTableQuery } from '@/hooks/useSupabaseQuery';
import { Clock, MapPin, Landmark } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const StudentTimetable: React.FC = () => {
  const { data: timetable } = useTableQuery('timetable');

  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = timetable?.filter((t: any) => t.day_of_week === day)?.sort((a: any, b: any) => a.start_time.localeCompare(b.start_time)) || [];
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title text-[var(--text-primary)]">Class Timetable</h1>
        <p className="page-subtitle text-[var(--text-secondary)]">Your weekly academic schedule</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DAYS.map(day => {
          const classes = grouped[day];
          return (
            <div key={day} className="glass-card flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-[var(--text-primary)] mb-4 flex items-center gap-2 border-b border-[var(--border-solid)] pb-3">
                  <Clock className="w-4 h-4 text-[var(--accent-blue)]" /> {day}
                </h3>
                {classes.length > 0 ? (
                  <div className="space-y-3">
                    {classes.map((e: any) => (
                      <div key={e.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-solid)] hover:bg-[var(--bg-main)] transition-all">
                        <div>
                          <p className="font-bold text-[var(--text-primary)] text-sm">{e.subject}</p>
                          <div className="flex gap-4 mt-1.5 text-xs text-[var(--text-secondary)]">
                            <span className="flex items-center gap-1"><Landmark className="w-3.5 h-3.5" /> {e.class_name}</span>
                            {e.room && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Room {e.room}</span>}
                          </div>
                        </div>
                        <span className="text-xs font-bold bg-[#F5F3FF] text-[var(--accent-blue)] border border-[#ddd6fe] px-3 py-1 rounded-lg self-start sm:self-center">
                          {e.start_time?.slice(0,5)} - {e.end_time?.slice(0,5)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-4">No academic lectures scheduled</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default StudentTimetable;
