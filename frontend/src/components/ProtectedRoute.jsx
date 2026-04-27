import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_HOME = {
  student:  '/student/dashboard',
  incharge: '/incharge/dashboard',
  admin:    '/admin/dashboard',
}

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0f172a', color: '#fff', fontSize: '1.1rem'
      }}>
        Loading…
      </div>
    )
  }

  // Not logged in at all
  if (!user) return <Navigate to="/student/login" replace />

  // Logged in but wrong role tab
  if (allowedRole && profile && profile.role !== allowedRole) {
    return <Navigate to={ROLE_HOME[profile.role] || '/student/login'} replace />
  }

  return <>{children}</>
}
