// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import PasswordReset from './pages/PasswordReset';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';

const App = () => {
  const location = useLocation();
  
  // Hide navbar on auth pages
  const showNavbar = !['/login', '/register', '/password-reset'].includes(location.pathname);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {showNavbar && <Navbar />}
        <Routes>
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
};

export default App;