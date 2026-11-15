import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

const fmt = (t) => (t ? new Date(t).toLocaleString() : 'Never')

export default function AdminStudents() {
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState(null)
  useEffect(() => { api.adminStudents().then(setRows).catch(() => setErr('Failed to load students.')) }, [])
  if (err) return <p className="error">{err}</p>
  if (!rows) return <p>Loading…</p>
  return (
    <>
      <h1>Students</h1>
      <p className="muted">{rows.length} students</p>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Branch</th><th>Last login</th><th>Logins</th><th>Readiness</th><th /></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.fullName}</td><td>{r.email}</td><td>{r.branch || '—'}</td>
              <td>{fmt(r.lastLoginAt)}</td><td>{r.loginCount}</td>
              <td>{r.score} <span className={`pill ${r.level.replace(/\s/g, '').toLowerCase()}`}>{r.level}</span></td>
              <td><Link to={`/admin/students/${r.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
