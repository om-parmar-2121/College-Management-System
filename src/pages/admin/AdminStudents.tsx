import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTableQuery, useTableMutation } from '@/hooks/useSupabaseQuery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Trash2, GraduationCap } from 'lucide-react';
import { BulkImportDialog } from '@/components/BulkImportDialog';

const AdminStudents: React.FC = () => {
  const { data: students, isLoading } = useTableQuery('students');
  const { insert, remove } = useTableMutation('students');
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', course: '', year: '1', department: '', enrollment_number: '' });

  const filteredStudents = students?.filter((s: any) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollment_number?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.enrollment_number) {
      toast({ variant: 'destructive', title: 'Error', description: 'Name, email, and enrollment ID are required.' });
      return;
    }
    try {
      await insert.mutateAsync({
        name: form.name, email: form.email, course: form.course,
        year: parseInt(form.year), department: form.department,
        enrollment_number: form.enrollment_number,
      });
      toast({ title: 'Student added successfully' });
      setDialogOpen(false);
      setForm({ name: '', email: '', course: '', year: '1', department: '', enrollment_number: '' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student record? This will also remove their user account.')) return;
    try {
      await remove.mutateAsync(id);
      toast({ title: 'Student deleted successfully' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title text-[var(--text-primary)]">Student Directory</h1>
          <p className="page-subtitle text-[var(--text-secondary)]">Manage student profiles and credential access</p>
        </div>
        <div className="flex items-center gap-3">
          <BulkImportDialog
            tableName="students"
            onInsertRow={async (row) => {
              await insert.mutateAsync({
                name: row.name,
                email: row.email,
                enrollment_number: row.enrollment_number,
                course: row.course,
                year: row.year ? parseInt(row.year) : 1,
                department: row.department,
              });
            }}
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="btn-primary-aesthetic flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> Add Student
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[var(--bg-card)] border border-[var(--border-solid)] text-[var(--text-primary)] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[var(--accent-blue)]" /> Register New Student
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-3">
              <div>
                <Label className="text-[var(--text-secondary)]">Full Name</Label>
                <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="glass-input mt-1.5" placeholder="Peter Parker" />
              </div>
              <div>
                <Label className="text-[var(--text-secondary)]">Email Address</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="glass-input mt-1.5" placeholder="student@college.com" />
              </div>
              <div>
                <Label className="text-[var(--text-secondary)]">Enrollment ID</Label>
                <Input value={form.enrollment_number} onChange={(e) => setForm({...form, enrollment_number: e.target.value})} className="glass-input mt-1.5" placeholder="ENR2026001" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[var(--text-secondary)]">Course</Label>
                  <Input value={form.course} onChange={(e) => setForm({...form, course: e.target.value})} className="glass-input mt-1.5" placeholder="B.Tech" />
                </div>
                <div>
                  <Label className="text-[var(--text-secondary)]">Current Year</Label>
                  <Input type="number" min="1" max="6" value={form.year} onChange={(e) => setForm({...form, year: e.target.value})} className="glass-input mt-1.5" />
                </div>
              </div>
              <div>
                <Label className="text-[var(--text-secondary)]">Department</Label>
                <Input value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} className="glass-input mt-1.5" placeholder="Computer Science" />
              </div>
              <p className="text-[10px] text-slate-500 italic mt-1">
                Note: Creating a student profile automatically generates their User login account with default password: <b>student123</b>
              </p>
              <button onClick={handleCreate} className="btn-primary-aesthetic w-full mt-2">
                Create Profile
              </button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="glass-card space-y-6">
        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search by name, ID or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input pl-10 focus:border-blue-500/80 focus:ring-blue-500/50 placeholder:text-slate-500"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Querying database records...</div>
        ) : (
          <div className="aesthetic-table-container">
            <table className="aesthetic-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email Address</th>
                  <th>Enrollment ID</th>
                  <th>Course</th>
                  <th>Year</th>
                  <th>Department</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents?.map((s: any) => (
                  <tr key={s.id}>
                    <td className="font-bold text-[var(--text-primary)]">{s.name || '—'}</td>
                    <td className="text-[var(--text-secondary)] font-semibold">{s.email || '—'}</td>
                    <td className="text-[var(--accent-blue)] font-bold">{s.enrollment_number || '—'}</td>
                    <td className="text-[var(--text-secondary)] font-medium">{s.course || '—'}</td>
                    <td>
                      <span className="text-xs font-bold bg-[var(--bg-input)] px-2.5 py-1 rounded-md text-[var(--text-secondary)] border border-[var(--border-solid)]">
                        Year {s.year}
                      </span>
                    </td>
                    <td className="text-[var(--text-secondary)]">{s.department || '—'}</td>
                    <td className="text-center">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-rose-600 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!filteredStudents || filteredStudents.length === 0) && (
                  <tr>
                    <td colSpan={7} className="text-center text-slate-500 py-12 italic">
                      No matching student profiles found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminStudents;
