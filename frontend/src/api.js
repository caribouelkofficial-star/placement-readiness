import { supabase } from './supabase'

const BASE = import.meta.env.VITE_API_URL

async function request(path, options = {}) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })
  if (!res.ok) {
    const err = new Error(`Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  recordLogin: () => request('/api/auth/session', { method: 'POST' }),
  me: () => request('/api/me'),
  student: (section) => request(`/api/student/${section}`),
  adminSection: (id, section) => request(`/api/admin/students/${id}/${section}`),
  resources: () => request('/api/resources'),
  adminOverview: () => request('/api/admin/overview'),
  adminRoles: () => request('/api/admin/roles'),
  adminStudents: () => request('/api/admin/students'),
  adminStudent: (id) => request(`/api/admin/students/${id}`),
}
