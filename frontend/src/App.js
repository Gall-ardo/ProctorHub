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
import InstructorNavBar from './pages/instructor/InstructorNavBar';
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
import ProtectedRoute from './components/ProtectedRoute';
import SecretaryMainPage from './pages/secretary/SecretaryMainPage';
import SecretaryExamsPage from './pages/secretary/SecretaryExamsPage';
import SecretaryTAWorkloadPage from './pages/secretary/SecretaryTAWorkloadPage';
import SecretaryLeaveRequestPage from './pages/secretary/SecretaryLeaveRequestPage';
import InstructorTAAssignerPage from './pages/instructor/InstructorTAAssignerPage';
import './App.css';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Admin Routes - Unprotected */}
        <Route path="/admin" element={<AdminLogsReports />} />
        <Route path="/admin/logs" element={<Navigate to="/admin" />} /> 
        <Route path="/admin/student" element={<AdminStudentPage />} />
        <Route path="/admin/course" element={<AdminCoursePage />} />
        <Route path="/admin/user" element={<AdminUserPage />} />
        <Route path="/admin/offering" element={<AdminOfferingPage />} />
        <Route path="/admin/classroom" element={<AdminClassroomPage />} />
        <Route path="/admin/semester" element={<AdminSemesterPage />} />
        <Route path="/secretary/home" element={<SecretaryMainPage />} />
        <Route path="/secretary/ta-workload" element={<SecretaryTAWorkloadPage />} />
        <Route path="/secretary/exams" element={<SecretaryExamsPage />} />
        <Route path="/secretary/leaverequest" element={<SecretaryLeaveRequestPage />} />
        
        {/* Protected TA Routes */}
        <Route path="/ta/tamain" element={
          <ProtectedRoute allowedRoles={['ta']}>
            <TAMainPage />
          </ProtectedRoute>
        } />
        <Route path="/ta/taworkload" element={
          <ProtectedRoute allowedRoles={['ta']}>
            <TAWorkloadPage />
          </ProtectedRoute>
        } />
        <Route path="/ta/tanavbar" element={
          <ProtectedRoute allowedRoles={['ta']}>
            <TANavBar />
          </ProtectedRoute>
        } />
        <Route path="/ta/taproctoring" element={
          <ProtectedRoute allowedRoles={['ta']}>
            <TAProctoringPage />
          </ProtectedRoute>
        } />
        <Route path="/ta/taleaveofabsence" element={
          <ProtectedRoute allowedRoles={['ta']}>
            <TALeaveOfAbsence />
          </ProtectedRoute>
        } />
        <Route path="/ta/taforum" element={
          <ProtectedRoute allowedRoles={['ta']}>
            <TAExamForumPage />
          </ProtectedRoute>
        } />
        
        {/* Protected Instructor Routes */}
        <Route path="/instructor/home" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorMainPage />
          </ProtectedRoute>
        } />
        <Route path="/instructor/ta-workload" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorTAWorkloadPage />
          </ProtectedRoute>
        } />
        <Route path="/instructor/exams" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorExamsPage />
          </ProtectedRoute>
        } />
        <Route path="/instructor/assign" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorAssignPage />
          </ProtectedRoute>
        } />
        <Route path="/instructor/navbar" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorNavBar />
          </ProtectedRoute>
        } />
        <Route path="/instructor/assign-tas-to-course" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorTAAssignerPage />
          </ProtectedRoute>
        } />
        
        {/* Protected Department Chair Routes */}
        <Route path="/departmentchair/home" element={
            <DepartmentChairMainPage />
        } />
        <Route path="/departmentchair/ta-workload" element={
          <ProtectedRoute allowedRoles={['chair']}>
            <DepartmentChairTAWorkloadPage />
          </ProtectedRoute>
        } />
        <Route path="/departmentchair/exams" element={
          <ProtectedRoute allowedRoles={['chair']}>
            <DepartmentChairExamsPage />
          </ProtectedRoute>
        } />
        <Route path="/departmentchair/leaverequest" element={
          <ProtectedRoute allowedRoles={['chair']}>
            <DepartmentChairLeaveRequestPage />
          </ProtectedRoute>
        } />
        <Route path="/departmentchair/assign" element={
            <DepartmentChairAssignPage />
        } />
        
        {/* Protected Dean's Office Routes */}
        <Route path="/deansoffice/home" element={
          <ProtectedRoute allowedRoles={['dean']}>
            <DeansOfficeMainPage />
          </ProtectedRoute>
        } />
        <Route path="/deansoffice/exams" element={
          <ProtectedRoute allowedRoles={['dean']}>
            <DeansOfficeExamsPage />
          </ProtectedRoute>
        } />
        <Route path="/deansoffice/leaverequest" element={
          <ProtectedRoute allowedRoles={['dean']}>
            <DeansOfficeLeaveRequestPage />
          </ProtectedRoute>
        } />
        {/* Protected Secretary Routes */}
        <Route path="/secretary/home" element={
          <ProtectedRoute allowedRoles={['secretary']}>
            <SecretaryMainPage />
          </ProtectedRoute>
        } />
        <Route path="/secretary/ta-workload" element={
          <ProtectedRoute allowedRoles={['secretary']}>
            <SecretaryTAWorkloadPage />
          </ProtectedRoute>
        } />
        <Route path="/secretary/exams" element={
          <ProtectedRoute allowedRoles={['secretary']}>
            <SecretaryExamsPage />
          </ProtectedRoute>
        } />
        <Route path="/secretary/leaverequest" element={
          <ProtectedRoute allowedRoles={['secretary']}>
            <SecretaryLeaveRequestPage />
          </ProtectedRoute>
        } />

        {/* Protected Routes for all roles */}
        
        {/* Catch-all route - redirect to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;