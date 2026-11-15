import { useEffect, useState } from 'react'
import { api } from '../api'
import { StudentView } from './StudentView'

export default function StudentDashboard() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  useEffect(() => { api.studentDashboard().then(setData).catch(() => setErr('Failed to load dashboard.')) }, [])
  if (err) return <p className="error">{err}</p>
  if (!data) return <p>Loading…</p>
  return <StudentView data={data} />
}
