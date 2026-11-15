import { useState } from 'react'
import { api } from '../api'
import { supabase } from '../supabase'
import { Icon } from '../ui'

const rules = [
  ['At least 8 characters', (p) => p.length >= 8],
  ['An uppercase letter', (p) => /[A-Z]/.test(p)],
  ['A lowercase letter', (p) => /[a-z]/.test(p)],
  ['A number', (p) => /\d/.test(p)],
]

export default function ChangePassword() {
  const [f, setF] = useState({ current: '', next: '', confirm: '' })
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const type = show ? 'text' : 'password'

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    if (!rules.every(([, ok]) => ok(f.next))) return setMsg({ ok: false, text: 'New password does not meet the requirements below.' })
    if (f.next !== f.confirm) return setMsg({ ok: false, text: 'New password and confirmation do not match.' })
    setBusy(true)
    try {
      await api.changePassword(f.current, f.next)
      await supabase.auth.signOut({ scope: 'others' }).catch(() => {})
      setF({ current: '', next: '', confirm: '' })
      setMsg({ ok: true, text: 'Password updated. Other devices have been signed out.' })
    } catch (ex) {
      setMsg({ ok: false, text: ex.detail || (ex.status === 401 ? 'Your session expired. Please log in again.' : 'Could not change the password. Please try again.') })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card" style={{ maxWidth: 520, marginBottom: 16 }} aria-labelledby="h-pw">
      <h2 id="h-pw">Change password</h2>
      <form onSubmit={submit} className="pwform" noValidate>
        <label className="field">Current password<input type={type} autoComplete="current-password" value={f.current} onChange={set('current')} required /></label>
        <label className="field">New password<input type={type} autoComplete="new-password" value={f.next} onChange={set('next')} required /></label>
        <label className="field">Confirm new password<input type={type} autoComplete="new-password" value={f.confirm} onChange={set('confirm')} required /></label>
        <ul className="rules" aria-label="Password requirements">
          {rules.map(([label, ok]) => <li key={label} className={f.next && ok(f.next) ? 'ok' : ''}>{label}</li>)}
        </ul>
        <label className="task"><input type="checkbox" checked={show} onChange={() => setShow(!show)} />Show passwords</label>
        {msg && <p className={msg.ok ? 'ok' : 'error'} role={msg.ok ? 'status' : 'alert'}>{msg.text}</p>}
        <button className="btn primary" type="submit" disabled={busy}><Icon name="shield" size={16} />{busy ? 'Updating…' : 'Update password'}</button>
      </form>
    </section>
  )
}
