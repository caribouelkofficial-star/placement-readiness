import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { StudentView } from './StudentView'

export default function AdminStudentDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  useEffect(() => { api.adminStudent(id).then(setData).catch(() => setErr('Student not found.')) }, [id])
  return (
    <>
      <p style={{ marginBottom: 14 }}><Link className="linkbtn" to="/admin">← All students</Link></p>
      {err ? <p className="error">{err}</p> : !data ? <p className="muted">Loading…</p> : (
        <>
          <StudentView data={data} admin />
          <section className="card" style={{ marginTop: 20 }}>
            <h2>Recent logins</h2>
            {data.recentLogins.length === 0 ? <p className="muted">No logins yet.</p> :
              <ul style={{ margin: 0, paddingLeft: 18 }}>{data.recentLogins.map((t) => <li key={t}>{new Date(t).toLocaleString()}</li>)}</ul>}
          </section>
        </>
      )}
    </>
  )
}
