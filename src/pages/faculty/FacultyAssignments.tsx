import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTableQuery, useTableMutation } from '@/hooks/useSupabaseQuery';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, CalendarDays, BookOpen, Users, Clock } from 'lucide-react';

const FacultyAssignments: React.FC = () => {
  const { data: assignments, isLoading } = useTableQuery('assignments', { orderBy: { column: 'created_at' } });
  const { insert, remove } = useTableMutation('assignments');
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subject: '', due_date: '', class_name: '' });

  const handleCreate = async () => {
    if (!form.title || !form.subject || !form.class_name) {
      toast({ variant: 'destructive', title: 'Error', description: 'Title, subject, and class name are required.' });
      return;
    }
    try {
      await insert.mutateAsync(form);
      toast({ title: 'Coursework assignment published successfully' });
      setDialogOpen(false);
      setForm({ title: '', description: '', subject: '', due_date: '', class_name: '' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await remove.mutateAsync(id);
      toast({ title: 'Assignment deleted successfully' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title text-[var(--text-primary)]">Coursework Assignments</h1>
          <p className="page-subtitle text-[var(--text-secondary)]">Post assignments, materials, and deadlines for your modules</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="btn-primary-aesthetic flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> New Assignment
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[var(--bg-card)] border border-[var(--border-solid)] text-[var(--text-primary)] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[var(--accent-blue)]" /> Publish Assignment
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-3">
              <div>
                <Label className="text-[var(--text-secondary)]">Assignment Title</Label>
                <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="glass-input mt-1.5" placeholder="e.g. Graph Algorithms Programming" />
              </div>
              <div>
                <Label className="text-[var(--text-secondary)]">Task Description & Instructions</Label>
                <Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="glass-input mt-1.5 min-h-[80px]" placeholder="Provide details, rules, or link to files..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[var(--text-secondary)]">Subject Module</Label>
                  <Input value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className="glass-input mt-1.5" placeholder="e.g. Algorithms" />
                </div>
                <div>
                  <Label className="text-[var(--text-secondary)]">Target Class</Label>
                  <Input value={form.class_name} onChange={(e) => setForm({...form, class_name: e.target.value})} className="glass-input mt-1.5" placeholder="e.g. CS-3A" />
                </div>
              </div>
              <div>
                <Label className="text-[var(--text-secondary)]">Deadline Date</Label>
                <Input type="date" value={form.due_date} onChange={(e) => setForm({...form, due_date: e.target.value})} className="glass-input mt-1.5" />
              </div>
              <button onClick={handleCreate} className="btn-primary-aesthetic w-full mt-2">
                Publish Assignment
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Querying database...</div>
        ) : (
          assignments?.map((a: any) => (
            <div key={a.id} className="glass-card flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-[var(--bg-input)] transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] border border-[#ddd6fe] flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-5 h-5 text-[var(--accent-blue)]" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] text-base">{a.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">{a.description}</p>
                  <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500 font-semibold">
                    <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Subject: {a.subject}</span>
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Class: {a.class_name}</span>
                    {a.due_date && (
                      <span className="flex items-center gap-1.5 text-rose-600">
                        <Clock className="w-3.5 h-3.5" /> Due: {new Date(a.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(a.id)}
                className="text-rose-600 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all self-start sm:self-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
        {(!assignments || assignments.length === 0) && !isLoading && (
          <div className="glass-card text-center text-slate-500 py-12 text-sm">
            No coursework assignments posted yet.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FacultyAssignments;
