import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, AlertCircle, CheckCircle2, XCircle, Loader2, Info } from 'lucide-react';

interface BulkImportDialogProps {
  tableName: 'students' | 'faculty';
  onInsertRow: (row: Record<string, any>) => Promise<any>;
  onComplete?: () => void;
}

interface ParsedRow {
  name: string;
  email: string;
  uniqueId: string;
  raw: Record<string, any>;
  isValid: boolean;
  validationError?: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  dbError?: string;
}

export const BulkImportDialog: React.FC<BulkImportDialogProps> = ({
  tableName,
  onInsertRow,
  onComplete,
}) => {
  const [open, setOpen] = useState(false);
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, successCount: 0, failCount: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const isStudent = tableName === 'students';

  // Generate and download sample template
  const downloadTemplate = () => {
    let headers = '';
    let sample = '';
    if (isStudent) {
      headers = 'name,email,enrollment_number,course,year,department\n';
      sample = 'Peter Parker,peter@college.com,ENR2026001,B.Tech,1,Computer Science\nMary Jane,mj@college.com,ENR2026002,B.Tech,1,Computer Science';
    } else {
      headers = 'name,email,employee_id,subject,department,qualification\n';
      sample = 'Charles Xavier,xavier@college.com,EMP1001,Data Structures,Computer Science,Ph.D.\nErik Lensherr,erik@college.com,EMP1002,Algorithms,Computer Science,M.Tech';
    }
    const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${tableName}_import_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper: Client-side CSV parser supporting quoted values
  const parseCSVText = (text: string): string[][] => {
    const result: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let cell = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(cell.trim());
        cell = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && text[i + 1] === '\n') {
          i++;
        }
        row.push(cell.trim());
        if (row.length > 0 && row.some(c => c !== '')) {
          result.push(row);
        }
        row = [];
        cell = '';
      } else {
        cell += char;
      }
    }
    if (cell || row.length > 0) {
      row.push(cell.trim());
      if (row.some(c => c !== '')) {
        result.push(row);
      }
    }
    return result;
  };

  // Process rows after file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileSelected(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const rows = parseCSVText(text);
        if (rows.length < 2) {
          toast({ variant: 'destructive', title: 'Empty CSV', description: 'The CSV file does not contain data rows.' });
          resetState();
          return;
        }

        const rawHeaders = rows[0];
        const dataRows = rows.slice(1);
        
        // Find indices of columns
        const findIndex = (aliases: string[]) => {
          return rawHeaders.findIndex(h => {
            const cleanH = h.toLowerCase().trim().replace(/[\s_-]/g, '');
            return aliases.includes(cleanH);
          });
        };

        const nameIdx = findIndex(['name', 'fullname', 'studentname', 'facultyname', 'name*']);
        const emailIdx = findIndex(['email', 'emailaddress', 'email*']);
        const idIdx = isStudent 
          ? findIndex(['enrollmentnumber', 'enrollmentid', 'enrollment_number', 'enrollment_id', 'studentnumber', 'id'])
          : findIndex(['employeeid', 'employee_id', 'employeenumber', 'facultynumber', 'id']);

        const deptIdx = findIndex(['department', 'dept']);
        const courseIdx = findIndex(['course', 'program']);
        const yearIdx = findIndex(['year', 'classyear']);
        const subjectIdx = findIndex(['subject', 'subjecttaught', 'teaches']);
        const qualIdx = findIndex(['qualification', 'degree']);

        const formatted: ParsedRow[] = dataRows.map((rowArr, rowIndex) => {
          const name = nameIdx !== -1 ? rowArr[nameIdx] || '' : '';
          const email = emailIdx !== -1 ? rowArr[emailIdx] || '' : '';
          const uniqueId = idIdx !== -1 ? rowArr[idIdx] || '' : '';

          // Parse extra fields
          const raw: Record<string, any> = {};
          if (nameIdx !== -1) raw.name = name;
          if (emailIdx !== -1) raw.email = email;
          
          if (isStudent) {
            if (idIdx !== -1) raw.enrollment_number = uniqueId;
            if (deptIdx !== -1) raw.department = rowArr[deptIdx] || '';
            if (courseIdx !== -1) raw.course = rowArr[courseIdx] || '';
            if (yearIdx !== -1) raw.year = rowArr[yearIdx] || '1';
          } else {
            if (idIdx !== -1) raw.employee_id = uniqueId;
            if (deptIdx !== -1) raw.department = rowArr[deptIdx] || '';
            if (subjectIdx !== -1) raw.subject = rowArr[subjectIdx] || '';
            if (qualIdx !== -1) raw.qualification = rowArr[qualIdx] || '';
          }

          // Real-time front-end validation
          let isValid = true;
          let validationError = '';

          if (!name) {
            isValid = false;
            validationError = 'Name is required';
          } else if (!email || !email.includes('@')) {
            isValid = false;
            validationError = 'Valid email is required';
          } else if (!uniqueId) {
            isValid = false;
            validationError = isStudent ? 'Enrollment ID is required' : 'Employee ID is required';
          }

          return {
            name,
            email,
            uniqueId,
            raw,
            isValid,
            validationError,
            status: 'pending' as const
          };
        });

        setParsedRows(formatted);
        setProgress({ current: 0, total: formatted.length, successCount: 0, failCount: 0 });
      } catch (err: any) {
        toast({ variant: 'destructive', title: 'Parser Error', description: 'Failed to process the CSV file contents.' });
        resetState();
      }
    };
    reader.readAsText(file);
  };

  const resetState = () => {
    setFileSelected(null);
    setParsedRows([]);
    setIsImporting(false);
    setProgress({ current: 0, total: 0, successCount: 0, failCount: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Run sequential loops to import rows
  const startImport = async () => {
    if (parsedRows.length === 0 || isImporting) return;
    setIsImporting(true);

    const activeRows = [...parsedRows];
    let successes = 0;
    let failures = 0;

    for (let i = 0; i < activeRows.length; i++) {
      if (!activeRows[i].isValid) {
        failures++;
        setProgress(p => ({ ...p, current: i + 1, failCount: failures }));
        continue;
      }

      // Mark row as processing
      activeRows[i].status = 'processing';
      setParsedRows([...activeRows]);

      try {
        await onInsertRow(activeRows[i].raw);
        activeRows[i].status = 'success';
        successes++;
      } catch (error: any) {
        activeRows[i].status = 'failed';
        activeRows[i].dbError = error.message || 'Server error';
        failures++;
      }

      setParsedRows([...activeRows]);
      setProgress(p => ({ ...p, current: i + 1, successCount: successes, failCount: failures }));
    }

    setIsImporting(false);
    toast({
      title: 'Import Completed',
      description: `Successfully processed ${successes} rows. ${failures} failed or skipped.`,
    });
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetState(); }}>
      <DialogTrigger asChild>
        <button className="btn-secondary-aesthetic flex items-center gap-2 text-sm">
          <Upload className="w-4 h-4" /> Bulk Import
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[var(--bg-card)] border border-[var(--border-solid)] text-[var(--text-primary)] rounded-xl max-w-2xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Upload className="w-5 h-5 text-[var(--accent-blue)]" />
            Bulk Import {isStudent ? 'Students' : 'Faculty'}
          </DialogTitle>
        </DialogHeader>

        {/* Info panel */}
        <div className="flex bg-[var(--bg-input)] border border-[var(--border-solid)] rounded-lg p-3 text-xs text-[var(--text-secondary)] gap-2 items-start mt-2 flex-shrink-0">
          <Info className="w-4.5 h-4.5 text-[var(--accent-blue)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[var(--text-primary)] mb-1">CSV Template Instructions</p>
            <p className="leading-relaxed mb-2 text-[var(--text-secondary)]">
              Save your spreadsheet as a <b>CSV (Comma Separated Values)</b> file. The columns should correspond to:
              <br />
              {isStudent 
                ? <code className="text-[var(--accent-blue)]">name, email, enrollment_number, course, year, department</code>
                : <code className="text-[var(--accent-blue)]">name, email, employee_id, subject, department, qualification</code>
              }
            </p>
            <button 
              onClick={downloadTemplate}
              className="flex items-center gap-1.5 font-bold text-[var(--accent-blue)] hover:underline"
            >
              <Download className="w-3.5 h-3.5" /> Download Sample Template
            </button>
          </div>
        </div>

        {/* Upload field */}
        <div className="mt-4 flex-shrink-0">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={isImporting}
            className="hidden"
          />
          <div 
            onClick={() => !isImporting && fileInputRef.current?.click()}
            className={`border border-dashed border-[var(--border-solid)] rounded-lg p-6 text-center cursor-pointer bg-[var(--bg-input)] hover:bg-[var(--bg-main)] transition-colors flex flex-col items-center justify-center ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {fileSelected ? fileSelected.name : 'Click to upload or drag CSV sheet here'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase">CSV file format up to 5MB</p>
          </div>
        </div>

        {/* Preview and Progress */}
        {parsedRows.length > 0 && (
          <div className="flex-1 min-h-0 flex flex-col mt-4">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] mb-2 flex-shrink-0">
              <span>Import Row Preview</span>
              <span>
                Total Rows: {progress.total}
              </span>
            </div>

            {/* List */}
            <div className="flex-1 min-h-0 overflow-y-auto border border-[var(--border-solid)] rounded-lg bg-[var(--bg-input)]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[var(--bg-main)] border-b border-[var(--border-solid)] sticky top-0 font-semibold text-[var(--text-secondary)]">
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">{isStudent ? 'Enrollment ID' : 'Employee ID'}</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, index) => (
                    <tr key={index} className="border-b border-[var(--border-solid)]/30 hover:bg-[var(--bg-main)]/50">
                      <td className="p-3 font-semibold text-[var(--text-primary)] truncate max-w-[120px]">{row.name || <span className="text-rose-500 italic">Missing</span>}</td>
                      <td className="p-3 text-[var(--text-secondary)] truncate max-w-[140px]">{row.email || <span className="text-rose-500 italic">Missing</span>}</td>
                      <td className="p-3 text-[var(--accent-blue)] font-bold truncate max-w-[100px]">{row.uniqueId || <span className="text-rose-500 italic">Missing</span>}</td>
                      <td className="p-3 text-right">
                        {!row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <AlertCircle className="w-3 h-3" /> {row.validationError}
                          </span>
                        ) : row.status === 'pending' ? (
                          <span className="text-slate-500 font-medium">Ready</span>
                        ) : row.status === 'processing' ? (
                          <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                            <Loader2 className="w-3 h-3 animate-spin" /> Processing
                          </span>
                        ) : row.status === 'success' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Succeeded
                          </span>
                        ) : (
                          <span 
                            title={row.dbError}
                            className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 cursor-help"
                          >
                            <XCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Progress Bar */}
            {isImporting && (
              <div className="mt-4 space-y-1.5 flex-shrink-0">
                <div className="flex justify-between text-xs font-semibold text-[var(--text-secondary)]">
                  <span>Importing Records...</span>
                  <span>{progress.current} / {progress.total} ({Math.round((progress.current / progress.total) * 100)}%)</span>
                </div>
                <div className="w-full bg-[var(--bg-input)] rounded-full h-2 overflow-hidden border border-[var(--border-solid)]">
                  <div 
                    className="bg-[var(--accent-blue)] h-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-[var(--border-solid)] pt-4 mt-4 flex-shrink-0">
          <button
            onClick={resetState}
            disabled={isImporting || parsedRows.length === 0}
            className="btn-secondary-aesthetic px-5 py-2 text-sm disabled:opacity-40 disabled:pointer-events-none"
          >
            Clear / Reset
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(false)}
              disabled={isImporting}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-sm px-4"
            >
              Close
            </button>
            <button
              onClick={startImport}
              disabled={isImporting || parsedRows.length === 0 || parsedRows.filter(r => r.isValid).length === 0}
              className="btn-primary-aesthetic px-6 py-2 text-sm disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Importing...
                </>
              ) : (
                'Process Import'
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

