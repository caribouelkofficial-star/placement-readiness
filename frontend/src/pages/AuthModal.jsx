import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth'
import { Icon, Logo } from '../ui'
import { validateName, validateEmail, validatePhone, validateNewPassword, validateLoginPassword, passwordChecks, phoneChars } from '../validators'

const friendly = (m = '') => {
  const t = m.toLowerCase()
  if (t.includes('rate limit')) return 'Too many sign-up emails have been sent recently. Please wait a little while and try again.'
  if (t.includes('invalid login')) return 'That email and password do not match. Please check them and try again.'
  if (t.includes('already registered') || t.includes('already been registered')) return 'An account with this email already exists. Try signing in instead.'
  if (t.includes('email not confirmed')) return 'Please confirm your email first. Check your inbox for the link.'
  if (t.includes('failed to fetch') || t.includes('network')) return 'Could not reach the server. Check your connection and try again.'
  return m || 'Something went wrong. Please try again.'
}

/** Sign in / sign up dialog shown over the landing page, so authentication never leaves the page. */
export default function AuthModal({ mode, onMode, onClose }) {
  const { login, signup } = useAuth()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const [touched, setTouched] = useState({})
  const box = useRef(null)
  const signin = mode === 'login'

  useEffect(() => {
    const prev = document.activeElement
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && box.current) {
        const f = [...box.current.querySelectorAll('input,button,a[href]')].filter((el) => !el.disabled && el.offsetParent !== null)
        if (!f.length) return
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); prev?.focus?.() }
  }, [onClose])

  useEffect(() => { box.current?.querySelector('input')?.focus() }, [mode])

  const v = {
    name: validateName(fullName), phone: validatePhone(phone), email: validateEmail(email),
    password: signin ? validateLoginPassword(password) : validateNewPassword(password),
  }
  const fields = signin ? ['email', 'password'] : ['name', 'phone', 'email', 'password']
  const err = (k) => (touched[k] ? v[k].error : null)
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }))
  const fieldProps = (k) => ({ onBlur: blur(k), 'aria-invalid': err(k) ? true : undefined, 'aria-describedby': err(k) ? `${k}-err` : undefined })
  const Err = ({ k }) => (err(k) ? <span className="hint err" id={`${k}-err`} role="alert">{err(k)}</span> : null)

  const submit = async (e) => {
    e.preventDefault()
    const bad = fields.find((k) => v[k].error)
    if (bad) {
      setTouched(Object.fromEntries(fields.map((k) => [k, true])))
      box.current?.querySelector(`[name=${bad}]`)?.focus()
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      if (signin) await login(v.email.value, password)
      else {
        const data = await signup(v.name.value, v.email.value, password, v.phone.value)
        if (!data.session) setMsg({ ok: true, text: 'Account created. Check your email to confirm it, then sign in.' })
      }
    } catch (err) {
      setMsg({ ok: false, text: friendly(err.message) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" ref={box}>
        <div className="modal-top"><Logo /><button type="button" className="icon-btn" aria-label="Close" onClick={onClose}><Icon name="close" /></button></div>
        <form onSubmit={submit} noValidate>
          <div><h1 id="auth-title">{signin ? 'Welcome back' : 'Create your account'}</h1>
            <p className="muted">{signin ? 'Sign in to continue your placement preparation.' : 'Sign up as a student to see your readiness.'}</p></div>
          {!signin && <label className="field">Full name<input name="name" autoComplete="name" maxLength={60} value={fullName} onChange={(e) => setFullName(e.target.value)} {...fieldProps('name')} /><Err k="name" /></label>}
          {!signin && <label className="field">Phone number<input name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(phoneChars(e.target.value))} {...fieldProps('phone')} /><Err k="phone" /></label>}
          <label className="field">Email<input name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={254} placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} {...fieldProps('email')} /><Err k="email" /></label>
          <div className="field"><label htmlFor="pw">Password</label>
            <div className="pw">
              <input id="pw" name="password" type={show ? 'text' : 'password'} autoComplete={signin ? 'current-password' : 'new-password'} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} {...fieldProps('password')} />
              <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}><Icon name={show ? 'eyeoff' : 'eye'} /></button>
            </div>
            <Err k="password" />
            {!signin && <ul className="checks-pw" aria-label="Password requirements">{passwordChecks(password).map(([l, ok]) => <li key={l} className={ok ? 'ok' : ''}>{l}</li>)}</ul>}
          </div>
          {msg && <p className={`msg ${msg.ok ? 'ok' : 'error'}`} role={msg.ok ? 'status' : 'alert'}>{msg.text}</p>}
          <button className="btn primary lg block" type="submit" disabled={busy}>{busy ? 'Please wait…' : signin ? 'Sign in' : 'Create account'}</button>
          <p className="muted switch">
            {signin ? 'New to PlaceReady? ' : 'Already have an account? '}
            <button type="button" className="linkbtn" onClick={() => { onMode(signin ? 'signup' : 'login'); setMsg(null); setTouched({}) }}>{signin ? 'Create an account' : 'Sign in'}</button>
          </p>
        </form>
      </div>
    </div>
  )
}
