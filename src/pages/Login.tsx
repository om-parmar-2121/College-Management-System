import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Lock, Mail, User as UserIcon, BookOpen, School, Phone, ClipboardList } from 'lucide-react';

const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<'admin' | 'faculty' | 'student'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [specificId, setSpecificId] = useState(''); 
  
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('1');
  const [subject, setSubject] = useState('');
  const [qualification, setQualification] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    setIsLoading(true);
    const endpoint = isRegister ? 'register' : 'login';
    const body: Record<string, any> = isRegister
      ? {
          email,
          password,
          role,
          name,
          phone,
          department,
          specific_id: specificId,
          course,
          year,
          subject,
          qualification,
        }
      : { email, password };

    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${BASE_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('name', data.user.full_name);
      localStorage.setItem('email', data.user.email);
      
      if (data.student_id) localStorage.setItem('studentId', data.student_id);
      if (data.faculty_id) localStorage.setItem('facultyId', data.faculty_id);

      toast({
        title: isRegister ? 'Registration Successful!' : 'Welcome Back!',
        description: `Logged in as ${data.user.full_name} (${data.user.role})`,
      });

      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'faculty') navigate('/faculty');
      else navigate('/student');

    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: err.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg-main)] overflow-hidden font-sans py-12 px-4 sm:px-6 lg:px-8">
      {/* Flat card */}
      <div className="relative z-10 w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-solid)] rounded-lg p-8 flex flex-col">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-[var(--accent-blue)] flex items-center justify-center mb-3">
            <GraduationCap className="w-7 h-7 text-[var(--bg-main)]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>College CMS Portal</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 uppercase tracking-wider font-semibold">Authentication Gate</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-[var(--bg-input)] rounded-md p-1 mb-6 border border-[var(--border-solid)]">
          <button
            onClick={() => { setIsRegister(false); }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-none ${
              !isRegister ? 'bg-[var(--accent-blue)] text-[var(--bg-main)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsRegister(true); }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-none ${
              isRegister ? 'bg-[var(--accent-blue)] text-[var(--bg-main)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Register
          </button>
        </div>

        {/* Role selector */}
        {isRegister && (
          <div className="mb-6">
            <Label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-2.5 text-center">Account Profile Type</Label>
            <div className="grid grid-cols-3 gap-2 bg-[var(--bg-input)] p-1 rounded-md border border-[var(--border-solid)]">
              {(['student', 'faculty', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 text-xs font-bold capitalize rounded-md transition-none ${
                    role === r ? 'bg-[var(--accent-blue)] text-[var(--bg-main)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-[var(--text-primary)]">
          {isRegister && (
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-[var(--text-secondary)]">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input pl-10"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-[var(--text-secondary)]">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <Input
                id="email"
                type="email"
                placeholder="you@college.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-[var(--text-secondary)]">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input pl-10"
                required
              />
            </div>
          </div>

          {/* Registration Fields */}
          {isRegister && (
            <div className="space-y-4 pt-4 border-t border-white/[0.05] mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-[var(--text-secondary)]">Phone (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="glass-input pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dept" className="text-xs font-semibold text-[var(--text-secondary)]">Department</Label>
                <div className="relative">
                  <School className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <Input
                    id="dept"
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="glass-input pl-10"
                  />
                </div>
              </div>

              {role === 'student' && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="enroll" className="text-xs font-semibold text-[var(--text-secondary)]">Enrollment ID (Optional)</Label>
                    <div className="relative">
                      <ClipboardList className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <Input
                        id="enroll"
                        type="text"
                        placeholder="e.g. ENR2026001"
                        value={specificId}
                        onChange={(e) => setSpecificId(e.target.value)}
                        className="glass-input pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="course" className="text-xs font-semibold text-[var(--text-secondary)]">Course Program</Label>
                      <Input
                        id="course"
                        type="text"
                        placeholder="e.g. B.Tech"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="glass-input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="year" className="text-xs font-semibold text-[var(--text-secondary)]">Current Year</Label>
                      <select
                        id="year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-solid)] rounded-md px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] outline-none"
                      >
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {role === 'faculty' && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="emp" className="text-xs font-semibold text-[var(--text-secondary)]">Employee ID (Optional)</Label>
                    <div className="relative">
                      <ClipboardList className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <Input
                        id="emp"
                        type="text"
                        placeholder="e.g. EMP1001"
                        value={specificId}
                        onChange={(e) => setSpecificId(e.target.value)}
                        className="glass-input pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs font-semibold text-[var(--text-secondary)]">Teaches Subject</Label>
                    <div className="relative">
                      <BookOpen className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <Input
                        id="subject"
                        type="text"
                        placeholder="e.g. Data Structures"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="glass-input pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="qual" className="text-xs font-semibold text-[var(--text-secondary)]">Qualification</Label>
                    <Input
                      id="qual"
                      type="text"
                      placeholder="e.g. Ph.D. / M.Tech"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="glass-input"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary-aesthetic mt-6 py-3 font-bold"
          >
            {isLoading ? (isRegister ? 'Registering...' : 'Logging In...') : isRegister ? 'Register Account' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 font-semibold">
            {isRegister
              ? 'Already registered?'
              : 'New to the college portal? Click to'}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-[var(--accent-blue)] hover:underline font-bold transition-colors"
            >
              {isRegister ? 'Sign In' : 'Register Now'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
