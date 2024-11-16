import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Dashboard from './pages/Dashboard';
import StudentDashBoard from './pages/StudentDashBoard';
import WardenDashboard from './pages/wardenDashboard';
import LoginRegistrationForm from './pages/LoginRegistrationForm';
import HodDashboard from './pages/HodDashboard';
import SecurityScan from './pages/SecurityScan';


import CoordinatorDashboard from './pages/CoordinatorDashboard';
import RootAdminDashboard from './pages/RootAdmin';
import './index.css';
import Profile from './pages/StudentDashBoard';

const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginRegistrationForm />} />
      <Route path="/security" element={<SecurityScan />} />
      <Route path="/student-dashboard" element={<StudentDashBoard />} />
      <Route path="/warden-dashboard" element={<WardenDashboard />} />
      <Route path="/hod-dashboard" element={<HodDashboard />} />
      <Route path="/coordinator-dashboard" element={<CoordinatorDashboard />} />
      <Route path="/admin-dashboard" element={<RootAdminDashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <CssBaseline />
      <AppContent />
    </Router>
  );
};

export default App;
