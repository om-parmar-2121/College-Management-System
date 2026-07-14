import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminFaculty from "./pages/admin/AdminFaculty";
import AdminNotices from "./pages/admin/AdminNotices";
import AdminTimetable from "./pages/admin/AdminTimetable";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyAttendance from "./pages/faculty/FacultyAttendance";
import FacultyResults from "./pages/faculty/FacultyResults";
import FacultyAssignments from "./pages/faculty/FacultyAssignments";
import FacultyStudents from "./pages/faculty/FacultyStudents";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentResults from "./pages/student/StudentResults";
import StudentTimetable from "./pages/student/StudentTimetable";
import StudentNotices from "./pages/student/StudentNotices";
import StudentAssignments from "./pages/student/StudentAssignments";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const RootRedirect = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'faculty') return <Navigate to="/faculty" replace />;
  if (role === 'student') return <Navigate to="/student" replace />;

  return <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<Login />} />

        {/* Default / Redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute allowedRoles={["admin"]}><AdminStudents /></ProtectedRoute>} />
        <Route path="/admin/faculty" element={<ProtectedRoute allowedRoles={["admin"]}><AdminFaculty /></ProtectedRoute>} />
        <Route path="/admin/notices" element={<ProtectedRoute allowedRoles={["admin"]}><AdminNotices /></ProtectedRoute>} />
        <Route path="/admin/timetable" element={<ProtectedRoute allowedRoles={["admin"]}><AdminTimetable /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAnalytics /></ProtectedRoute>} />

        {/* Faculty Routes */}
        <Route path="/faculty" element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/faculty/attendance" element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyAttendance /></ProtectedRoute>} />
        <Route path="/faculty/results" element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyResults /></ProtectedRoute>} />
        <Route path="/faculty/assignments" element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyAssignments /></ProtectedRoute>} />
        <Route path="/faculty/students" element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyStudents /></ProtectedRoute>} />

        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={["student"]}><StudentAttendance /></ProtectedRoute>} />
        <Route path="/student/results" element={<ProtectedRoute allowedRoles={["student"]}><StudentResults /></ProtectedRoute>} />
        <Route path="/student/timetable" element={<ProtectedRoute allowedRoles={["student"]}><StudentTimetable /></ProtectedRoute>} />
        <Route path="/student/notices" element={<ProtectedRoute allowedRoles={["student"]}><StudentNotices /></ProtectedRoute>} />
        <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={["student"]}><StudentAssignments /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
