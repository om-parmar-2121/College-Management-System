import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTableQuery, useTableMutation } from '@/hooks/useSupabaseQuery';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Trash2, UserCheck } from 'lucide-react';
import { BulkImportDialog } from '@/components/BulkImportDialog';

const AdminFaculty: React.FC = () => {
  const { data: faculty, isLoading } = useTableQuery('faculty');
  const { insert, remove } = useTableMutation('faculty');
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', department: '', qualification: '', employee_id: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filtered = faculty?.filter((f: any) =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.subject?.toLowerCase().includes(search.toLowerCase()) ||
    f.department?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil((filtered?.length || 0) / itemsPerPage);
  const paginatedFaculty = filtered?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.employee_id) {
      toast({ variant: 'destructive', title: 'Error', description: 'Name, email, and Employee ID are required.' });
      return;
    }
    try {
      await insert.mutateAsync(form);
      toast({ title: 'Faculty profile added successfully' });
      setDialogOpen(false);
      setForm({ name: '', email: '', subject: '', department: '', qualification: '', employee_id: '' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this faculty member? This will also remove their user account.')) return;
    try {
      await remove.mutateAsync(id);
      toast({ title: 'Faculty profile deleted successfully' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title text-[var(--text-primary)]">Faculty Directory</h1>
          <p className="page-subtitle text-[var(--text-secondary)]">Add and manage faculty details and subject assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <BulkImportDialog
            tableName="faculty"
            onInsertRow={async (row) => {
              await insert.mutateAsync({
                name: row.name,
                email: row.email,
                employee_id: row.employee_id,
                subject: row.subject,
                department: row.department,
                qualification: row.qualification,
              });
            }}
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="btn-primary-aesthetic flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> Add Faculty
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[var(--bg-card)] border border-[var(--border-solid)] text-[var(--text-primary)] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[var(--accent-blue)]" /> Register Faculty Member
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-3">
              <div>
                <Label className="text-[var(--text-secondary)]">Full Name</Label>
                <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="glass-input mt-1.5" placeholder="Prof. Charles Xavier" />
              </div>
              <div>
                <Label className="text-[var(--text-secondary)]">Email Address</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="glass-input mt-1.5" placeholder="faculty@college.com" />
              </div>
              <div>
                <Label className="text-[var(--text-secondary)]">Employee ID</Label>
                <Input value={form.employee_id} onChange={(e) => setForm({...form, employee_id: e.target.value})} className="glass-input mt-1.5" placeholder="EMP1001" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[var(--text-secondary)]">Primary Subject</Label>
                  <Input value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className="glass-input mt-1.5" placeholder="Data Structures" />
                </div>
                <div>
                  <Label className="text-[var(--text-secondary)]">Department</Label>
                  <Input value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} className="glass-input mt-1.5" placeholder="Computer Science" />
                </div>
              </div>
              <div>
                <Label className="text-[var(--text-secondary)]">Highest Qualification</Label>
                <Input value={form.qualification} onChange={(e) => setForm({...form, qualification: e.target.value})} className="glass-input mt-1.5" placeholder="Ph.D. in Computer Science" />
              </div>
              <p className="text-[10px] text-slate-500 italic mt-1">
                Note: Creating a faculty profile automatically generates their User login account with default password: <b>faculty123</b>
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
        {/* Search & Pagination Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search by name, subject, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input pl-10 placeholder:text-slate-500"
            />
          </div>

          {/* Pagination Controls */}
          {!isLoading && filtered && filtered.length > 0 && (
            <div className="flex items-center flex-wrap gap-3">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                Showing <strong className="text-[var(--text-primary)]">{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)}</strong> of <strong className="text-[var(--text-primary)]">{filtered.length}</strong>
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 ${
                        currentPage === page
                          ? "bg-[var(--accent-blue)] text-white scale-105"
                          : "bg-[var(--bg-input)] text-[var(--accent-blue)] hover:bg-[var(--border-solid)] hover:text-[var(--text-primary)] border border-[var(--border-solid)]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Querying database records...</div>
        ) : (
          <div className="aesthetic-table-container">
            <table className="aesthetic-table">
              <thead>
                <tr>
                  <th>Faculty Member</th>
                  <th>Email Address</th>
                  <th>Employee ID</th>
                  <th>Teaches Subject</th>
                  <th>Department</th>
                  <th>Qualification</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFaculty.map((f: any) => (
                  <tr key={f.id}>
                    <td className="font-bold text-[var(--text-primary)]">{f.name || '—'}</td>
                    <td className="text-[var(--text-secondary)] font-semibold">{f.email || '—'}</td>
                    <td className="text-[var(--accent-blue)] font-bold">{f.employee_id || '—'}</td>
                    <td className="text-[var(--text-secondary)] font-medium">{f.subject || '—'}</td>
                    <td className="text-[var(--text-secondary)]">{f.department || '—'}</td>
                    <td className="text-[var(--text-secondary)] italic">{f.qualification || '—'}</td>
                    <td className="text-center">
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="text-rose-600 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!filtered || filtered.length === 0) && (
                  <tr>
                    <td colSpan={7} className="text-center text-slate-500 py-12 italic">
                      No matching faculty profiles found
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

export default AdminFaculty;
