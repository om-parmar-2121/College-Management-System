import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User';
import { Student } from './models/Student';
import { Faculty } from './models/Faculty';
import { Notice } from './models/Notice';
import { Timetable } from './models/Timetable';
import { Assignment } from './models/Assignment';
import { Attendance } from './models/Attendance';
import { Result } from './models/Result';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college-cms';

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected. Clearing collections...');

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Faculty.deleteMany({});
    await Notice.deleteMany({});
    await Timetable.deleteMany({});
    await Assignment.deleteMany({});
    await Attendance.deleteMany({});
    await Result.deleteMany({});

    console.log('Collections cleared. Generating mock users...');

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const facultyPassword = await bcrypt.hash('faculty123', salt);
    const studentPassword = await bcrypt.hash('student123', salt);

    // Create Admin User
    const adminUser = new User({
      email: 'admin@college.com',
      password: adminPassword,
      role: 'admin',
      full_name: 'Dr. Arthur Pendragon',
      phone: '+1 555-0199',
      department: 'Administration',
    });
    await adminUser.save();

    // Create Faculty User & Record
    const facultyUser = new User({
      email: 'faculty@college.com',
      password: facultyPassword,
      role: 'faculty',
      full_name: 'Prof. Charles Xavier',
      phone: '+1 555-0188',
      department: 'Computer Science',
    });
    await facultyUser.save();

    const facultyRecord = new Faculty({
      user_id: facultyUser._id,
      name: facultyUser.full_name,
      email: facultyUser.email,
      employee_id: 'EMP1001',
      subject: 'Data Structures and Algorithms',
      department: 'Computer Science',
      qualification: 'Ph.D. in Computer Science',
    });
    await facultyRecord.save();

    // Create Student User & Record
    const studentUser = new User({
      email: 'student@college.com',
      password: studentPassword,
      role: 'student',
      full_name: 'Peter Parker',
      phone: '+1 555-0177',
      department: 'Computer Science',
    });
    await studentUser.save();

    const studentRecord = new Student({
      user_id: studentUser._id,
      name: studentUser.full_name,
      email: studentUser.email,
      enrollment_number: 'ENR2026001',
      course: 'B.Tech',
      year: 3,
      department: 'Computer Science',
    });
    await studentRecord.save();

    // Create secondary Student (for lists)
    const secondStudentUser = new User({
      email: 'clark.kent@college.com',
      password: studentPassword,
      role: 'student',
      full_name: 'Clark Kent',
      phone: '+1 555-0166',
      department: 'Journalism',
    });
    await secondStudentUser.save();

    const secondStudentRecord = new Student({
      user_id: secondStudentUser._id,
      name: secondStudentUser.full_name,
      email: secondStudentUser.email,
      enrollment_number: 'ENR2026002',
      course: 'B.A.',
      year: 2,
      department: 'Journalism',
    });
    await secondStudentRecord.save();

    // Create third Student
    const thirdStudentUser = new User({
      email: 'bruce.wayne@college.com',
      password: studentPassword,
      role: 'student',
      full_name: 'Bruce Wayne',
      phone: '+1 555-0155',
      department: 'Computer Science',
    });
    await thirdStudentUser.save();

    const thirdStudentRecord = new Student({
      user_id: thirdStudentUser._id,
      name: thirdStudentUser.full_name,
      email: thirdStudentUser.email,
      enrollment_number: 'ENR2026003',
      course: 'B.Tech',
      year: 3,
      department: 'Computer Science',
    });
    await thirdStudentRecord.save();

    console.log('Users and Profiles created. Creating Notices...');

    // Notices
    const notices = [
      {
        title: 'End Semester Exam Schedule',
        message: 'The end-semester examinations will begin on July 5th, 2026. The detailed timetable is available on the timetable board.',
        priority: 'urgent',
        published_by: adminUser._id.toString(),
      },
      {
        title: 'Annual Tech Fest "Hack-A-Thon"',
        message: 'Registrations are open for the annual Tech Fest hackathon. Grand prize of $5,000 for the winning team.',
        priority: 'high',
        published_by: adminUser._id.toString(),
      },
      {
        title: 'Library Extended Hours',
        message: 'The campus library will remain open 24/7 during the exam month starting next Monday.',
        priority: 'normal',
        published_by: adminUser._id.toString(),
      },
    ];
    await Notice.insertMany(notices);

    console.log('Notices created. Creating Timetables...');

    // Timetable
    const timetables = [
      {
        class_name: 'CS-3A',
        subject: 'Data Structures and Algorithms',
        faculty_id: facultyRecord._id.toString(),
        day_of_week: 'Monday',
        start_time: '09:00',
        end_time: '10:30',
        room: 'Lab-4',
      },
      {
        class_name: 'CS-3A',
        subject: 'Database Management Systems',
        faculty_id: facultyRecord._id.toString(),
        day_of_week: 'Monday',
        start_time: '11:00',
        end_time: '12:30',
        room: 'L-202',
      },
      {
        class_name: 'CS-3A',
        subject: 'Software Engineering',
        faculty_id: facultyRecord._id.toString(),
        day_of_week: 'Tuesday',
        start_time: '09:00',
        end_time: '10:30',
        room: 'L-202',
      },
      {
        class_name: 'CS-3A',
        subject: 'Artificial Intelligence',
        faculty_id: facultyRecord._id.toString(),
        day_of_week: 'Wednesday',
        start_time: '14:00',
        end_time: '15:30',
        room: 'Seminar Hall 1',
      },
      {
        class_name: 'CS-3A',
        subject: 'Data Structures and Algorithms',
        faculty_id: facultyRecord._id.toString(),
        day_of_week: 'Thursday',
        start_time: '11:00',
        end_time: '12:30',
        room: 'Lab-4',
      },
    ];
    await Timetable.insertMany(timetables);

    console.log('Timetable created. Creating Assignments...');

    // Assignments
    const assignments = [
      {
        title: 'DSA Programming Assignment 1: Graph algorithms',
        description: 'Implement Dijkstra\'s and Kruskal\'s algorithms. Submit your code along with complexity analysis report.',
        subject: 'Data Structures and Algorithms',
        faculty_id: facultyRecord._id.toString(),
        due_date: '2026-06-25',
        file_url: 'https://college.edu/materials/dsa-assign1.pdf',
        class_name: 'CS-3A',
      },
      {
        title: 'DBMS SQL Query Optimization Lab',
        description: 'Perform schema normalization and optimize complex join queries on the provided database dump.',
        subject: 'Database Management Systems',
        faculty_id: facultyRecord._id.toString(),
        due_date: '2026-06-30',
        file_url: '',
        class_name: 'CS-3A',
      },
    ];
    await Assignment.insertMany(assignments);

    console.log('Assignments created. Creating Attendance...');

    // Attendance
    const attendanceRecords = [
      {
        student_id: studentRecord._id.toString(),
        subject: 'Data Structures and Algorithms',
        date: '2026-06-15',
        status: 'present',
        marked_by: facultyUser._id.toString(),
      },
      {
        student_id: studentRecord._id.toString(),
        subject: 'Database Management Systems',
        date: '2026-06-15',
        status: 'present',
        marked_by: facultyUser._id.toString(),
      },
      {
        student_id: studentRecord._id.toString(),
        subject: 'Data Structures and Algorithms',
        date: '2026-06-16',
        status: 'present',
        marked_by: facultyUser._id.toString(),
      },
      {
        student_id: studentRecord._id.toString(),
        subject: 'Database Management Systems',
        date: '2026-06-16',
        status: 'absent',
        marked_by: facultyUser._id.toString(),
      },
      {
        student_id: thirdStudentRecord._id.toString(),
        subject: 'Data Structures and Algorithms',
        date: '2026-06-15',
        status: 'present',
        marked_by: facultyUser._id.toString(),
      },
      {
        student_id: thirdStudentRecord._id.toString(),
        subject: 'Database Management Systems',
        date: '2026-06-15',
        status: 'present',
        marked_by: facultyUser._id.toString(),
      },
    ];
    await Attendance.insertMany(attendanceRecords);

    console.log('Attendance created. Creating Results...');

    // Results
    const results = [
      {
        student_id: studentRecord._id.toString(),
        subject: 'Data Structures and Algorithms',
        marks_obtained: 88,
        total_marks: 100,
        exam_type: 'midterm',
        entered_by: facultyUser._id.toString(),
      },
      {
        student_id: studentRecord._id.toString(),
        subject: 'Database Management Systems',
        marks_obtained: 92,
        total_marks: 100,
        exam_type: 'midterm',
        entered_by: facultyUser._id.toString(),
      },
      {
        student_id: thirdStudentRecord._id.toString(),
        subject: 'Data Structures and Algorithms',
        marks_obtained: 75,
        total_marks: 100,
        exam_type: 'midterm',
        entered_by: facultyUser._id.toString(),
      },
    ];
    await Result.insertMany(results);

    console.log('Seeding completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
