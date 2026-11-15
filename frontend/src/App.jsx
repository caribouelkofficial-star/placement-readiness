import { Navigate, NavLink, Route, Routes, Link } from 'react-router-dom'
import { useAuth } from './auth'
import { Logo, ThemeToggle } from './ui'
import Landing from './pages/Landing'
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

function Shell({ title, children }) {
  const { me, logout } = useAuth()
  const initials = (me?.fullName || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const admin = me?.role === 'admin'
  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to={home(me)}><Logo /></Link>
        <nav>
          {admin
            ? <NavLink to="/admin" end={false}>▦ Students</NavLink>
            : <NavLink to="/dashboard">◎ Overview</NavLink>}
        </nav>
        <button className="btn" style={{ marginTop: 'auto' }} onClick={logout}>Log out</button>
      </aside>
      <div>
        <div className="topbar">
          <div className="t"><small>{admin ? 'Placement officer' : 'Student workspace'}</small>{title}</div>
          <ThemeToggle />
          <div className="avatar"><i>{initials}</i>{me?.fullName}</div>
        </div>
        <main className="content">{children}</main>
      </div>
    </div>
  )
}

function Root() {
  const { session, me, loading } = useAuth()
  if (loading) return <p className="center">Loading…</p>
  if (!session) return <Landing />
  return me ? <Navigate to={home(me)} replace /> : <p className="center error">Unable to load profile.</p>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Root />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Guard role="student"><Shell title="Overview"><StudentDashboard /></Shell></Guard>} />
      <Route path="/admin" element={<Guard role="admin"><Shell title="Students"><AdminStudents /></Shell></Guard>} />
      <Route path="/admin/students/:id" element={<Guard role="admin"><Shell title="Student detail"><AdminStudentDetail /></Shell></Guard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
