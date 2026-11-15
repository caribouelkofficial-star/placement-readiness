import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth'
import { Logo, ThemeToggle, Icon } from '../ui'

const friendly = (m = '') => {
  const t = m.toLowerCase()
  if (t.includes('rate limit')) return 'Too many sign-up emails have been sent recently. Please wait a little while and try again.'
  if (t.includes('invalid login')) return 'That email and password do not match. Please check them and try again.'
  if (t.includes('already registered') || t.includes('already been registered')) return 'An account with this email already exists. Try signing in instead.'
  if (t.includes('email not confirmed')) return 'Please confirm your email first. Check your inbox for the link.'
  if (t.includes('failed to fetch') || t.includes('network')) return 'Could not reach the server. Check your connection and try again.'
  return m || 'Something went wrong. Please try again.'
}

export default function Login() {
  const { session, me, login, signup } = useAuth()
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const signin = mode === 'login'

  useEffect(() => { document.title = `${signin ? 'Sign in' : 'Create account'} · PlaceReady` }, [signin])

  if (session && me) return <Navigate to="/" replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      if (signin) await login(email.trim(), password)
      else {
        const data = await signup(fullName.trim(), email.trim(), password, phone.trim())
        if (!data.session) setMsg({ ok: true, text: 'Account created. Check your email to confirm it, then sign in.' })
      }
    } catch (err) {
      setMsg({ ok: false, text: friendly(err.message) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <div className="side">
        <Link to="/"><Logo /></Link>
        <div>
          <h2>Know your potential.<br /><span className="grad">Get placement ready.</span></h2>
          <ul><li>A transparent 0–100 readiness score</li><li>Skill and career recommendations</li><li>Separate student and placement-officer views</li></ul>
        </div>
        <p className="muted note">Your data is visible only to you and your placement cell.</p>
      </div>
      <div className="formcol">
        <div className="top"><Link to="/" aria-label="PlaceReady home"><Logo /></Link><ThemeToggle /></div>
        <form onSubmit={submit} noValidate={false}>
          <Link className="back" to="/"><Icon name="back" size={14} />Back to home</Link>
          <div><h1>{signin ? 'Welcome back' : 'Create your account'}</h1>
            <p className="muted">{signin ? 'Sign in to continue your placement preparation.' : 'Sign up as a student to see your readiness.'}</p></div>
          {!signin && <label className="field">Full name<input name="name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} /></label>}
          {!signin && <label className="field">Phone number<input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 98765 43210" pattern="[+]?[0-9 ()\-]{7,20}" title="Enter a valid phone number, 7 to 20 digits" value={phone} onChange={(e) => setPhone(e.target.value)} required /></label>}
          <label className="field">Email<input name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <div className="field"><label htmlFor="pw">Password</label>
            <div className="pw">
              <input id="pw" name="password" type={show ? 'text' : 'password'} autoComplete={signin ? 'current-password' : 'new-password'} minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}><Icon name={show ? 'eyeoff' : 'eye'} /></button>
            </div>
            {!signin && <span className="hint">At least 6 characters.</span>}
          </div>
          {msg && <p className={`msg ${msg.ok ? 'ok' : 'error'}`} role={msg.ok ? 'status' : 'alert'}>{msg.text}</p>}
          <button className="btn primary lg block" type="submit" disabled={busy}>{busy ? 'Please wait…' : signin ? 'Sign in' : 'Create account'}</button>
          <p className="muted switch">
            {signin ? 'New to PlaceReady? ' : 'Already have an account? '}
            <button type="button" className="linkbtn" onClick={() => { setMode(signin ? 'signup' : 'login'); setMsg(null) }}>{signin ? 'Create an account' : 'Sign in'}</button>
          </p>
        </form>
      </div>
    </div>
  )
}
