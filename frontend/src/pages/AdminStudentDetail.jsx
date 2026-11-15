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
      <p><Link to="/admin">← All students</Link></p>
      {err ? <p className="error">{err}</p> : !data ? <p>Loading…</p> : (
        <>
          <StudentView data={data} />
          <section className="card">
            <h2>Recent logins</h2>
            <ul>{data.recentLogins.map((t) => <li key={t}>{new Date(t).toLocaleString()}</li>)}</ul>
          </section>
        </>
      )}
    </>
  )
}
