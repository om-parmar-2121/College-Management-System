import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTableQuery, useTableMutation } from '@/hooks/useSupabaseQuery';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Bell, Calendar } from 'lucide-react';

const AdminNotices: React.FC = () => {
  const { data: notices, isLoading } = useTableQuery('notices', { orderBy: { column: 'created_at' } });
  const { insert, remove } = useTableMutation('notices');
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', priority: 'normal' });

  const handleCreate = async () => {
    if (!form.title || !form.message) {
      toast({ variant: 'destructive', title: 'Error', description: 'Title and message are required.' });
      return;
    }
    try {
      await insert.mutateAsync(form);
      toast({ title: 'Notice published successfully' });
      setDialogOpen(false);
      setForm({ title: '', message: '', priority: 'normal' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await remove.mutateAsync(id);
      toast({ title: 'Notice deleted successfully' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title text-[var(--text-primary)]">Campus Notices</h1>
          <p className="page-subtitle text-[var(--text-secondary)]">Publish announcements, alerts, and official campus updates</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="btn-primary-aesthetic flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> New Notice
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[var(--bg-card)] border border-[var(--border-solid)] text-[var(--text-primary)] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Bell className="w-5 h-5 text-[var(--accent-blue)]" /> Publish Campus Notice
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-3">
              <div>
                <Label className="text-[var(--text-secondary)]">Notice Title</Label>
                <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="glass-input mt-1.5" placeholder="e.g. End Semester Exam Schedule" />
              </div>
              <div>
                <Label className="text-[var(--text-secondary)]">Announcement Details</Label>
                <Textarea rows={5} value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} className="glass-input mt-1.5 min-h-[100px]" placeholder="Type notice content here..." />
              </div>
              <div>
                <Label className="text-[var(--text-secondary)]">Notice Priority</Label>
                <select
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-solid)] rounded-md px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] outline-none mt-1.5"
                  value={form.priority}
                  onChange={(e) => setForm({...form, priority: e.target.value})}
                >
                  <option value="low" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Low Priority</option>
                  <option value="normal" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Normal Priority</option>
                  <option value="high" className="bg-[var(--bg-card)] text-[var(--text-primary)]">High Priority</option>
                  <option value="urgent" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Urgent Priority</option>
                </select>
              </div>
              <button onClick={handleCreate} className="btn-primary-aesthetic w-full mt-2">
                Publish Notice
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading announcements...</div>
        ) : (
          notices?.map((notice: any) => (
            <div key={notice.id} className="glass-card flex items-start gap-4 hover:bg-[var(--bg-input)] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] border border-[#ddd6fe] flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-[var(--accent-blue)]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center flex-wrap gap-2">
                  <h3 className="font-bold text-[var(--text-primary)] text-base">{notice.title}</h3>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    notice.priority === 'urgent' ? 'badge-danger-aesthetic' :
                    notice.priority === 'high' ? 'badge-warning-aesthetic' :
                    'badge-info-aesthetic'
                  }`}>
                    {notice.priority}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">{notice.message}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold mt-3.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(notice.created_at).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(notice.id)}
                className="text-rose-600 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition-colors self-start"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
        {(!notices || notices.length === 0) && !isLoading && (
          <div className="glass-card text-center text-slate-500 py-12 text-sm">
            No campus notices posted yet.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminNotices;
