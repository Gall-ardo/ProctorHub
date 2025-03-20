// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import AdminMainPage from './pages/admin/AdminMainPage';
import AdminClassroomManagement from './pages/admin/AdminClassroomManagement';
import AdminCourseManagement from './pages/admin/AdminCourseManagement';
import AdminStudentManagement from './pages/admin/AdminStudentManagement';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminOfferingManagement from './pages/admin/AdminOfferingManagement';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/adminmainpage" element={<AdminMainPage />} />
        <Route path="/admin/adminclassroommanagement" element={<AdminClassroomManagement />} />
        <Route path="/admin/admincoursemanagement" element={<AdminCourseManagement />} />
        <Route path="/admin/adminstudentmanagement" element={<AdminStudentManagement />} />
        <Route path="/admin/adminusermanagement" element={<AdminUserManagement />} />
        <Route path="/admin/adminofferingmanagement" element={<AdminOfferingManagement />} />
        {/* Add more routes as needed */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;