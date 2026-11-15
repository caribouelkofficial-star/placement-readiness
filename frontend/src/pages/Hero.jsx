import { useEffect, useRef, useState } from 'react'
import { Gauge, Metric, Icon, levelTone } from '../ui'

const WORDS = ['placement', 'interview', 'coding', 'career']
const PROFILES = [
  { name: 'Aarav S.', branch: 'CSE', score: 86, level: 'Placement Ready', cats: [['Aptitude', 82], ['Coding', 90], ['Communication', 79]], role: 'Backend Developer', match: 91 },
  { name: 'Priya N.', branch: 'IT', score: 72, level: 'Ready', cats: [['Aptitude', 70], ['Coding', 71], ['Communication', 78]], role: 'Data Analyst', match: 84 },
  { name: 'Karan S.', branch: 'AI&DS', score: 58, level: 'Developing', cats: [['Aptitude', 55], ['Coding', 50], ['Communication', 66]], role: 'QA Engineer', match: 77 },
]
const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function useCount(target, ms = 1200) {
  const [n, setN] = useState(reduced() ? target : 0)
  useEffect(() => {
    if (reduced()) return
    let raf, t0
    const tick = (t) => { t0 ??= t; const p = Math.min(1, (t - t0) / ms); setN(Math.round(target * (1 - (1 - p) ** 3))); if (p < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return n
}

const Stat = ({ value, suffix = '', label }) => { const n = useCount(value); return <div className="hstat"><b>{n}{suffix}</b><span>{label}</span></div> }

export default function Hero({ onSignup, onLogin }) {
  const [word, setWord] = useState(0)
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const wrap = useRef(null)

  useEffect(() => {
    if (reduced()) return
    const t = setInterval(() => setWord((w) => (w + 1) % WORDS.length), 2400)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (reduced() || paused) return
    const t = setInterval(() => setIdx((i) => (i + 1) % PROFILES.length), 4200)
    return () => clearInterval(t)
  }, [paused])

  // Subtle pointer parallax on the preview (pointer devices only).
  const onMove = (e) => {
    if (reduced() || e.pointerType === 'touch' || !wrap.current) return
    const r = wrap.current.getBoundingClientRect()
    wrap.current.style.setProperty('--rx', `${((e.clientX - r.left) / r.width - 0.5) * 8}px`)
    wrap.current.style.setProperty('--ry', `${((e.clientY - r.top) / r.height - 0.5) * 8}px`)
  }

  const p = PROFILES[idx]
  return (
    <section className="hero">
      <div>
        <span className="badge"><Icon name="spark" size={14} />Skill-based career guidance</span>
        <h1>Know your potential.<br />Get <span className="rot-wrap" aria-hidden="true"><span className="rot grad" key={word}>{WORDS[word]}</span></span> <span className="grad">ready.</span></h1>
        <span className="sr">Know your potential. Get placement ready.</span>
        <p className="lead">PlaceReady measures your readiness across academics, aptitude, coding and communication, then points you to the skills and roles to focus on.</p>
        <div className="cta">
          <button type="button" className="btn primary lg" onClick={onSignup}>Check my readiness<Icon name="arrow" size={16} /></button>
          <button type="button" className="btn lg" onClick={onLogin}>I have an account</button>
        </div>
        <div className="hstats">
          <Stat value={4} label="scored areas" /><Stat value={12} label="student screens" /><Stat value={100} label="point scale" />
        </div>
      </div>

      <div className="hero-vis" ref={wrap} onPointerMove={onMove} onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
        <div className="float f1" aria-hidden="true"><Icon name="careers" size={16} /><div><small>Top match</small><b key={p.role} className="swap">{p.role} · {p.match}%</b></div></div>
        <div className="card preview" aria-live="off" aria-label="Sample dashboard preview">
          <div className="pv-head">
            <div><b className="swap" key={p.name}>{p.name}</b><span className="muted">{p.branch} student</span></div>
            <span className={`status ${levelTone(p.level)}`} style={{ marginTop: 0 }}>{p.level}</span>
          </div>
          <div className="pv-body">
            <Gauge value={p.score} label="Readiness" />
            <div className="pv-cats">{p.cats.map(([l, v]) => <Metric key={l} label={l} value={v} />)}</div>
          </div>
          <div className="pv-foot">
            <div className="dots" role="tablist" aria-label="Sample profiles">
              {PROFILES.map((x, i) => <button key={x.name} type="button" role="tab" aria-selected={i === idx} aria-label={`Show ${x.name}`} className={i === idx ? 'on' : ''} onClick={() => setIdx(i)} />)}
            </div>
            <span className="muted note">Sample profiles for illustration.</span>
          </div>
        </div>
        <div className="float f2" aria-hidden="true"><Icon name="flame" size={16} /><div><small>Practice streak</small><b>{6 + idx * 3} days</b></div></div>
      </div>
    </section>
  )
}
