import { Navigate, NavLink, Route, Routes, Link } from 'react-router-dom'
import { useAuth } from './auth'
import { Logo, ThemeToggle } from './ui'
import Landing from './pages/Landing'
import Login from './pages/Login'
import * as S from './pages/Sections'
import { AdminOverview, AdminStudents, AdminStudentDetail, AdminRoles, AdminResources } from './pages/AdminPages'
import { StudentCtx } from './data'
import { api } from './api'

const home = (me) => (me?.role === 'admin' ? '/admin' : '/app/overview')
const studentCtx = { fetch: (name) => api.student(name) }
const STUDENT_NAV = [['overview', 'Overview', '◎'], ['profile', 'My profile', '☺'], ['skills', 'Skill assessment', '✎'], ['aptitude', 'Aptitude test', '∑'],
  ['coding', 'Coding test', '</>'], ['readiness', 'Readiness analysis', '◔'], ['careers', 'Career recommendations', '➜'], ['skill-gaps', 'Skill gap analysis', '⇅'],
  ['roadmap', 'Learning roadmap', '⌖'], ['progress', 'Progress tracker', '↗'], ['resources', 'Resources', '▤'], ['settings', 'Settings', '⚙']]
const ADMIN_NAV = [['/admin', 'Overview', '◎', true], ['/admin/students', 'Students', '▦'], ['/admin/roles', 'Career roles', '➜'], ['/admin/resources', 'Resources', '▤']]

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
            ? ADMIN_NAV.map(([to, label, ic, end]) => <NavLink key={to} to={to} end={end}>{ic} {label}</NavLink>)
            : STUDENT_NAV.map(([k, label, ic]) => <NavLink key={k} to={`/app/${k}`}>{ic} {label}</NavLink>)}
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
      <Route path="/dashboard" element={<Navigate to="/app/overview" replace />} />
      {[['overview', 'Overview', S.Overview], ['profile', 'My profile', S.Profile], ['skills', 'Skill assessment', S.Skills], ['aptitude', 'Aptitude test', S.Aptitude],
        ['coding', 'Coding test', S.Coding], ['readiness', 'Readiness analysis', S.Readiness], ['careers', 'Career recommendations', S.Careers],
        ['skill-gaps', 'Skill gap analysis', S.SkillGaps], ['roadmap', 'Learning roadmap', S.Roadmap], ['progress', 'Progress tracker', S.Progress],
        ['resources', 'Resources', S.Resources], ['settings', 'Settings', S.Settings]].map(([k, title, Page]) => (
        <Route key={k} path={`/app/${k}`} element={<Guard role="student"><Shell title={title}><StudentCtx.Provider value={studentCtx}><Page /></StudentCtx.Provider></Shell></Guard>} />
      ))}
      <Route path="/admin" element={<Guard role="admin"><Shell title="Overview"><AdminOverview /></Shell></Guard>} />
      <Route path="/admin/students" element={<Guard role="admin"><Shell title="Students"><AdminStudents /></Shell></Guard>} />
      <Route path="/admin/students/:id/:section?" element={<Guard role="admin"><Shell title="Student"><AdminStudentDetail /></Shell></Guard>} />
      <Route path="/admin/roles" element={<Guard role="admin"><Shell title="Career roles"><AdminRoles /></Shell></Guard>} />
      <Route path="/admin/resources" element={<Guard role="admin"><Shell title="Resources"><AdminResources /></Shell></Guard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
