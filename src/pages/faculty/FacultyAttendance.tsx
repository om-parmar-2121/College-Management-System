import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTableQuery, useTableMutation } from '@/hooks/useSupabaseQuery';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Calendar, BookOpen, Search, Eye, ClipboardList } from 'lucide-react';

const FacultyAttendance: React.FC = () => {
  const { data: students, isLoading: isStudentsLoading } = useTableQuery('students');
  const { data: attendanceLogs, isLoading: isLogsLoading } = useTableQuery('attendance');
  const { insert } = useTableMutation('attendance');
  const { toast } = useToast();

  // Mark attendance state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tabs and History filters state
  const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');
  const [filterDate, setFilterDate] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  const toggleStatus = (studentId: string) => {
    setStatuses(prev => ({ 
      ...prev, 
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present' 
    }));
  };

  const handleSubmit = async () => {
    if (!subject.trim()) { 
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a subject name.' }); 
      return; 
    }
    const entries = Object.entries(statuses);
    if (entries.length === 0) { 
      toast({ variant: 'destructive', title: 'Error', description: 'Please mark attendance for at least one student.' }); 
      return; 
    }
    
    setIsSubmitting(true);
    try {
      for (const [studentId, status] of entries) {
        await insert.mutateAsync({ student_id: studentId, subject, date, status });
      }
      toast({ title: `Attendance submitted for ${entries.length} students` });
      setStatuses({});
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const markAll = (status: string) => {
    const all: Record<string, string> = {};
    students?.forEach((s: any) => { all[s.id] = status; });
    setStatuses(all);
  };

  // Filter logs based on date/subject filters
  const filteredLogs = React.useMemo(() => {
    if (!attendanceLogs) return [];
    return attendanceLogs.filter((log: any) => {
      const matchSubject = !filterSubject.trim() || 
        log.subject?.toLowerCase().includes(filterSubject.toLowerCase().trim());
      
      const matchDate = !filterDate || 
        (log.date && log.date.split('T')[0] === filterDate);
        
      return matchSubject && matchDate;
    }).map((log: any) => {
      const student = students?.find((s: any) => s.id === log.student_id);
      return {
        ...log,
        studentName: student?.name || '—',
        studentEnrollment: student?.enrollment_number || '—',
        studentDept: student?.department || '—'
      };
    });
  }, [attendanceLogs, students, filterSubject, filterDate]);

  // Statistics for history logs
  const stats = React.useMemo(() => {
    const total = filteredLogs.length;
    if (total === 0) return { total: 0, present: 0, absent: 0, percent: 0 };
    
    const present = filteredLogs.filter((l: any) => String(l.status).toLowerCase() === 'present').length;
    const absent = total - present;
    const percent = Math.round((present / total) * 100);
    
    return { total, present, absent, percent };
  }, [filteredLogs]);

  return (
    <DashboardLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title text-[var(--text-primary)]">Student Attendance</h1>
          <p className="page-subtitle text-[var(--text-secondary)]">Log new attendance records or review history by date and subject</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[var(--bg-input)] rounded-md p-1 mb-6 border border-[var(--border-solid)] max-w-xs">
        <button
          onClick={() => setActiveTab('mark')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-none ${
            activeTab === 'mark' ? 'bg-[var(--accent-blue)] text-[var(--bg-main)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Mark Attendance
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-none ${
            activeTab === 'history' ? 'bg-[var(--accent-blue)] text-[var(--bg-main)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Attendance History
        </button>
      </div>

      {activeTab === 'mark' ? (
        <>
          {/* Mark Attendance Controls */}
          <div className="glass-card mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
              <div>
                <Label className="text-[var(--text-secondary)] flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-4 h-4 text-[var(--accent-blue)]" /> Subject Module
                </Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Mathematics" className="glass-input" />
              </div>
              <div>
                <Label className="text-[var(--text-secondary)] flex items-center gap-1.5 mb-2">
                  <Calendar className="w-4 h-4 text-[var(--accent-blue)]" /> Attendance Date
                </Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="glass-input" />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => markAll('present')}
                  className="btn-secondary-aesthetic flex-1 text-xs py-2 px-3 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                >
                  All Present
                </button>
                <button
                  onClick={() => markAll('absent')}
                  className="btn-secondary-aesthetic flex-1 text-xs py-2 px-3 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
                >
                  All Absent
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card">
            {isStudentsLoading ? (
              <div className="text-center py-12 text-slate-400 text-sm">Querying database...</div>
            ) : (
              <div className="aesthetic-table-container">
                <table className="aesthetic-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Department</th>
                      <th>Academic Year</th>
                      <th>Attendance status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students?.map((s: any) => (
                      <tr key={s.id}>
                        <td className="font-bold text-[var(--text-primary)]">{s.name || '—'}</td>
                        <td className="text-[var(--text-secondary)] font-semibold">{s.department}</td>
                        <td className="text-[var(--text-secondary)]">Year {s.year}</td>
                        <td>
                          <button
                            onClick={() => toggleStatus(s.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                              statuses[s.id] === 'present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              statuses[s.id] === 'absent' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)] border border-[var(--border-solid)]'
                            }`}
                          >
                            {statuses[s.id] === 'present' ? <Check className="w-3.5 h-3.5" /> : statuses[s.id] === 'absent' ? <X className="w-3.5 h-3.5" /> : null}
                            {statuses[s.id] === 'present' ? 'Present' : statuses[s.id] === 'absent' ? 'Absent' : 'Not Marked'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!students || students.length === 0) && (
                      <tr>
                        <td colSpan={4} className="text-center text-slate-500 py-12 italic">
                          No students found in directory
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {students && students.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-primary-aesthetic px-6 py-2.5 text-sm"
                >
                  {isSubmitting ? 'Submitting logs...' : 'Submit Attendance Logs'}
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* History Filters */}
          <div className="glass-card mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label className="text-[var(--text-secondary)] flex items-center gap-1.5 mb-2">
                  <Search className="w-4 h-4 text-[var(--accent-blue)]" /> Filter by Subject
                </Label>
                <Input 
                  value={filterSubject} 
                  onChange={(e) => setFilterSubject(e.target.value)} 
                  placeholder="e.g. Mathematics" 
                  className="glass-input" 
                />
              </div>
              <div>
                <Label className="text-[var(--text-secondary)] flex items-center gap-1.5 mb-2">
                  <Calendar className="w-4 h-4 text-[var(--accent-blue)]" /> Filter by Date
                </Label>
                <Input 
                  type="date" 
                  value={filterDate} 
                  onChange={(e) => setFilterDate(e.target.value)} 
                  className="glass-input" 
                />
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-solid)] rounded-lg p-4 text-center">
              <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Total Logs</p>
              <p className="text-2xl font-black mt-1 text-[var(--text-primary)]">{stats.total}</p>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-solid)] rounded-lg p-4 text-center">
              <p className="text-[10px] uppercase font-bold text-emerald-600">Present</p>
              <p className="text-2xl font-black mt-1 text-emerald-600">{stats.present}</p>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-solid)] rounded-lg p-4 text-center">
              <p className="text-[10px] uppercase font-bold text-rose-600">Absent</p>
              <p className="text-2xl font-black mt-1 text-rose-600">{stats.absent}</p>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-solid)] rounded-lg p-4 text-center">
              <p className="text-[10px] uppercase font-bold text-[var(--accent-blue)]">Ratio %</p>
              <p className="text-2xl font-black mt-1 text-[var(--accent-blue)]">{stats.percent}%</p>
            </div>
          </div>

          {/* History Logs Table */}
          <div className="glass-card">
            {isLogsLoading || isStudentsLoading ? (
              <div className="text-center py-12 text-slate-400 text-sm">Querying database...</div>
            ) : (
              <div className="aesthetic-table-container">
                <table className="aesthetic-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Enrollment ID</th>
                      <th>Department</th>
                      <th>Subject Module</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log: any) => (
                      <tr key={log.id}>
                        <td className="font-bold text-[var(--text-primary)]">{log.studentName}</td>
                        <td className="text-[var(--accent-blue)] font-bold">{log.studentEnrollment}</td>
                        <td className="text-[var(--text-secondary)] font-semibold">{log.studentDept}</td>
                        <td className="text-[var(--text-secondary)]">{log.subject}</td>
                        <td className="text-[var(--text-secondary)]">{log.date ? log.date.split('T')[0] : '—'}</td>
                        <td>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                            String(log.status).toLowerCase() === 'present' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {String(log.status).toLowerCase() === 'present' ? 'Present' : 'Absent'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-slate-500 py-12 italic">
                          No matching attendance records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default FacultyAttendance;
