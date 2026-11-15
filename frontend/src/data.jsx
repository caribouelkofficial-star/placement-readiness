import { createContext, useCallback, useContext, useEffect, useState } from 'react'

/** Where a student's section data comes from: their own endpoints, or an admin viewing a student. */
export const StudentCtx = createContext(null)

export function useSection(name) {
  const ctx = useContext(StudentCtx)
  const [state, setState] = useState({ data: null, err: null })
  useEffect(() => {
    let cancelled = false
    setState({ data: null, err: null })
    ctx.fetch(name)
      .then((data) => !cancelled && setState({ data, err: null }))
      .catch(() => !cancelled && setState({ data: null, err: 'Failed to load.' }))
    return () => { cancelled = true }
  }, [ctx, name])
  return state
}

const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null)
  const show = useCallback((m) => { setMsg(m); setTimeout(() => setMsg(null), 3200) }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && <div className="toast" role="status">{msg}</div>}
    </ToastCtx.Provider>
  )
}

export const DEMO_MSG = 'Demo mode: this action is simulated.'
