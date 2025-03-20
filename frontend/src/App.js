// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import AdminMainPage from './pages/admin/AdminMainPage';
import AdminClassroomManagement from './pages/admin/AdminClassroomManagement';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/adminmainpage" element={<AdminMainPage />} />
        <Route path="/admin/adminclassroommanagement" element={<AdminClassroomManagement />} />
        {/* Add more routes as needed */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;