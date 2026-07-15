import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Student } from '../models/Student';
import { Faculty } from '../models/Faculty';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeyforcollegecms123!';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, role, name, phone, department, specific_id, course, year, qualification, subject } = req.body;

    if (!email || !password || !role || !name) {
      return res.status(400).json({ message: 'All fields (email, password, role, name) are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      role,
      full_name: name,
      phone,
      department,
    });

    await user.save();

    let studentId = '';
    let facultyId = '';

    if (role === 'student') {
      const student = new Student({
        user_id: user._id,
        name,
        email,
        enrollment_number: specific_id || `STU${Date.now()}`,
        course: course || '',
        year: year ? parseInt(year) : 1,
        department: department || '',
      });
      await student.save();
      studentId = student._id.toString();
    } else if (role === 'faculty') {
      const faculty = new Faculty({
        user_id: user._id,
        name,
        email,
        employee_id: specific_id || `FAC${Date.now()}`,
        subject: subject || '',
        department: department || '',
        qualification: qualification || '',
      });
      await faculty.save();
      facultyId = faculty._id.toString();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        department: user.department,
      },
      student_id: studentId || undefined,
      faculty_id: facultyId || undefined,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    let studentId = '';
    let facultyId = '';

    if (user.role === 'student') {
      const student = await Student.findOne({ user_id: user._id });
      if (student) {
        studentId = student._id.toString();
      }
    } else if (user.role === 'faculty') {
      const faculty = await Faculty.findOne({ user_id: user._id });
      if (faculty) {
        facultyId = faculty._id.toString();
      }
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        department: user.department,
      },
      student_id: studentId || undefined,
      faculty_id: facultyId || undefined,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let studentId = '';
    let facultyId = '';

    if (user.role === 'student') {
      const student = await Student.findOne({ user_id: user._id });
      if (student) studentId = student._id.toString();
    } else if (user.role === 'faculty') {
      const faculty = await Faculty.findOne({ user_id: user._id });
      if (faculty) facultyId = faculty._id.toString();
    }

    res.json({
      user,
      student_id: studentId || undefined,
      faculty_id: facultyId || undefined,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });
  res.json({ message: 'Logged out successfully' });
};
