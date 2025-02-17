import { Routes, Route, Navigate } from 'react-router-dom';
import React, { JSX } from 'react';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyOTP from '../pages/VerifyOTP';
import Dashboard from '../pages/Dashboard';
import ProtectedPage from '../pages/ProtectedPage';
import { useAuth } from '../hooks/useAuth';

const AppRoutes = () => {
  const { user } = useAuth();

  const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    return user ? children : <Navigate to="/login" />;
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/protected" element={<PrivateRoute><ProtectedPage /></PrivateRoute>} />
    </Routes>
  );
};

export default AppRoutes;
