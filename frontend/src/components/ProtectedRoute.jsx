import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  let token = null;
  try { token = localStorage.getItem('token'); } catch (e) { token = null; }
  if (!token) return <Navigate to="/student/login" replace />;
  return <>{children}</>;
}
