import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';

import Home              from './components/Home';
import Login             from './components/Login';
import Signup            from './components/Signup';
import StudentDashboard  from './components/StudentDashboard';
import InChargeDashboard from './components/InChargeDashboard';
import AdminDashboard    from './components/AdminDashboard';
import PublicComplaints  from './components/PublicComplaints';
import PublicAnalytics   from './components/PublicAnalytics';
import ProtectedRoute    from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* ── Landing ─────────────────────────────── */}
            <Route path="/"           element={<Home />} />

            {/* ── Public pages ────────────────────────── */}
            <Route path="/complaints" element={<PublicComplaints />} />
            <Route path="/analytics"  element={<PublicAnalytics />} />

            {/* ── Auth ────────────────────────────────── */}
            <Route path="/student/login"    element={<Login />} />
            <Route path="/student/register" element={<Signup />} />

            {/* ── Student (protected) ─────────────────── */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } />

            {/* ── In-Charge (protected) ───────────────── */}
            <Route path="/incharge/dashboard" element={
              <ProtectedRoute allowedRole="incharge">
                <InChargeDashboard />
              </ProtectedRoute>
            } />

            {/* ── Admin (protected) ───────────────────── */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* ── Legacy redirects ────────────────────── */}
            <Route path="/login"            element={<Navigate to="/student/login"    replace />} />
            <Route path="/signup"           element={<Navigate to="/student/register" replace />} />
            <Route path="/submit-complaint" element={<Navigate to="/student/dashboard" replace />} />

            {/* ── Catch-all ───────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;