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
import TANavBar from './pages/ta/TANavBar';
import TAProctoringPage from './pages/ta/TAProctoringPage';
import TALeaveOfAbsence from './pages/ta/TALeaveOfAbsence';
import InstructorMainPage from './pages/instructor/InstructorMainPage';
import InstructorTAWorkloadPage from './pages/instructor/InstructorTAWorkloadPage';
import InstructorExamsPage from './pages/instructor/InstructorExamsPage';
import TAExamForumPage from './pages/ta/TAExamForumPage';
import DepartmentChairMainPage from "./pages/departmentchair/DepartmentChairMainPage";
import DepartmentChairExamsPage from "./pages/departmentchair/DepartmentChairExamsPage";
import DepartmentChairTAWorkloadPage from "./pages/departmentchair/DepartmentChairTAWorkloadPage";
import DepartmentChairLeaveRequestPage from "./pages/departmentchair/DepartmentChairLeaveRequestPage";
import DepartmentChairAssignPage from "./pages/departmentchair/DepartmentChairAssignPage";
import InstructorAssignPage from "./pages/instructor/InstructorAssignPage";
import DeansOfficeMainPage from "./pages/deansoffice/DeansOfficeMainPage";
import DeansOfficeExamsPage from "./pages/deansoffice/DeansOfficeExamsPage";
import DeansOfficeLeaveRequestPage from "./pages/deansoffice/DeansOfficeLeaveRequestPage";
import ResetPassword from './pages/auth/ResetPassword';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/admin" element={<AdminLogsReports />} />
        <Route path="/admin/logs" element={<Navigate to="/admin" />} /> {/* Redirect /admin/logs to /admin */}
        <Route path="/admin/student" element={<AdminStudentPage />} />
        <Route path="/admin/course" element={<AdminCoursePage />} />
        <Route path="/admin/user" element={<AdminUserPage />} />
        <Route path="/admin/offering" element={<AdminOfferingPage />} />
        <Route path="/admin/classroom" element={<AdminClassroomPage />} />
        <Route path="/admin/semester" element={<AdminSemesterPage />} />
        <Route path="/ta/tamain" element={<TAMainPage />} />
        <Route path="/ta/taworkload" element={<TAWorkloadPage />} />
        <Route path="/ta/tanavbar" element={<TANavBar />} />
        <Route path="/ta/taproctoring" element={<TAProctoringPage />} />
        <Route path="/ta/taleaveofabsence" element={<TALeaveOfAbsence />} />
        <Route path="/ta/taforum" element={<TAExamForumPage />} />
        <Route path="/instructor/home" element={<InstructorMainPage />} />
        <Route path="/instructor/ta-workload" element={<InstructorTAWorkloadPage />} />
        <Route path="/instructor/exams" element={<InstructorExamsPage />} />
        <Route path="/instructor/assign" element={<InstructorAssignPage />} />
        <Route path="/departmentchair/home" element={<DepartmentChairMainPage />} />
        <Route path="/departmentchair/ta-workload" element={<DepartmentChairTAWorkloadPage />} />
        <Route path="/departmentchair/exams" element={<DepartmentChairExamsPage />} />
        <Route path="/departmentchair/leaverequest" element={<DepartmentChairLeaveRequestPage />} />
        <Route path="/departmentchair/assign" element={<DepartmentChairAssignPage />} />
        <Route path="/deansoffice/home" element={<DeansOfficeMainPage />} />
        <Route path="/deansoffice/exams" element={<DeansOfficeExamsPage />} />
        <Route path="/deansoffice/leaverequest" element={<DeansOfficeLeaveRequestPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Add more routes as needed */}
         <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;