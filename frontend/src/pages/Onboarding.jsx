import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { Logo, ThemeToggle, Loading, ErrorNote } from '../ui'

const SKILLS = ['Java', 'SQL', 'Python', 'React', 'Data Structures', 'Algorithms', 'System Design', 'REST APIs', 'Git', 'DBMS',
  'Operating Systems', 'Computer Networks', 'OOP', 'Spring Boot', 'Testing', 'Cloud Basics']
const DEGREES = ['B.Tech', 'B.E.', 'BCA', 'B.Sc (CS/IT)', 'M.Tech', 'MCA']
const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'AI&DS', 'Other']
const YEARS = [2026, 2027, 2028, 2029, 2030]
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const STEPS = ['About you', 'Academics & skills', 'Experience & goals']

const EMPTY = {
  fullName: '', college: '', degree: 'B.Tech', branch: 'CSE', graduationYear: 2027, location: '',
  cgpa: '', tenthPct: '', twelfthPct: '', backlogs: 0, skills: [], experienceLevel: 'Beginner',
  practiceHoursPerWeek: 3, problemsSolved: 0, projects: 0, internships: 0, certifications: '',
  aptitudeRating: 3, communicationRating: 3, targetRole: '', bio: '',
}

const inRange = (v, lo, hi) => v !== '' && !Number.isNaN(Number(v)) && Number(v) >= lo && Number(v) <= hi

function check(step, f) {
  if (step === 0) {
    if (!f.fullName.trim()) return 'Enter your full name'
    if (!f.college.trim()) return 'Enter your college name'
    if (!f.location.trim()) return 'Enter your city'
  }
  if (step === 1) {
    if (!inRange(f.cgpa, 0, 10)) return 'CGPA must be between 0 and 10'
    if (!inRange(f.tenthPct, 0, 100) || !inRange(f.twelfthPct, 0, 100)) return '10th and 12th percentages must be between 0 and 100'
    if (!inRange(f.backlogs, 0, 30)) return 'Backlogs must be between 0 and 30'
    if (f.skills.length === 0) return 'Pick at least one skill'
  }
  if (step === 2) {
    if (!inRange(f.practiceHoursPerWeek, 0, 60)) return 'Practice hours must be between 0 and 60'
    if (!inRange(f.problemsSolved, 0, 5000) || !inRange(f.projects, 0, 30) || !inRange(f.internships, 0, 10)) return 'Check the numbers for problems, projects and internships'
    if (!f.targetRole) return 'Choose a target role'
  }
  return null
}

function Rating({ value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="seg">
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n} role="radio" aria-checked={value === n} className={value === n ? 'on' : ''} onClick={() => onChange(n)}>{n}</button>
      ))}
    </div>
  )
}

