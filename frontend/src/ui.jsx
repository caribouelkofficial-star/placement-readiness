import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const PATHS = {
  overview: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  profile: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  skills: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  aptitude: 'M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8 7h8M8 12h2M14 12h2M8 16h2M14 16h2',
  coding: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
  readiness: 'M21.2 15.9A10 10 0 1 1 8 2.8M22 12A10 10 0 0 0 12 2v10z',
  careers: 'M3 7h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM16 7V4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3M2 13h20',
  gaps: 'M12 20V10M18 20V4M6 20v-4',
  roadmap: 'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15',
  progress: 'M22 7l-8.5 8.5-5-5L2 17M16 7h6v6',
  resources: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
  settings: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  students: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  menu: 'M3 12h18M3 6h18M3 18h18',
  close: 'M18 6L6 18M6 6l12 12',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  arrow: 'M5 12h14M12 5l7 7-7 7',
  back: 'M19 12H5M12 19l-7-7 7-7',
  upright: 'M7 17L17 7M8 7h9v9',
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',
  check: 'M20 6L9 17l-5-5',
  flame: 'M12 22a7 7 0 0 0 7-7c0-3-1.5-5-3-7-1 2-2 3-3.5 3 0-3-1-5.5-3.5-8C8 6 5 10 5 15a7 7 0 0 0 7 7z',
  test: 'M9 3h6v3H9zM6 5H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-1M9 14l2 2 4-4',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeoff: 'M17.9 17.9A10.1 10.1 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M1 1l22 22M14.1 14.1a3 3 0 1 1-4.2-4.2',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  spark: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z',
}

