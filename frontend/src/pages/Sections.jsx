import { useEffect, useState } from 'react'
import { api } from '../api'
import { Gauge, Metric, levelTone, tone } from '../ui'
import { DEMO_MSG, useSection, useToast } from '../data'

function Load({ s, children }) {
  if (s.err) return <p className="error">{s.err}</p>
  if (!s.data) return <p className="muted">Loading…</p>
  return children(s.data)
}
const Head = ({ title, sub }) => <div style={{ marginBottom: 18 }}><h1 className="ph">{title}</h1>{sub && <p className="muted">{sub}</p>}</div>
const Chips = ({ items }) => <>{items.map((s) => <span className="chip" key={s}>{s}</span>)}</>
const diffClass = { Easy: 's-good', Medium: 's-warn', Hard: 's-bad' }

export function Overview() {
  const s = useSection('overview')
  return <Load s={s}>{(d) => (
    <>
      <div className="welcome">
        <p className="muted">✦ {d.profile.branch ? `${d.profile.branch} student` : 'Student'}</p>
        <h1>{d.profile.fullName}</h1>
        {d.profile.phone && <p className="muted">📞 {d.profile.phone} · {d.profile.email}</p>}
        <p className="muted">Readiness <b>{d.readiness.score}%</b> · <b>{d.readiness.level}</b> · assessment coverage {d.assessmentCoverage}%</p>
      </div>
      <div className="grid3">
        <section className="card" style={{ display: 'grid', justifyItems: 'center', alignContent: 'start' }}>
          <h2 style={{ justifySelf: 'start' }}>Placement readiness</h2>
          <Gauge value={d.readiness.score} label="Readiness" />
          <span className={`status ${levelTone(d.readiness.level)}`}>{d.readiness.level}</span>
        </section>
        <section className="card"><h2>Core competencies</h2>
          {d.competencies.map((c) => <Metric key={c.label} label={c.label} value={c.value} note={`Weight ${c.weight}%`} />)}
        </section>
        <section className="card"><h2>Top career matches</h2>
          {d.topCareers.map((c, i) => (
            <div className="career" key={c.slug}><i>{i + 1}</i><span style={{ flex: 1 }}>{c.title}</span><b>{c.match}%</b></div>
          ))}
        </section>
      </div>
      <div className="grid3" style={{ marginTop: 20 }}>
        <section className="card stat"><b>{d.stats.testsTaken}</b><span>Tests taken</span></section>
        <section className="card stat"><b>{d.stats.problemsSolved}</b><span>Problems solved</span></section>
        <section className="card stat"><b>{d.stats.streakDays} days</b><span>Practice streak</span></section>
      </div>
      <section className="card" style={{ marginTop: 20 }}><h2>Recent activity</h2>
        <ul className="plain">{d.recentActivity.map((a, i) => <li key={i}><span>{a.text}</span><span className="muted">{a.date}</span></li>)}</ul>
      </section>
    </>
  )}</Load>
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
        <section className="card"><h2>Projects</h2>
          {d.projects.map((p) => <div key={p.name} style={{ marginBottom: 12 }}><b>{p.name}</b><div className="muted" style={{ fontSize: 13 }}>{p.tech}</div><div style={{ fontSize: 13 }}>{p.summary}</div></div>)}
        </section>
      </div>
    </>
  )}</Load>
}

export function Skills() {
  const s = useSection('skills')
  const toast = useToast()
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
        <p style={{ marginTop: 18 }}><button className="btn primary" onClick={() => toast(DEMO_MSG)}>Retake skill assessment</button></p>
      </>
    )
  }}</Load>
}

export function Aptitude() {
  const s = useSection('aptitude')
  const toast = useToast()
  return <Load s={s}>{(d) => (
    <>
      <Head title="Aptitude test" sub={`Overall aptitude score: ${d.overall}/100`} />
      <div className="grid3">
        {d.sections.map((x) => (
          <section className="card" key={x.name}><h2>{x.name}</h2><Metric label={`${x.correct}/${x.questions} correct`} value={x.score} /></section>
        ))}
      </div>
      <section className="card" style={{ marginTop: 20 }}><h2>Attempt history</h2>
        <div className="tablewrap"><table><thead><tr><th>Date</th><th>Score</th><th>Duration</th></tr></thead>
          <tbody>{d.attempts.map((a) => <tr key={a.date}><td>{a.date}</td><td>{a.score}%</td><td>{a.durationMin} min</td></tr>)}</tbody></table></div>
        <p style={{ marginTop: 14 }}><button className="btn primary" onClick={() => toast(DEMO_MSG)}>Start a new test</button></p>
      </section>
    </>
  )}</Load>
}

