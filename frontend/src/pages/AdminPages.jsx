import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { StudentCtx } from '../data'
import { levelTone } from '../ui'
import * as S from './Sections'

const fmt = (t) => (t ? new Date(t).toLocaleString() : 'Never')
const Head = ({ title, sub }) => <div className="welcome"><p className="muted">Placement cell</p><h1>{title}</h1>{sub && <p className="muted">{sub}</p>}</div>

function useLoad(fn) {
  const [d, setD] = useState({ data: null, err: null })
  useEffect(() => { fn().then((data) => setD({ data, err: null })).catch(() => setD({ data: null, err: 'Failed to load.' })) }, [])  // eslint-disable-line
  return d
}

export function AdminOverview() {
  const { data: d, err } = useLoad(api.adminOverview)
  if (err) return <p className="error">{err}</p>
  if (!d) return <p className="muted">Loading…</p>
  const max = Math.max(1, ...d.levels.map((l) => l.count))
  const order = ['Placement Ready', 'Ready', 'Developing', 'Beginner']
  return (
    <>
      <Head title="Overview" sub="Placement readiness across all students." />
      <div className="stats">
        <div className="card stat"><b>{d.totalStudents}</b><span>Students</span></div>
        <div className="card stat"><b>{d.averageScore}%</b><span>Average readiness</span></div>
        <div className="card stat"><b>{d.activeLast7Days}</b><span>Active in last 7 days</span></div>
      </div>
      <div className="grid3">
        <section className="card"><h2>Readiness levels</h2>
          {order.map((lv) => { const c = d.levels.find((x) => x.level === lv)?.count || 0
            return <div className="metric" key={lv}><div className="row"><span>{lv}</span><span>{c}</span></div><div className="track"><div className="fill" style={{ width: `${(c / max) * 100}%`, background: 'rgb(var(--brand))' }} /></div></div> })}
        </section>
        <section className="card"><h2>By branch</h2>
          <ul className="plain">{d.branches.map((b) => <li key={b.branch}><span>{b.branch} <span className="muted">· {b.count} students</span></span><b>{b.averageScore}%</b></li>)}</ul>
        </section>
        <section className="card"><h2>Recent logins</h2>
          <ul className="plain">{d.recentLogins.map((l, i) => <li key={i}><Link to={`/admin/students/${l.id}/overview`}>{l.fullName}</Link><span className="muted" style={{ fontSize: 12 }}>{fmt(l.at)}</span></li>)}</ul>
        </section>
      </div>
    </>
  )
}

export function AdminStudents() {
  const { data: rows, err } = useLoad(api.adminStudents)
  if (err) return <p className="error">{err}</p>
  if (!rows) return <p className="muted">Loading…</p>
  return (
    <>
      <Head title="Students" sub={`${rows.length} students`} />
      <div className="tablewrap"><table>
        <thead><tr><th>Student</th><th>Branch</th><th>Last login</th><th>Logins</th><th>Readiness</th><th /></tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.id}>
            <td><b>{r.fullName}</b><div className="muted" style={{ fontSize: 12 }}>{r.email}</div></td>
            <td>{r.branch || '—'}</td><td>{fmt(r.lastLoginAt)}</td><td>{r.loginCount}</td>
            <td>{r.score}% <span className={`status ${levelTone(r.level)}`} style={{ marginTop: 0, marginLeft: 6 }}>{r.level}</span></td>
            <td><Link className="linkbtn" to={`/admin/students/${r.id}/overview`}>View →</Link></td>
          </tr>))}</tbody></table></div>
    </>
  )
}

const TABS = [['overview', 'Overview', S.Overview], ['profile', 'Profile', S.Profile], ['skills', 'Skills', S.Skills], ['aptitude', 'Aptitude', S.Aptitude],
  ['coding', 'Coding', S.Coding], ['readiness', 'Readiness', S.Readiness], ['careers', 'Careers', S.Careers], ['skill-gaps', 'Skill gaps', S.SkillGaps],
  ['roadmap', 'Roadmap', S.Roadmap], ['progress', 'Progress', S.Progress]]

export function AdminStudentDetail() {
  const { id, section } = useParams()
  const tab = TABS.find((t) => t[0] === section)
  const [ctx, setCtx] = useState(null)
  useEffect(() => { setCtx({ fetch: (name) => api.adminSection(id, name) }) }, [id])
  if (!tab) return <Navigate to={`/admin/students/${id}/overview`} replace />
  const Page = tab[2]
  return (
    <>
      <p style={{ marginBottom: 12 }}><Link className="linkbtn" to="/admin/students">← All students</Link> <span className="muted">· Viewing as placement officer</span></p>
      <div className="tabs">{TABS.map(([k, label]) => <NavLink key={k} to={`/admin/students/${id}/${k}`}>{label}</NavLink>)}</div>
      {ctx && <StudentCtx.Provider value={ctx}><Page key={`${id}-${section}`} /></StudentCtx.Provider>}
    </>
  )
}

export function AdminRoles() {
  const { data, err } = useLoad(api.adminRoles)
  if (err) return <p className="error">{err}</p>
  if (!data) return <p className="muted">Loading…</p>
  return (
    <>
      <Head title="Career roles" sub="Role definitions and the skill levels each one requires." />
      <div className="grid3">{data.map((r) => (
        <section className="card" key={r.slug}><h2>{r.title}</h2>
          <p className="muted" style={{ fontSize: 14 }}>{r.description}</p><p style={{ margin: '8px 0' }}><b>{r.salary}</b></p>
          {Object.entries(r.required).map(([k, v]) => <span className="chip" key={k}>{k} ≥ {v}</span>)}
        </section>))}</div>
    </>
  )
}

export function AdminResources() {
  return <><Head title="Resources" sub="Learning catalogue shown to students." /><S.Resources /></>
}
