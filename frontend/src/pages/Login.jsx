import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth'
import { Logo, ThemeToggle } from '../ui'

export default function Login() {
  const { session, me, login, signup } = useAuth()
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login')
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
  const signin = mode === 'login'

  return (
    <div className="auth">
      <div className="side">
        <Link to="/"><Logo /></Link>
        <div>
          <h2>Know your potential.<br /><span className="grad">Get placement ready.</span></h2>
          <ul><li>A transparent 0–100 readiness score</li><li>Skill and career recommendations</li><li>Separate student and placement-officer views</li></ul>
        </div>
        <p className="muted" style={{ fontSize: 12 }}>Your data is visible only to you and your placement cell.</p>
      </div>
      <div className="formcol">
        <div className="top"><ThemeToggle /></div>
        <form onSubmit={submit}>
          <div><h1>{signin ? 'Welcome back' : 'Create your account'}</h1>
            <p className="muted">{signin ? 'Sign in to continue your placement preparation.' : 'Sign up as a student to see your readiness.'}</p></div>
          {!signin && <label className="field">Full name<input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></label>}
          <label className="field">Email<input type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label className="field">Password<input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          {msg && <p className={msg.ok ? 'ok' : 'error'}>{msg.text}</p>}
          <button className="btn primary block" type="submit" disabled={busy}>{busy ? 'Please wait…' : signin ? 'Sign in' : 'Create account'}</button>
          <p className="muted" style={{ textAlign: 'center', fontSize: 14 }}>
            {signin ? 'New to PlaceReady? ' : 'Already have an account? '}
            <button type="button" className="linkbtn" onClick={() => { setMode(signin ? 'signup' : 'login'); setMsg(null) }}>{signin ? 'Create an account' : 'Sign in'}</button>
          </p>
        </form>
      </div>
    </div>
  )
}
