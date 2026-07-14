import React, { useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTableQuery, useTableMutation } from '@/hooks/useSupabaseQuery';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Award, CheckSquare, Upload, Download, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const FacultyResults: React.FC = () => {
  const { data: students } = useTableQuery('students');
  const { insert } = useTableMutation('results');
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('final');
  const [totalMarks, setTotalMarks] = useState('100');
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadMarksTemplate = () => {
    const headers = 'email,marks_obtained\n';
    const sample = 'student@college.com,85\nstudent2@college.com,90';
    const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_marks_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          toast({ variant: 'destructive', title: 'Error', description: 'The CSV file is empty.' });
          return;
        }

        const headers = lines[0].split(',').map(h => h.toLowerCase().trim().replace(/[\s_-]/g, ''));
        const emailIdx = headers.findIndex(h => h.includes('email'));
        const enrollIdx = headers.findIndex(h => h.includes('enroll') || h === 'id' || h.includes('student'));
        const marksIdx = headers.findIndex(h => h.includes('mark') || h.includes('score') || h.includes('grade'));

        if (emailIdx === -1 && enrollIdx === -1) {
          toast({ variant: 'destructive', title: 'Error', description: 'CSV must contain an "email" or "enrollment_number" column.' });
          return;
        }
        if (marksIdx === -1) {
          toast({ variant: 'destructive', title: 'Error', description: 'CSV must contain a "marks" or "score" column.' });
          return;
        }

        const newMarks: Record<string, string> = { ...marks };
        let matchedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          const emailVal = emailIdx !== -1 ? cols[emailIdx] : '';
          const enrollVal = enrollIdx !== -1 ? cols[enrollIdx] : '';
          const marksVal = cols[marksIdx] || '';

          if (!marksVal) continue;

          // Find student matching emailVal or enrollVal
          const matchedStudent = students?.find((s: any) => {
            const matchEmail = emailVal && s.email?.toLowerCase().trim() === emailVal.toLowerCase().trim();
            const matchEnroll = enrollVal && s.enrollment_number?.toLowerCase().trim() === enrollVal.toLowerCase().trim();
            return matchEmail || matchEnroll;
          });

          if (matchedStudent) {
            newMarks[matchedStudent.id] = marksVal;
            matchedCount++;
          }
        }

        setMarks(newMarks);
        setDialogOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        toast({
          title: 'Marks Loaded Successfully',
          description: `Loaded marks for ${matchedCount} students from CSV. Please review the table below before publishing.`
        });
      } catch (err: any) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to process CSV file.' });
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!subject.trim()) { toast({ variant: 'destructive', title: 'Error', description: 'Please enter a subject name.' }); return; }
    const entries = Object.entries(marks).filter(([_, v]) => v.trim() !== '');
    if (entries.length === 0) { toast({ variant: 'destructive', title: 'Error', description: 'Please enter marks for at least one student.' }); return; }
    
    setIsSubmitting(true);
    try {
      for (const [studentId, m] of entries) {
        await insert.mutateAsync({
          student_id: studentId,
          subject,
          marks_obtained: parseFloat(m),
          total_marks: parseFloat(totalMarks),
          exam_type: examType
        });
      }
      toast({ title: `Results entered for ${entries.length} students` });
      setMarks({});
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title text-[var(--text-primary)]">Enter Exam Results</h1>
          <p className="page-subtitle text-[var(--text-secondary)]">Input and publish marks details for student examinations</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="btn-secondary-aesthetic flex items-center gap-2 text-sm">
                <Upload className="w-4 h-4" /> Import Marks (CSV)
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[var(--bg-card)] border border-[var(--border-solid)] text-[var(--text-primary)] rounded-2xl max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[var(--accent-blue)]" /> Import Student Marks
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-3">
                <div className="flex bg-[var(--bg-input)] border border-[var(--border-solid)] rounded-lg p-3 text-xs text-[var(--text-secondary)] gap-2 items-start">
                  <Info className="w-4.5 h-4.5 text-[var(--accent-blue)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[var(--text-primary)] mb-1">CSV Format Requirements</p>
                    <p className="leading-relaxed mb-2">
                      Ensure your CSV file contains column headers for student identifiers and score:
                      <br />
                      <code className="text-[var(--accent-blue)]">email, marks_obtained</code> or <code className="text-[var(--accent-blue)]">enrollment_number, marks_obtained</code>
                    </p>
                    <button 
                      onClick={downloadMarksTemplate}
                      className="flex items-center gap-1 font-bold text-[var(--accent-blue)] hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" /> Download CSV Template
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full btn-primary-aesthetic flex items-center justify-center gap-2 py-3"
                  >
                    <Upload className="w-4 h-4" /> Choose CSV File
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="glass-card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <Label className="text-[var(--text-secondary)] flex items-center gap-1.5 mb-2"><BookOpen className="w-4 h-4 text-[var(--accent-blue)]" /> Subject Module</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Computer Networks" className="glass-input" />
          </div>
          <div>
            <Label className="text-[var(--text-secondary)] flex items-center gap-1.5 mb-2"><Award className="w-4 h-4 text-[var(--accent-blue)]" /> Exam Scheme</Label>
            <select
              className="w-full bg-[var(--bg-input)] border border-[var(--border-solid)] rounded-md px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] outline-none mt-1.5"
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
            >
              <option value="midterm" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Midterm Exam</option>
              <option value="final" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Final Exam</option>
              <option value="quiz" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Quiz Test</option>
              <option value="assignment" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Assignment Evaluation</option>
            </select>
          </div>
          <div>
            <Label className="text-[var(--text-secondary)] flex items-center gap-1.5 mb-2"><CheckSquare className="w-4 h-4 text-[var(--accent-blue)]" /> Max Score Limit</Label>
            <Input type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} className="glass-input" />
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="aesthetic-table-container">
          <table className="aesthetic-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Department</th>
                <th>Obtained Score</th>
              </tr>
            </thead>
            <tbody>
              {students?.map((s: any) => (
                <tr key={s.id}>
                  <td className="font-bold text-[var(--text-primary)]">{s.name || '—'}</td>
                  <td className="text-[var(--text-secondary)] font-semibold">{s.department}</td>
                  <td>
                    <Input
                      type="number"
                      className="glass-input w-32 focus:border-blue-500"
                      min="0"
                      max={totalMarks}
                      placeholder={`0 - ${totalMarks}`}
                      value={marks[s.id] || ''}
                      onChange={(e) => setMarks(prev => ({...prev, [s.id]: e.target.value}))}
                    />
                  </td>
                </tr>
              ))}
              {(!students || students.length === 0) && (
                <tr>
                  <td colSpan={3} className="text-center text-slate-500 py-12 italic">
                    No student profiles found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {students && students.length > 0 && (
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary-aesthetic px-6 py-2.5 text-sm"
            >
              {isSubmitting ? 'Publishing grades...' : 'Publish Exam Grades'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FacultyResults;
