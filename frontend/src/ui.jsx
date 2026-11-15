import { useEffect, useState } from 'react'

export const Logo = () => <div className="logo"><i>↗</i><span>Place<b>Ready</b></span></div>

export function ThemeToggle() {
  const [t, setT] = useState(() => document.documentElement.getAttribute('data-theme') || 'light')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', t)
    try { localStorage.setItem('pr-theme', t) } catch { /* ignore */ }
  }, [t])
  return <button className="icon-btn" aria-label="Toggle theme" onClick={() => setT(t === 'dark' ? 'light' : 'dark')}>{t === 'dark' ? '☀' : '☾'}</button>
}

export const levelTone = (level) =>
  ({ 'Placement Ready': 's-good', Ready: 's-good', Developing: 's-warn', Beginner: 's-bad' }[level] || 's-brand')

export const tone = (v) => (v >= 75 ? 'good' : v >= 55 ? 'electric' : v >= 40 ? 'warn' : 'bad')

export function Gauge({ value, label }) {
  const r = 78, c = 2 * Math.PI * r
  return (
    <div className="gauge">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgb(var(--surface-2))" strokeWidth="12" />
        <circle cx="90" cy="90" r={r} fill="none" stroke={`rgb(var(--${tone(value)}))`} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <div className="num"><b>{value}<small>%</small></b><span>{label}</span></div>
    </div>
  )
}

export const Metric = ({ label, value, note }) => (
  <div className="metric">
    <div className="row"><span>{label}</span><span>{value}<em>/100</em></span></div>
    <div className="track"><div className="fill" style={{ width: `${value}%`, background: `rgb(var(--${tone(value)}))` }} /></div>
    {note && <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>{note}</p>}
  </div>
)
