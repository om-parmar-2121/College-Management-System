import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTableQuery } from '@/hooks/useSupabaseQuery';

const StudentResults: React.FC = () => {
  const studentId = localStorage.getItem('studentId');
  
  const { data: results } = useTableQuery('results', {
    filters: studentId ? { student_id: studentId } : undefined
  });
  
  const { data: students } = useTableQuery('students', {
    filters: studentId ? { id: studentId } : undefined
  });

  const student = students?.[0] as any;

  const totalMarks = results?.reduce((sum: number, r: any) => sum + r.marks_obtained, 0) || 0;
  const totalMax = results?.reduce((sum: number, r: any) => sum + r.total_marks, 0) || 0;
  const overallPercentage = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title text-[var(--text-primary)]">Academic Report</h1>
        <p className="page-subtitle text-[var(--text-secondary)]">View midterm and end-term exam results</p>
      </div>

      {results && results.length > 0 ? (
        <div className="glass-card space-y-6">
          <div className="text-center border-b border-[var(--border-solid)] pb-6">
            <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
              Statement of Marks
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-1">College Management Portal</p>
            {student && (
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-4 text-xs text-[var(--text-secondary)]">
                <span><strong>Name:</strong> {student.name}</span>
                <span><strong>Enrollment:</strong> {student.enrollment_number}</span>
                <span><strong>Course:</strong> {student.course} — Year {student.year}</span>
              </div>
            )}
          </div>

          <div className="aesthetic-table-container">
            <table className="aesthetic-table">
              <thead>
                <tr>
                  <th>Subject Module</th>
                  <th>Exam Type</th>
                  <th>Obtained Marks</th>
                  <th>Total Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r: any) => {
                  const pct = Math.round((r.marks_obtained / r.total_marks) * 100);
                  const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F';
                  return (
                    <tr key={r.id}>
                      <td className="font-bold text-[var(--text-primary)]">{r.subject}</td>
                      <td className="capitalize font-semibold text-[var(--text-secondary)]">{r.exam_type}</td>
                      <td className="text-[var(--text-primary)] font-bold">{r.marks_obtained}</td>
                      <td className="text-[var(--text-secondary)]">{r.total_marks}</td>
                      <td>
                        <span className={pct >= 50 ? 'badge-success-aesthetic' : 'badge-danger-aesthetic'}>
                          {pct}%
                        </span>
                      </td>
                      <td className="font-extrabold text-[var(--text-primary)]">{grade}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-[var(--bg-input)]">
                  <td colSpan={2} className="text-[var(--text-primary)]">Aggregate Summary</td>
                  <td className="text-[var(--accent-blue)] font-black">{totalMarks}</td>
                  <td className="text-[var(--text-secondary)]">{totalMax}</td>
                  <td>
                    <span className={overallPercentage >= 50 ? 'badge-success-aesthetic' : 'badge-danger-aesthetic'}>
                      {overallPercentage}%
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card text-center text-slate-500 py-12 text-sm">
          No grade records available yet in the database.
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentResults;
