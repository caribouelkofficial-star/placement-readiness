import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { levelTone } from '../ui'

const fmt = (t) => (t ? new Date(t).toLocaleString() : 'Never')

export default function AdminStudents() {
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState(null)
  useEffect(() => { api.adminStudents().then(setRows).catch(() => setErr('Failed to load students.')) }, [])
  if (err) return <p className="error">{err}</p>
  if (!rows) return <p className="muted">Loading…</p>
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length) : 0
  const ready = rows.filter((r) => r.score >= 65).length
  return (
    <>
      <div className="welcome"><p className="muted">Placement cell</p><h1>Students</h1></div>
      <div className="stats">
        <div className="card stat"><b>{rows.length}</b><span>Students</span></div>
        <div className="card stat"><b>{avg}%</b><span>Average readiness</span></div>
        <div className="card stat"><b>{ready}</b><span>Ready or better</span></div>
      </div>
      <div className="tablewrap">
        <table>
          <thead><tr><th>Student</th><th>Branch</th><th>Last login</th><th>Logins</th><th>Readiness</th><th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><b>{r.fullName}</b><div className="muted" style={{ fontSize: 12 }}>{r.email}</div></td>
                <td>{r.branch || '—'}</td><td>{fmt(r.lastLoginAt)}</td><td>{r.loginCount}</td>
                <td>{r.score}% <span className={`status ${levelTone(r.level)}`} style={{ marginTop: 0, marginLeft: 6 }}>{r.level}</span></td>
                <td><Link className="linkbtn" to={`/admin/students/${r.id}`}>View →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
