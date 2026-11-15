import { Navigate, Route, Routes, Link } from 'react-router-dom'
import { useAuth } from './auth'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import AdminStudents from './pages/AdminStudents'
import AdminStudentDetail from './pages/AdminStudentDetail'

const home = (me) => (me?.role === 'admin' ? '/admin' : '/dashboard')

function Guard({ role, children }) {
  const { session, me, loading, error } = useAuth()
  if (loading) return <p className="center">Loading…</p>
  if (!session) return <Navigate to="/login" replace />
  if (error || !me) return <p className="center error">{error || 'Unable to load profile.'}</p>
  if (me.role !== role) return <Navigate to={home(me)} replace />
  return children
}

function Shell({ children }) {
  const { me, logout } = useAuth()
  return (
    <>
      <header className="bar">
        <Link to={home(me)} className="brand">Placement Readiness</Link>
        <span className="who">{me?.fullName} · {me?.role}</span>
        <button onClick={logout}>Log out</button>
      </header>
      <main>{children}</main>
    </>
  )
}

function Landing() {
  const { session, me, loading } = useAuth()
  if (loading) return <p className="center">Loading…</p>
  if (!session) return <Navigate to="/login" replace />
  return me ? <Navigate to={home(me)} replace /> : <p className="center error">Unable to load profile.</p>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Guard role="student"><Shell><StudentDashboard /></Shell></Guard>} />
      <Route path="/admin" element={<Guard role="admin"><Shell><AdminStudents /></Shell></Guard>} />
      <Route path="/admin/students/:id" element={<Guard role="admin"><Shell><AdminStudentDetail /></Shell></Guard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
