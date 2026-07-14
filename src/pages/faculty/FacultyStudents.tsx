import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTableQuery } from '@/hooks/useSupabaseQuery';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const FacultyStudents: React.FC = () => {
  const { data: students, isLoading } = useTableQuery('students');
  const [search, setSearch] = useState('');

  const filtered = students?.filter((s: any) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollment_number?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title text-[var(--text-primary)]">Student Directory</h1>
        <p className="page-subtitle text-[var(--text-secondary)]">Search and view student academic details</p>
      </div>

      <div className="glass-card space-y-6">
        {/* Search Input */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search by name or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input pl-10 placeholder:text-slate-500"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Querying student records...</div>
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
                </tr>
              </thead>
              <tbody>
                 {filtered?.map((s: any) => (
                  <tr key={s.id}>
                    <td className="font-bold text-[var(--text-primary)]">{s.name || '—'}</td>
                    <td className="text-[var(--text-secondary)] font-semibold">{s.email || '—'}</td>
                    <td className="text-[var(--accent-blue)] font-bold">{s.enrollment_number || '—'}</td>
                    <td className="text-[var(--text-secondary)] font-medium">{s.course}</td>
                    <td>
                      <span className="text-xs font-bold bg-[var(--bg-input)] px-2.5 py-1 rounded-md text-[var(--text-secondary)] border border-[var(--border-solid)]">
                        Year {s.year}
                      </span>
                    </td>
                    <td className="text-[var(--text-secondary)]">{s.department}</td>
                  </tr>
                ))}
                {(!filtered || filtered.length === 0) && (
                  <tr>
                    <td colSpan={6} className="text-center text-slate-500 py-12 italic">
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

export default FacultyStudents;
