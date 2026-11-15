import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes, Link, useLocation } from 'react-router-dom'
import { useAuth } from './auth'
import { Logo, ThemeToggle, Icon, Footer, Loading, ErrorNote } from './ui'
import Landing from './pages/Landing'
import ComingSoon from './pages/ComingSoon'
import Onboarding from './pages/Onboarding'
import * as S from './pages/Sections'
import { AdminOverview, AdminStudents, AdminStudentDetail, AdminRoles, AdminResources } from './pages/AdminPages'
import { StudentCtx } from './data'
import { api } from './api'

const home = () => '/'
const studentCtx = { fetch: (name) => api.student(name) }
const STUDENT_NAV = [['overview', 'Overview', 'overview'], ['profile', 'My profile', 'profile'], ['skills', 'Skill assessment', 'skills'], ['aptitude', 'Aptitude test', 'aptitude'],
  ['coding', 'Coding test', 'coding'], ['readiness', 'Readiness analysis', 'readiness'], ['careers', 'Career recommendations', 'careers'], ['skill-gaps', 'Skill gap analysis', 'gaps'],
  ['roadmap', 'Learning roadmap', 'roadmap'], ['progress', 'Progress tracker', 'progress'], ['resources', 'Resources', 'resources'], ['settings', 'Settings', 'settings']]
const ADMIN_NAV = [['/', 'Overview', 'overview', true], ['/admin/students', 'Students', 'students'], ['/admin/roles', 'Career roles', 'careers'], ['/admin/resources', 'Resources', 'resources']]

function Guard({ role, children }) {
  const { session, me, loading, error } = useAuth()
  if (loading) return <Loading page />
  if (!session) return <Navigate to="/" replace />
  if (error || !me) return <div className="splash"><ErrorNote>{error || 'Unable to load your profile.'}</ErrorNote></div>
  if (me.role !== role) return <Navigate to={home(me)} replace />
  if (role === 'student' && !me.onboarded) return <Navigate to="/onboarding" replace />
  return children
}

const initialsOf = (name) => (name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

function AnyRole({ children }) {
  const { session, me, loading } = useAuth()
  if (loading) return <p className="center">Loading…</p>
  if (!session) return <Navigate to="/" replace />
  return me ? children : <p className="center error">Unable to load profile.</p>
}

function Shell({ title, children }) {
  const { me, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const admin = me?.role === 'admin'

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => { document.title = `${title} · PlaceReady` }, [title])
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to content</a>
      {open && <div className="scrim" onClick={() => setOpen(false)} aria-hidden="true" />}
      <aside className={`sidebar${open ? ' open' : ''}`} id="sidebar" aria-label="Main navigation">
        <div className="sb-top">
          <Link to={home(me)}><Logo /></Link>
          <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setOpen(false)}><Icon name="close" /></button>
        </div>
        <nav>
          {admin
            ? ADMIN_NAV.map(([to, label, ic, end]) => <NavLink key={to} to={to} end={end}><Icon name={ic} />{label}</NavLink>)
            : STUDENT_NAV.map(([k, label, ic]) => <NavLink key={k} to={k === 'overview' ? '/' : `/app/${k}`} end={k === 'overview'}><Icon name={ic} />{label}</NavLink>)}
        </nav>
        <div className="sb-user">
          <span className="av">{initialsOf(me?.fullName)}</span>
          <div><b>{me?.fullName}</b><span>{me?.email}</span></div>
        </div>
        <button type="button" className="btn" onClick={logout}><Icon name="logout" />Log out</button>
      </aside>
      <div className="main-col">
        <header className="topbar">
          <button type="button" className="icon-btn menu" aria-label="Open menu" aria-expanded={open} aria-controls="sidebar" onClick={() => setOpen(true)}><Icon name="menu" /></button>
          <div className="t"><small>{admin ? 'Placement officer' : 'Student workspace'}</small><span>{title}</span></div>
          <ThemeToggle />
          <div className="avatar" title={me?.fullName}><i>{initialsOf(me?.fullName)}</i><em>{me?.fullName}</em></div>
        </header>
        <main className="content" id="main" tabIndex={-1}>{children}</main>
        <Footer />
      </div>
    </div>
  )
}

function Root() {
  const { session, me, loading } = useAuth()
  if (loading) return <Loading page />
  if (!session) return <Landing />
  if (!me) return <div className="splash"><ErrorNote>Unable to load your profile.</ErrorNote></div>
  if (me.role === 'student' && !me.onboarded) return <Navigate to="/onboarding" replace />
  // Signed in: the dashboard replaces the landing page in place, with no redirect.
  return me.role === 'admin'
    ? <Shell title="Overview"><AdminOverview /></Shell>
    : <Shell title="Overview"><StudentCtx.Provider value={studentCtx}><S.Overview /></StudentCtx.Provider></Shell>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Root />} />
      <Route path="/login" element={<Navigate to="/?auth=login" replace />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/app/overview" element={<Navigate to="/" replace />} />
      {[['profile', 'My profile', S.Profile], ['skills', 'Skill assessment', S.Skills], ['aptitude', 'Aptitude test', S.Aptitude],
        ['coding', 'Coding test', S.Coding], ['readiness', 'Readiness analysis', S.Readiness], ['careers', 'Career recommendations', S.Careers],
        ['skill-gaps', 'Skill gap analysis', S.SkillGaps], ['roadmap', 'Learning roadmap', S.Roadmap], ['progress', 'Progress tracker', S.Progress],
        ['resources', 'Resources', S.Resources], ['settings', 'Settings', S.Settings]].map(([k, title, Page]) => (
        <Route key={k} path={`/app/${k}`} element={<Guard role="student"><Shell title={title}><StudentCtx.Provider value={studentCtx}><Page /></StudentCtx.Provider></Shell></Guard>} />
      ))}
      <Route path="/admin" element={<Navigate to="/" replace />} />
      <Route path="/admin/students" element={<Guard role="admin"><Shell title="Students"><AdminStudents /></Shell></Guard>} />
      <Route path="/admin/students/:id/:section?" element={<Guard role="admin"><Shell title="Student"><AdminStudentDetail /></Shell></Guard>} />
      <Route path="/admin/roles" element={<Guard role="admin"><Shell title="Career roles"><AdminRoles /></Shell></Guard>} />
      <Route path="/admin/resources" element={<Guard role="admin"><Shell title="Resources"><AdminResources /></Shell></Guard>} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/coming-soon" element={<AnyRole><Shell title="Coming soon"><ComingSoon /></Shell></AnyRole>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