export const Icon = ({ name, size = 18, className = '' }) => (
  <svg className={`i ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={PATHS[name]} /></svg>
)

export const Logo = () => <div className="logo"><i><Icon name="upright" size={18} /></i><span>Place<b>Ready</b></span></div>

export function ThemeToggle() {
  const [t, setT] = useState(() => document.documentElement.getAttribute('data-theme') || 'light')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', t)
    try { localStorage.setItem('pr-theme', t) } catch { /* ignore */ }
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', t === 'dark' ? '#090d1f' : '#f6f7fb')
  }, [t])
  const dark = t === 'dark'
  return (
    <button type="button" className="icon-btn" aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} title={dark ? 'Light theme' : 'Dark theme'}
      onClick={() => setT(dark ? 'light' : 'dark')}><Icon name={dark ? 'sun' : 'moon'} /></button>
  )
}

export function Footer({ full = false }) {
  const year = new Date().getFullYear()
  if (!full) {
    return <footer className="appfoot"><span>© {year} PlaceReady</span><span>Scores and dashboards use sample data for demonstration.</span></footer>
  }
  return (
    <footer className="foot">
      <div className="wrap foot-grid">
        <div className="foot-brand">
          <Logo />
          <p>Know where you stand, see what to work on next, and get ready for placement season.</p>
        </div>
        <nav aria-label="Product">
          <h4>Product</h4>
          <a href="#features">Features</a><a href="#how">How it works</a><a href="#top">Back to top</a>
        </nav>
        <nav aria-label="Account">
          <h4>Get started</h4>
          <Link to="/login">Sign in</Link><Link to="/login?mode=signup">Create an account</Link>
        </nav>
        <nav aria-label="Who it is for">
          <h4>Built for</h4>
          <span>Students</span><span>Placement officers</span>
        </nav>
      </div>
      <div className="wrap foot-bottom">
        <span>© {year} PlaceReady. All rights reserved.</span>
        <span>Scores and dashboards use sample data for demonstration.</span>
      </div>
    </footer>
  )
}

export const levelTone = (level) =>
  ({ 'Placement Ready': 's-good', Ready: 's-good', Developing: 's-warn', Beginner: 's-bad' }[level] || 's-brand')

export const tone = (v) => (v >= 75 ? 'good' : v >= 55 ? 'electric' : v >= 40 ? 'warn' : 'bad')

export const fmtDate = (s) => {
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00` : s)
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function Gauge({ value, label }) {
  const r = 78, c = 2 * Math.PI * r
  return (
    <div className="gauge" role="img" aria-label={`${label}: ${value} percent`}>
      <svg viewBox="0 0 180 180" aria-hidden="true">
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgb(var(--surface-2))" strokeWidth="12" />
        <circle className="arc" cx="90" cy="90" r={r} fill="none" stroke={`rgb(var(--${tone(value)}))`} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <div className="num"><b>{value}<small>%</small></b><span>{label}</span></div>
    </div>
  )
}

export const Metric = ({ label, value, note }) => (
  <div className="metric">
    <div className="row"><span>{label}</span><span>{value}<em>/100</em></span></div>
    <div className="track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
      <div className="fill" style={{ width: `${value}%`, background: `rgb(var(--${tone(value)}))` }} />
    </div>
    {note && <p className="muted note">{note}</p>}
  </div>
)

const Sk = ({ w, h = 12, r, style }) => <span className="sk" style={{ width: w, height: h, borderRadius: r, ...style }} />
const SkCard = ({ rows = 4, circle = false }) => (
  <div className="card sk-card">
    <Sk w="45%" h={16} />
    {circle && <Sk w={150} h={150} r="50%" style={{ margin: '8px auto' }} />}
    {Array.from({ length: rows }, (_, i) => <div key={i} className="sk-row"><Sk w={`${60 + ((i * 17) % 30)}%`} /><Sk h={8} /></div>)}
  </div>
)

function Skeleton({ variant }) {
  if (variant === 'table') {
    return (
      <>
        <div className="pagehead"><Sk w="40%" h={26} /><Sk w="60%" h={12} style={{ marginTop: 8 }} /></div>
        <div className="tablewrap"><div className="sk-table">
          {Array.from({ length: 7 }, (_, i) => <div key={i} className="sk-tr"><Sk w="14%" /><Sk w="34%" /><Sk w="18%" /><Sk w="14%" /></div>)}
        </div></div>
      </>
    )
  }
  if (variant === 'overview') {
    return (
      <>
        <div className="welcome"><div className="hello"><Sk w={52} h={52} r={16} /><div style={{ flex: 1 }}><Sk w="30%" h={12} /><Sk w="60%" h={26} style={{ marginTop: 10 }} /></div></div>
          <div className="pills"><Sk w={150} h={30} r={999} /><Sk w={190} h={30} r={999} /></div></div>
        <div className="kpis">{[0, 1, 2].map((i) => <div key={i} className="card kpi"><Sk w={26} h={22} /><Sk w="70%" h={10} /></div>)}</div>
        <div className="grid3"><SkCard circle rows={1} /><SkCard rows={4} /><SkCard rows={3} /></div>
      </>
    )
  }
  return (
    <>
      <div className="pagehead"><Sk w="40%" h={26} /><Sk w="60%" h={12} style={{ marginTop: 8 }} /></div>
      <div className="grid3"><SkCard /><SkCard /><SkCard /></div>
    </>
  )
}

export function Loading({ page = false, variant = 'cards' }) {
  const [slow, setSlow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setSlow(true), 5000); return () => clearTimeout(t) }, [])
  return (
    <div className={page ? 'splash' : ''} role="status" aria-live="polite" aria-busy="true">
      {page ? <span className="spinner" /> : <Skeleton variant={variant} />}
      <span className="sr">Loading</span>
      {slow && <p className="muted note" style={{ marginTop: 14, textAlign: page ? 'center' : 'left' }}>Still loading. The server may be waking up after a quiet period, which can take up to a minute.</p>}
    </div>
  )
}

export const ErrorNote = ({ children }) => (
  <div className="alert" role="alert">
    <span>{children || 'Something went wrong while loading this page.'}</span>
    <button type="button" className="btn" onClick={() => window.location.reload()}>Try again</button>
  </div>
)