export function Coding() {
  const s = useSection('coding')
  const toast = useToast()
  return <Load s={s}>{(d) => (
    <>
      <Head title="Coding test" sub={`${d.solved}/${d.total} problems solved · ${d.streakDays}-day streak · ${d.languages.join(', ')}`} />
      <div className="tablewrap"><table>
        <thead><tr><th>#</th><th>Problem</th><th>Topic</th><th>Difficulty</th><th>Status</th><th /></tr></thead>
        <tbody>{d.problems.map((p) => (
          <tr key={p.id}><td>{p.id}</td><td><b>{p.title}</b></td><td>{p.topic}</td>
            <td><span className={`status ${diffClass[p.difficulty]}`} style={{ marginTop: 0 }}>{p.difficulty}</span></td>
            <td>{p.status}</td><td><button className="linkbtn" onClick={() => toast(DEMO_MSG)}>{p.status === 'Solved' ? 'Review' : 'Open'}</button></td></tr>
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
        <section className="card" style={{ display: 'grid', justifyItems: 'center' }}>
          <Gauge value={d.score} label="Readiness" /><span className={`status ${levelTone(d.level)}`}>{d.level}</span>
        </section>
        <section className="card" style={{ gridColumn: 'span 2' }}><h2>Score breakdown</h2>
          <div className="tablewrap"><table><thead><tr><th>Category</th><th>Score</th><th>Weight</th><th>Adds</th></tr></thead>
            <tbody>{d.formula.map((f) => <tr key={f.label}><td>{f.label}</td><td>{f.value}</td><td>{f.weight}%</td><td>{f.contribution}</td></tr>)}</tbody></table></div>
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
        <section className="card" style={{ gridColumn: 'span 2' }}><h2>Current vs required</h2>
          {d.gaps.map((g) => (
            <div className="metric" key={g.skill}>
              <div className="row"><span>{g.skill}</span><span>{g.current}<em> / {g.required} required</em></span></div>
              <div className="track" style={{ position: 'relative' }}>
                <div className="fill" style={{ width: `${g.current}%`, background: `rgb(var(--${g.gap > 0 ? 'warn' : 'good'}))` }} />
                <div className="marker" style={{ left: `${g.required}%` }} />
              </div>
            </div>
          ))}
        </section>
        <section className="card"><h2>Suggested resources</h2>
          {d.resources.length === 0 ? <p className="muted">No gaps to close. Nice work.</p> :
            <ul className="plain">{d.resources.map((r) => <li key={r.id}><span><b>{r.title}</b><div className="muted" style={{ fontSize: 12 }}>{r.type} · {r.skill}</div></span><span className="muted">{r.duration}</span></li>)}</ul>}
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
    const W = 560, H = 200, pad = 28, pts = d.weekly.map((w, i) => [pad + (i * (W - 2 * pad)) / (d.weekly.length - 1), H - pad - (w.score / 100) * (H - 2 * pad)])
    return (
      <>
        <Head title="Progress tracker" sub={`${d.change >= 0 ? '+' : ''}${d.change} points over the last 8 weeks`} />
        <div className="grid3">
          <section className="card" style={{ gridColumn: 'span 2' }}><h2>Weekly readiness score</h2>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Weekly readiness score">
              <polyline fill="none" stroke="rgb(var(--brand))" strokeWidth="3" points={pts.map((p) => p.join(',')).join(' ')} />
              {pts.map((p, i) => <g key={i}><circle cx={p[0]} cy={p[1]} r="4" fill="rgb(var(--brand))" /><text x={p[0]} y={p[1] - 10} textAnchor="middle" fontSize="11" fill="rgb(var(--muted))">{d.weekly[i].score}</text><text x={p[0]} y={H - 6} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">W{i + 1}</text></g>)}
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
  const toast = useToast()
  if (!rows) return <p className="muted">Loading…</p>
  return (
    <>
      <Head title="Resources" sub="Learning material mapped to skills." />
      <div className="tablewrap"><table><thead><tr><th>Title</th><th>Type</th><th>Skill</th><th>Duration</th><th /></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id}><td><b>{r.title}</b></td><td>{r.type}</td><td>{r.skill}</td><td>{r.duration}</td><td><button className="linkbtn" onClick={() => toast(DEMO_MSG)}>Open</button></td></tr>)}</tbody></table></div>
    </>
  )
}

export function Settings() {
  const toast = useToast()
  const [prefs, setPrefs] = useState({ email: true, weekly: true, share: false })
  return (
    <>
      <Head title="Settings" />
      <section className="card" style={{ maxWidth: 520 }}><h2>Preferences</h2>
        {[['email', 'Email me about new assessments'], ['weekly', 'Weekly progress summary'], ['share', 'Share my profile with the placement cell']].map(([k, label]) => (
          <label className="task" key={k}><input type="checkbox" checked={prefs[k]} onChange={() => setPrefs({ ...prefs, [k]: !prefs[k] })} />{label}</label>
        ))}
        <p style={{ marginTop: 14 }}><button className="btn primary" onClick={() => toast('Preferences saved (demo).')}>Save</button></p>
      </section>
    </>
  )
}
