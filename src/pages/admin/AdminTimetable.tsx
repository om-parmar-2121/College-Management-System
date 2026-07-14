import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTableQuery, useTableMutation } from '@/hooks/useSupabaseQuery';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Clock, MapPin, Landmark } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AdminTimetable: React.FC = () => {
  const { data: timetable, isLoading } = useTableQuery('timetable', { orderBy: { column: 'day_of_week', ascending: true } });
  const { insert, remove } = useTableMutation('timetable');
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ class_name: '', subject: '', day_of_week: 'Monday', start_time: '09:00', end_time: '10:00', room: '' });

  const handleCreate = async () => {
    if (!form.class_name || !form.subject || !form.start_time || !form.end_time) {
      toast({ variant: 'destructive', title: 'Error', description: 'Class, subject, and start/end times are required.' });
      return;
    }
    try {
      await insert.mutateAsync(form);
      toast({ title: 'Timetable entry added successfully' });
      setDialogOpen(false);
      setForm({ class_name: '', subject: '', day_of_week: 'Monday', start_time: '09:00', end_time: '10:00', room: '' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this timetable entry?')) return;
    try {
      await remove.mutateAsync(id);
      toast({ title: 'Timetable entry deleted' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = timetable?.filter((t: any) => t.day_of_week === day) || [];
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <DashboardLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title text-[var(--text-primary)]">Class Schedules</h1>
          <p className="page-subtitle text-[var(--text-secondary)]">Configure timetables, lecture hours, and room assignments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="btn-primary-aesthetic flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Schedule
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[var(--bg-card)] border border-[var(--border-solid)] text-[var(--text-primary)] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--accent-blue)]" /> Create Timetable Entry
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-3">
              <div>
                <Label className="text-[var(--text-secondary)]">Class Name / Section</Label>
                <Input value={form.class_name} onChange={(e) => setForm({...form, class_name: e.target.value})} className="glass-input mt-1.5" placeholder="e.g. CS-3A" />
              </div>
              <div>
                <Label className="text-[var(--text-secondary)]">Subject Module</Label>
                <Input value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className="glass-input mt-1.5" placeholder="e.g. Database Systems" />
              </div>
              <div>
                <Label className="text-[var(--text-secondary)]">Day of the Week</Label>
                <select
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-solid)] rounded-md px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] outline-none mt-1.5"
                  value={form.day_of_week}
                  onChange={(e) => setForm({...form, day_of_week: e.target.value})}
                >
                  {DAYS.map(d => <option key={d} value={d} className="bg-[var(--bg-card)] text-[var(--text-primary)]">{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[var(--text-secondary)]">Start Time</Label>
                  <Input type="time" value={form.start_time} onChange={(e) => setForm({...form, start_time: e.target.value})} className="glass-input mt-1.5" />
                </div>
                <div>
                  <Label className="text-[var(--text-secondary)]">End Time</Label>
                  <Input type="time" value={form.end_time} onChange={(e) => setForm({...form, end_time: e.target.value})} className="glass-input mt-1.5" />
                </div>
              </div>
              <div>
                <Label className="text-[var(--text-secondary)]">Classroom Number</Label>
                <Input value={form.room} onChange={(e) => setForm({...form, room: e.target.value})} className="glass-input mt-1.5" placeholder="e.g. Lab-4 or Room-202" />
              </div>
              <button onClick={handleCreate} className="btn-primary-aesthetic w-full mt-2">
                Add Schedule Entry
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DAYS.map(day => (
          <div key={day} className="glass-card flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)] mb-4 flex items-center gap-2 border-b border-[var(--border-solid)] pb-3">
                <Clock className="w-4 h-4 text-[var(--accent-blue)]" /> {day}
              </h3>
              {isLoading ? (
                <div className="text-xs text-slate-500 py-4">Querying database...</div>
              ) : grouped[day].length > 0 ? (
                <div className="space-y-3">
                  {grouped[day].map((entry: any) => (
                    <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-solid)] hover:bg-[var(--bg-main)] transition-all group">
                      <div>
                        <p className="font-bold text-[var(--text-primary)] text-sm">{entry.subject}</p>
                        <div className="flex gap-4 mt-1.5 text-xs text-[var(--text-secondary)]">
                          <span className="flex items-center gap-1"><Landmark className="w-3.5 h-3.5" /> {entry.class_name}</span>
                          {entry.room && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Room {entry.room}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-start sm:self-center">
                        <span className="text-xs font-bold bg-[#F5F3FF] text-[var(--accent-blue)] border border-[#ddd6fe] px-3 py-1 rounded-lg">
                          {entry.start_time?.slice(0,5)} - {entry.end_time?.slice(0,5)}
                        </span>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-4">No classes scheduled</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminTimetable;
