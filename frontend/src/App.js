// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import AdminMainPage from './pages/admin/main/AdminMainPage';
import AdminStudentPage from './pages/admin/Student/AdminStudentManagement';
import AdminCoursePage from './pages/admin/Course/AdminCourseManagement';
import AdminClassroomPage from './pages/admin/Classroom/AdminClassroomManagement';
import AdminUserPage from './pages/admin/User/AdminUserManagement';
import AdminOfferingPage from './pages/admin/Offering/AdminOfferingManagement';
import TAMainPage from './pages/ta/TAMainPage';


import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminMainPage />} />
        <Route path="/admin/student" element={<AdminStudentPage />} />
        <Route path="/admin/course" element={<AdminCoursePage />} />
        <Route path="/admin/user" element={<AdminUserPage />} />
        <Route path="/admin/offering" element={<AdminOfferingPage />} />
        <Route path="/admin/classroom" element={<AdminClassroomPage />} />
        <Route path="/ta/tamainpage" element={<TAMainPage />} />
        {/* Add more routes as needed */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;