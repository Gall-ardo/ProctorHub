// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminLogsReports from './pages/admin/LogsAndReports/AdminLogsReports';
import AdminStudentPage from './pages/admin/Student/AdminStudentManagement';
import AdminCoursePage from './pages/admin/Course/AdminCourseManagement';
import AdminClassroomPage from './pages/admin/Classroom/AdminClassroomManagement';
import AdminUserPage from './pages/admin/User/AdminUserManagement';
import AdminOfferingPage from './pages/admin/Offering/AdminOfferingManagement';
import AdminSemesterPage from './pages/admin/Semester/AdminSemesterManagement';
import TAMainPage from './pages/ta/TAMainPage';
import TAWorkloadPage from './pages/ta/TAWorkloadPage';
import NavBar from './pages/ta/NavBar';
import TAProctoringPage from './pages/ta/TAProctoringPage';
import TALeaveOfAbsence from './pages/ta/TALeaveOfAbsence';
import InstructorMainPage from './pages/instructor/InstructorMainPage';


import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/admin" element={<AdminLogsReports />} />
        <Route path="/admin/student" element={<AdminStudentPage />} />
        <Route path="/admin/course" element={<AdminCoursePage />} />
        <Route path="/admin/user" element={<AdminUserPage />} />
        <Route path="/admin/offering" element={<AdminOfferingPage />} />
        <Route path="/admin/classroom" element={<AdminClassroomPage />} />
        <Route path="/admin/semester" element={<AdminSemesterPage />} />
        <Route path="/ta/tamainpage" element={<TAMainPage />} />
        <Route path="/ta/taworkloadpage" element={<TAWorkloadPage />} />
        <Route path="/ta/navbar" element={<NavBar />} />
        <Route path="/ta/taproctoringpage" element={<TAProctoringPage />} />
        <Route path="/ta/taleaveofabsence" element={<TALeaveOfAbsence />} />
        <Route path="/instructor/main" element={<InstructorMainPage />} />
        {/* Add more routes as needed */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;