export default function Onboarding() {
  const { session, me, loading, refreshMe } = useAuth()
  const navigate = useNavigate()
  const [f, setF] = useState(EMPTY)
  const [roles, setRoles] = useState([])
  const [ready, setReady] = useState(false)
  const [step, setStep] = useState(0)
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
  const [loadErr, setLoadErr] = useState(false)

  useEffect(() => {
    if (!me || me.role !== 'student') return
    Promise.all([api.roles(), api.onboarding()])
      .then(([r, saved]) => {
        setRoles(r)
        setF(saved ? { ...EMPTY, ...saved } : { ...EMPTY, fullName: me.fullName || '' })
        setReady(true)
      })
      .catch(() => setLoadErr(true))
  }, [me])

  if (loading) return <Loading page />
  if (!session) return <Navigate to="/" replace />
  if (me && me.role !== 'student') return <Navigate to="/" replace />
  if (loadErr) return <div className="splash"><ErrorNote>Could not load the form. Please refresh.</ErrorNote></div>
  if (!ready) return <Loading page />

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const num = (k) => (e) => set(k, e.target.value)
  const toggleSkill = (s) => set('skills', f.skills.includes(s) ? f.skills.filter((x) => x !== s) : [...f.skills, s])

  const next = () => {
    const m = check(step, f)
    setErr(m)
    if (!m) setStep(step + 1)
  }
  const submit = async (e) => {
    e.preventDefault()
    const m = check(2, f)
    if (m) return setErr(m)
    setBusy(true); setErr(null)
    try {
      await api.saveOnboarding({
        ...f, fullName: f.fullName.trim(), college: f.college.trim(), location: f.location.trim(),
        cgpa: Number(f.cgpa), tenthPct: Number(f.tenthPct), twelfthPct: Number(f.twelfthPct), backlogs: Number(f.backlogs),
        practiceHoursPerWeek: Number(f.practiceHoursPerWeek), problemsSolved: Number(f.problemsSolved),
        projects: Number(f.projects), internships: Number(f.internships), graduationYear: Number(f.graduationYear),
      })
      await refreshMe()
      navigate('/', { replace: true })
    } catch (ex) {
      setErr(ex.detail || 'Could not save your details. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="onb">
      <header className="onb-top"><Logo /><ThemeToggle /></header>
      <form className="card onb-card" onSubmit={submit} noValidate>
        <ol className="steps" aria-label="Progress">
          {STEPS.map((s, i) => <li key={s} className={i === step ? 'on' : i < step ? 'done' : ''} aria-current={i === step ? 'step' : undefined}><b>{i + 1}</b><span>{s}</span></li>)}
        </ol>
        <h1 className="ph">{me?.onboarded ? 'Update your details' : 'Set up your profile'}</h1>
        <p className="muted" style={{ marginBottom: 18 }}>Your dashboard, skill gaps and career matches are built from these answers.</p>

        {step === 0 && (
          <div className="fgrid">
            <label className="field span2">Full name<input value={f.fullName} onChange={(e) => set('fullName', e.target.value)} autoComplete="name" /></label>
            <label className="field span2">College<input value={f.college} onChange={(e) => set('college', e.target.value)} placeholder="e.g. Meridian University" /></label>
            <label className="field">Degree<select value={f.degree} onChange={(e) => set('degree', e.target.value)}>{DEGREES.map((d) => <option key={d}>{d}</option>)}</select></label>
            <label className="field">Branch<select value={f.branch} onChange={(e) => set('branch', e.target.value)}>{BRANCHES.map((d) => <option key={d}>{d}</option>)}</select></label>
            <label className="field">Graduation year<select value={f.graduationYear} onChange={(e) => set('graduationYear', e.target.value)}>{YEARS.map((d) => <option key={d}>{d}</option>)}</select></label>
            <label className="field">City<input value={f.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Pune" /></label>
          </div>
        )}

        {step === 1 && (
          <div className="fgrid">
            <label className="field">CGPA (out of 10)<input type="number" step="0.01" min="0" max="10" inputMode="decimal" value={f.cgpa} onChange={num('cgpa')} /></label>
            <label className="field">Active backlogs<input type="number" min="0" max="30" value={f.backlogs} onChange={num('backlogs')} /></label>
            <label className="field">10th percentage<input type="number" min="0" max="100" value={f.tenthPct} onChange={num('tenthPct')} /></label>
            <label className="field">12th percentage<input type="number" min="0" max="100" value={f.twelfthPct} onChange={num('twelfthPct')} /></label>
            <div className="field span2">Skills you know
              <div className="chips" role="group" aria-label="Skills">
                {SKILLS.map((s) => <button type="button" key={s} aria-pressed={f.skills.includes(s)} className={`tog${f.skills.includes(s) ? ' on' : ''}`} onClick={() => toggleSkill(s)}>{s}</button>)}
              </div>
            </div>
            <div className="field span2">Overall coding level
              <div className="seg" role="radiogroup" aria-label="Coding level">
                {LEVELS.map((l) => <button type="button" key={l} role="radio" aria-checked={f.experienceLevel === l} className={f.experienceLevel === l ? 'on' : ''} onClick={() => set('experienceLevel', l)}>{l}</button>)}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fgrid">
            <label className="field">Practice hours per week<input type="number" min="0" max="60" value={f.practiceHoursPerWeek} onChange={num('practiceHoursPerWeek')} /></label>
            <label className="field">Coding problems solved (approx.)<input type="number" min="0" max="5000" value={f.problemsSolved} onChange={num('problemsSolved')} /></label>
            <label className="field">Projects built<input type="number" min="0" max="30" value={f.projects} onChange={num('projects')} /></label>
            <label className="field">Internships<input type="number" min="0" max="10" value={f.internships} onChange={num('internships')} /></label>
            <label className="field span2">Certifications <span className="hint">Comma separated, optional</span>
              <input value={f.certifications} onChange={(e) => set('certifications', e.target.value)} placeholder="e.g. AWS Cloud Practitioner, NPTEL DSA" /></label>
            <div className="field">Aptitude (self rating)<Rating value={f.aptitudeRating} onChange={(n) => set('aptitudeRating', n)} label="Aptitude rating" /></div>
            <div className="field">Communication (self rating)<Rating value={f.communicationRating} onChange={(n) => set('communicationRating', n)} label="Communication rating" /></div>
            <label className="field span2">Target role
              <select value={f.targetRole} onChange={(e) => set('targetRole', e.target.value)}>
                <option value="">Select a role</option>{roles.map((r) => <option key={r.slug}>{r.title}</option>)}
              </select></label>
            <label className="field span2">About you <span className="hint">Optional, up to 500 characters</span>
              <textarea rows="3" maxLength={500} value={f.bio} onChange={(e) => set('bio', e.target.value)} /></label>
          </div>
        )}

        {err && <p className="error" role="alert" style={{ marginTop: 14 }}>{err}</p>}
        <div className="onb-actions">
          {step > 0 && <button type="button" className="btn" onClick={() => { setErr(null); setStep(step - 1) }}>Back</button>}
          {step < 2
            ? <button type="button" className="btn primary" onClick={next}>Continue</button>
            : <button type="submit" className="btn primary" disabled={busy}>{busy ? 'Building your dashboard…' : 'Finish and view dashboard'}</button>}
        </div>
      </form>
    </div>
  )
}
