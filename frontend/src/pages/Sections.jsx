import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Gauge, Metric, Icon, Loading, ErrorNote, levelTone, tone, fmtDate } from '../ui'
import { useComingSoon, useSection } from '../data'

function Load({ s, v, children }) {
  if (s.err === 'pending') return <div className="card empty-card"><h2>Onboarding pending</h2><p className="muted">This student has signed up but hasn’t completed onboarding yet, so there’s nothing to show.</p></div>
  if (s.err) return <ErrorNote>Could not load this page.</ErrorNote>
  if (!s.data) return <Loading variant={v} />
  return children(s.data)
}
const Head = ({ title, sub }) => <div className="pagehead"><h1 className="ph">{title}</h1>{sub && <p className="muted">{sub}</p>}</div>
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`
const Chips = ({ items }) => <>{items.map((s) => <span className="chip" key={s}>{s}</span>)}</>
const diffClass = { Easy: 's-good', Medium: 's-warn', Hard: 's-bad' }

export function Overview() {
  const s = useSection('overview')
  return <Load s={s} v="overview">{(d) => {
    const p = d.profile, first = (p.fullName || '').trim().split(/\s+/)[0]
    const initials = (p.fullName || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    return (
    <>
      <div className="welcome">
        <div className="hello">
          <span className="av" aria-hidden="true">{initials}</span>
          <div style={{ minWidth: 0 }}>
            <p className="eyebrow"><Icon name="spark" size={14} />{p.branch ? `${p.branch} student` : 'Student'}</p>
            <h1>{greeting()}, {first}</h1>
          </div>
        </div>
        <p className="sub" style={{ marginTop: 10 }}>Your readiness is <b>{d.readiness.score}%</b> ({d.readiness.level}) with {d.assessmentCoverage}% of assessments completed.</p>
        <div className="pills">
          {p.phone && <a className="pill" href={`tel:${p.phone.replace(/[^+\d]/g, '')}`}><Icon name="phone" size={14} /><span>{p.phone}</span></a>}
          {p.email && <span className="pill"><Icon name="mail" size={14} /><span>{p.email}</span></span>}
        </div>
      </div>

      <div className="kpis">
        <div className="card kpi"><span className="ki"><Icon name="test" size={20} /></span><div><b>{d.stats.testsTaken}</b><span>Tests taken</span></div></div>
        <div className="card kpi"><span className="ki"><Icon name="coding" size={20} /></span><div><b>{d.stats.problemsSolved}</b><span>Problems solved</span></div></div>
        <div className="card kpi"><span className="ki"><Icon name="flame" size={20} /></span><div><b>{plural(d.stats.streakDays, 'day')}</b><span>Practice streak</span></div></div>
      </div>

      <div className="grid3">
        <section className="card center-col" aria-labelledby="h-ready">
          <div className="card-head"><h2 id="h-ready">Placement readiness</h2></div>
          <Gauge value={d.readiness.score} label="Readiness" />
          <span className={`status ${levelTone(d.readiness.level)}`}>{d.readiness.level}</span>
        </section>
        <section className="card" aria-labelledby="h-comp"><div className="card-head"><h2 id="h-comp">Core competencies</h2></div>
          {d.competencies.map((c) => <Metric key={c.label} label={c.label} value={c.value} note={`Weight ${c.weight}%`} />)}
        </section>
        <section className="card" aria-labelledby="h-car"><div className="card-head"><h2 id="h-car">Top career matches</h2></div>
          {d.topCareers.length === 0 ? <p className="empty">No matches yet.</p> : d.topCareers.map((c, i) => (
            <div className="career" key={c.slug}><i>{i + 1}</i>
              <span>{c.title}<span className="mini" aria-hidden="true"><u style={{ width: `${c.match}%` }} /></span></span>
              <b>{c.match}%</b></div>
          ))}
        </section>
      </div>

      <section className="card mt" aria-labelledby="h-act"><div className="card-head"><h2 id="h-act">Recent activity</h2></div>
        {d.recentActivity.length === 0 ? <p className="empty">No activity yet. Take a test to get started.</p> :
          <ul className="plain timeline">{d.recentActivity.map((a, i) => <li key={i}><span>{a.text}</span><span className="muted">{fmtDate(a.date)}</span></li>)}</ul>}
      </section>
    </>
    )
  }}</Load>
}

export function Profile() {
  const s = useSection('profile')
  return <Load s={s}>{(d) => (
    <>
      <Head title="Profile" sub={`${d.degree} · ${d.branch} · ${d.college}`} />
      <div className="grid3">
        <section className="card"><h2>Details</h2>
          <dl className="kv">
            <dt>Name</dt><dd>{d.fullName}</dd><dt>Email</dt><dd>{d.email}</dd><dt>Phone</dt><dd>{d.phone}</dd>
            <dt>Location</dt><dd>{d.location}</dd><dt>CGPA</dt><dd>{d.cgpa}</dd><dt>Graduation</dt><dd>{d.graduationYear}</dd>
          </dl>
          <p className="muted" style={{ marginTop: 10 }}>{d.bio}</p>
        </section>
        <section className="card"><h2>Skills</h2><Chips items={d.skills} />
          <h2 style={{ marginTop: 16 }}>Certifications</h2>
          {d.certifications.length ? <ul className="plain">{d.certifications.map((c) => <li key={c}>{c}</li>)}</ul> : <p className="muted">None added yet.</p>}
        </section>
        {d.academicRecord && (
          <section className="card"><h2>Academic record</h2>
            <dl className="kv">
              <dt>10th</dt><dd>{d.academicRecord.tenthPct}%</dd><dt>12th</dt><dd>{d.academicRecord.twelfthPct}%</dd>
              <dt>Backlogs</dt><dd>{d.academicRecord.backlogs}</dd><dt>Internships</dt><dd>{d.academicRecord.internships}</dd>
              <dt>Level</dt><dd>{d.academicRecord.experienceLevel}</dd><dt>Target role</dt><dd>{d.academicRecord.targetRole}</dd>
              <dt>Practice</dt><dd>{d.academicRecord.practiceHoursPerWeek} hrs/week</dd><dt>Solved</dt><dd>{d.academicRecord.problemsSolved} problems</dd>
            </dl>
          </section>
        )}
        <section className="card"><h2>Projects</h2>
          {d.projects.map((p) => <div key={p.name} style={{ marginBottom: 12 }}><b>{p.name}</b><div className="muted" style={{ fontSize: 13 }}>{p.tech}</div><div style={{ fontSize: 13 }}>{p.summary}</div></div>)}
        </section>
      </div>
    </>
  )}</Load>
}

export function Skills() {
  const s = useSection('skills')
  const soon = useComingSoon()
  return <Load s={s}>{(d) => {
    const cats = [...new Set(d.map((x) => x.category))]
    return (
      <>
        <Head title="Skill assessment" sub="Self-assessed and test-derived proficiency per skill." />
        <div className="grid3">
          {cats.map((c) => (
            <section className="card" key={c}><h2>{c}</h2>
              {d.filter((x) => x.category === c).map((x) => <Metric key={x.name} label={x.name} value={x.level} note={x.rating} />)}
            </section>
          ))}
        </div>
        <p className="rowbtn"><button className="btn primary" onClick={() => soon('Skill assessment')}>Retake skill assessment</button></p>
      </>
    )
  }}</Load>
}

export function Aptitude() {
  const s = useSection('aptitude')
  const soon = useComingSoon()
  return <Load s={s}>{(d) => (
    <>
      <Head title="Aptitude test" sub={`Overall aptitude score: ${d.overall}/100`} />
      <div className="grid3">
        {d.sections.map((x) => (
          <section className="card" key={x.name}><h2>{x.name}</h2><Metric label={`${x.correct}/${x.questions} correct`} value={x.score} /></section>
        ))}
      </div>
      <section className="card mt"><h2>Attempt history</h2>
        <div className="tablewrap"><table className="rt"><thead><tr><th>Date</th><th>Score</th><th>Duration</th></tr></thead>
          <tbody>{d.attempts.map((a) => <tr key={a.date}><td className="pri">{fmtDate(a.date)}</td><td data-label="Score">{a.score}%</td><td data-label="Duration">{a.durationMin} min</td></tr>)}</tbody></table></div>
        <p className="rowbtn"><button className="btn primary" onClick={() => soon('Aptitude tests')}>Start a new test</button></p>
      </section>
    </>
  )}</Load>
}

export function Coding() {
  const s = useSection('coding')
  return <Load s={s}>{(d) => (
    <>
      <Head title="Coding test" sub={`${d.solved}/${d.total} problems solved · ${d.streakDays}-day streak · ${d.languages.join(', ')}`} />
      <div className="tablewrap"><table className="rt">
        <thead><tr><th>#</th><th>Problem</th><th>Topic</th><th>Difficulty</th><th>Status</th><th /></tr></thead>
        <tbody>{d.problems.map((p) => (
          <tr key={p.id}><td className="idx">{p.id}</td><td className="pri"><b>{p.title}</b></td><td data-label="Topic">{p.topic}</td>
            <td data-label="Difficulty"><span className={`status ${diffClass[p.difficulty]}`} style={{ marginTop: 0 }}>{p.difficulty}</span></td>
            <td data-label="Status">{p.status}</td><td className="act"><a className="linkbtn" href={p.url} target="_blank" rel="noopener noreferrer">{p.status === 'Solved' ? 'Review' : 'Solve'} ↗</a></td></tr>
        ))}</tbody></table></div>
    </>
  )}</Load>
}

export function Readiness() {
  const s = useSection('readiness')
  return <Load s={s}>{(d) => (
    <>
      <Head title="Readiness analysis" sub="How your score is calculated from your four category scores." />
      <div className="grid3">
        <section className="card center-col">
          <Gauge value={d.score} label="Readiness" /><span className={`status ${levelTone(d.level)}`}>{d.level}</span>
        </section>
        <section className="card span2"><h2>Score breakdown</h2>
          <div className="tablewrap"><table className="rt"><thead><tr><th>Category</th><th>Score</th><th>Weight</th><th>Adds</th></tr></thead>
            <tbody>{d.formula.map((f) => <tr key={f.label}><td className="pri">{f.label}</td><td data-label="Score">{f.value}</td><td data-label="Weight">{f.weight}%</td><td data-label="Adds">{f.contribution}</td></tr>)}</tbody></table></div>
          <p className="callout">{d.insight}</p>
        </section>
      </div>
    </>
  )}</Load>
}

export function Careers() {
  const s = useSection('careers')
  return <Load s={s}>{(d) => (
    <>
      <Head title="Career recommendations" sub="Roles ranked by how well your skill levels match what they need." />
      <div className="grid3">
        {d.map((c) => (
          <section className="card" key={c.slug}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><h2>{c.title}</h2><span className={`status ${tone(c.match) === 'good' ? 's-good' : tone(c.match) === 'bad' ? 's-bad' : 's-warn'}`} style={{ marginTop: 0 }}>{c.match}% match</span></div>
            <p className="muted" style={{ fontSize: 14, marginBottom: 8 }}>{c.description}</p>
            <p style={{ fontSize: 13, marginBottom: 8 }}><b>{c.salary}</b></p>
            {c.matchedSkills.length > 0 && <p><span className="muted" style={{ fontSize: 12 }}>Strong in </span><Chips items={c.matchedSkills} /></p>}
            {c.missingSkills.length > 0 && <p><span className="muted" style={{ fontSize: 12 }}>To improve </span><Chips items={c.missingSkills} /></p>}
          </section>
        ))}
      </div>
    </>
  )}</Load>
}

export function SkillGaps() {
  const s = useSection('skill-gaps')
  return <Load s={s}>{(d) => (
    <>
      <Head title="Skill gap analysis" sub={`Target role: ${d.targetRole} (${d.match}% match)`} />
      <div className="grid3">
        <section className="card span2"><h2>Current vs required</h2>
          {d.gaps.map((g) => (
            <div className="metric" key={g.skill}>
              <div className="row"><span>{g.skill}</span><span>{g.current}<em> / {g.required} required</em></span></div>
              <div className="track gap-track">
                <div className="fill" style={{ width: `${g.current}%`, background: `rgb(var(--${g.gap > 0 ? 'warn' : 'good'}))` }} />
                <div className="marker" style={{ left: `${g.required}%` }} />
              </div>
            </div>
          ))}
        </section>
        <section className="card"><h2>Suggested resources</h2>
          {d.resources.length === 0 ? <p className="muted">No gaps to close. Nice work.</p> :
            <ul className="plain">{d.resources.map((r) => <li key={r.id}><span><a href={r.url} target="_blank" rel="noopener noreferrer"><b>{r.title} ↗</b></a><div className="muted" style={{ fontSize: 12 }}>{r.type} · {r.skill}</div></span><span className="muted">{r.duration}</span></li>)}</ul>}
        </section>
      </div>
    </>
  )}</Load>
}

export function Roadmap() {
  const s = useSection('roadmap')
  const [done, setDone] = useState({})
  return <Load s={s}>{(d) => (
    <>
      <Head title="Learning roadmap" sub={`A 90-day plan toward ${d.targetRole}.`} />
      <div className="grid3">
        {d.phases.map((p, pi) => (
          <section className="card" key={p.name}>
            <h2>{p.name} <span className="muted" style={{ fontWeight: 500 }}>· {p.days}</span></h2>
            <p className="muted" style={{ fontSize: 13, marginBottom: 10 }}>{p.focus}</p>
            {p.tasks.map((t, ti) => {
              const k = `${pi}-${ti}`, on = k in done ? done[k] : t.done
              return <label className="task" key={k}><input type="checkbox" checked={on} onChange={() => setDone({ ...done, [k]: !on })} /><span style={{ textDecoration: on ? 'line-through' : 'none' }}>{t.title}</span></label>
            })}
          </section>
        ))}
      </div>
    </>
  )}</Load>
}

export function Progress() {
  const s = useSection('progress')
  return <Load s={s}>{(d) => {
    const W = 480, H = 220, pad = 30, pts = d.weekly.map((w, i) => [pad + (i * (W - 2 * pad)) / (d.weekly.length - 1), H - pad - (w.score / 100) * (H - 2 * pad)])
    return (
      <>
        <Head title="Progress tracker" sub={`${d.change >= 0 ? '+' : ''}${d.change} points over the last 8 weeks`} />
        <div className="grid3">
          <section className="card span2"><h2>Weekly readiness score</h2>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 600 }} role="img" aria-label="Weekly readiness score">
              <polyline fill="none" stroke="rgb(var(--brand))" strokeWidth="3" points={pts.map((p) => p.join(',')).join(' ')} />
              {pts.map((p, i) => <g key={i}><circle cx={p[0]} cy={p[1]} r="4" fill="rgb(var(--brand))" /><text x={p[0]} y={p[1] - 10} textAnchor="middle" fontSize="12" fill="rgb(var(--muted))">{d.weekly[i].score}</text><text x={p[0]} y={H - 6} textAnchor="middle" fontSize="11" fill="rgb(var(--muted))">W{i + 1}</text></g>)}
            </svg>
          </section>
          <section className="card"><h2>Milestones</h2>
            <ul className="plain">{d.milestones.map((m) => <li key={m.title}><span>{m.title}</span><span className={m.done ? 'ok' : 'muted'}>{m.done ? '✓' : '—'}</span></li>)}</ul>
          </section>
        </div>
      </>
    )
  }}</Load>
}

export function Resources() {
  const [rows, setRows] = useState(null)
  useEffect(() => { api.resources().then(setRows).catch(() => setRows([])) }, [])
  if (!rows) return <Loading variant="table" />
  return (
    <>
      <Head title="Resources" sub="Learning material mapped to skills." />
      <div className="tablewrap"><table className="rt"><thead><tr><th>Title</th><th>Type</th><th>Skill</th><th>Duration</th><th /></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id}><td className="pri"><b>{r.title}</b></td><td data-label="Type">{r.type}</td><td data-label="Skill">{r.skill}</td><td data-label="Duration">{r.duration}</td><td className="act"><a className="linkbtn" href={r.url} target="_blank" rel="noopener noreferrer">Open ↗</a></td></tr>)}</tbody></table></div>
    </>
  )
}

export function Settings() {
  const soon = useComingSoon()
  const [prefs, setPrefs] = useState({ email: true, weekly: true, share: false })
  return (
    <>
      <Head title="Settings" />
      <section className="card" style={{ maxWidth: 520, marginBottom: 16 }}><h2>Profile details</h2>
        <p className="muted" style={{ fontSize: 14 }}>Update your academics, skills and target role. Your dashboard recalculates from these answers.</p>
        <p className="rowbtn"><Link className="btn" to="/onboarding">Edit my details</Link></p>
      </section>
      <section className="card" style={{ maxWidth: 520 }}><h2>Preferences</h2>
        {[['email', 'Email me about new assessments'], ['weekly', 'Weekly progress summary'], ['share', 'Share my profile with the placement cell']].map(([k, label]) => (
          <label className="task" key={k}><input type="checkbox" checked={prefs[k]} onChange={() => setPrefs({ ...prefs, [k]: !prefs[k] })} />{label}</label>
        ))}
        <p className="rowbtn"><button className="btn primary" onClick={() => soon('Saving preferences')}>Save</button></p>
      </section>
    </>
  )
}
