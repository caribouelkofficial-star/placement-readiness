import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Login() {
  const { session, me, login, signup } = useAuth()
  const [mode, setMode] = useState('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  if (session && me) return <Navigate to="/" replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      if (mode === 'login') await login(email, password)
      else {
        const data = await signup(fullName, email, password)
        if (!data.session) setMsg({ ok: true, text: 'Account created. Check your email to confirm, then log in.' })
      }
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card auth" onSubmit={submit}>
      <h1>Placement Readiness</h1>
      <h2>{mode === 'login' ? 'Log in' : 'Create student account'}</h2>
      {mode === 'signup' && (
        <input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      )}
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password (min 6 chars)" minLength={6} value={password}
        onChange={(e) => setPassword(e.target.value)} required />
      {msg && <p className={msg.ok ? 'ok' : 'error'}>{msg.text}</p>}
      <button type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}</button>
      <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMsg(null) }}>
        {mode === 'login' ? 'New student? Create an account' : 'Have an account? Log in'}
      </button>
    </form>
  )
}
