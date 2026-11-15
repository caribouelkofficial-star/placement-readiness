// Shared form rules. Each validator takes the raw input and returns { value, error }.
// `value` is the cleaned/normalised string to submit; `error` is a user-facing message or null.

export const RE = {
  // Letters (any script), then letters, spaces, dots, apostrophes and hyphens. 2 to 60 characters.
  name: /^\p{L}[\p{L}\p{M} .'-]{1,59}$/u,
  // Local part: no leading/trailing/double dots. Domain: dot-separated labels, TLD of 2+ letters.
  email: /^(?!\.)(?!.*\.\.)[A-Za-z0-9._%+-]{1,64}(?<!\.)@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/,
  // Indian mobile: optional +91 / 91 / 0 prefix, then 10 digits starting 6-9.
  phoneIN: /^(?:\+91|91|0)?([6-9]\d{9})$/,
  // Other countries: + and country code (not 91 or 0), 8 to 15 digits in total.
  phoneIntl: /^\+(?!91)[1-9]\d{7,14}$/,
  // 8 to 72 characters, no spaces, at least one letter and one digit.
  password: /^(?=.*[A-Za-z])(?=.*\d)\S{8,72}$/,
}

export const clean = (s) => (s ?? '').replace(/\s+/g, ' ').trim()

export function validateName(raw) {
  const value = clean(raw)
  if (!value) return { value, error: 'Enter your full name.' }
  if (value.length < 2) return { value, error: 'Name must be at least 2 characters.' }
  if (value.length > 60) return { value, error: 'Name must be 60 characters or fewer.' }
  if (!RE.name.test(value)) return { value, error: 'Use letters, spaces, dots, apostrophes or hyphens only.' }
  return { value, error: null }
}

export function validateEmail(raw) {
  const value = (raw ?? '').trim().toLowerCase()
  if (!value) return { value, error: 'Enter your email address.' }
  if (value.length > 254 || !RE.email.test(value)) return { value, error: 'Enter a valid email, like you@college.edu.' }
  return { value, error: null }
}

export function validatePhone(raw) {
  const digits = (raw ?? '').replace(/[\s().-]/g, '')
  if (!digits) return { value: '', error: 'Enter your phone number.' }
  const inMatch = RE.phoneIN.exec(digits)
  if (inMatch) { const n = inMatch[1]; return { value: `+91 ${n.slice(0, 5)} ${n.slice(5)}`, error: null } }
  if (RE.phoneIntl.test(digits)) return { value: digits, error: null }
  return { value: digits, error: 'Enter a valid mobile number: 10 digits starting with 6-9, or +country code for numbers outside India.' }
}

export const passwordChecks = (pw) => [
  ['8 to 72 characters', pw.length >= 8 && pw.length <= 72],
  ['A letter', /[A-Za-z]/.test(pw)],
  ['A number', /\d/.test(pw)],
  ['No spaces', pw.length > 0 && !/\s/.test(pw)],
]

export function validateNewPassword(pw) {
  if (!pw) return { value: pw, error: 'Create a password.' }
  if (!RE.password.test(pw)) return { value: pw, error: 'Use 8 to 72 characters with at least one letter and one number, and no spaces.' }
  return { value: pw, error: null }
}

export const validateLoginPassword = (pw) => (pw ? { value: pw, error: null } : { value: pw, error: 'Enter your password.' })

// Keep only characters a phone number can contain while typing.
export const phoneChars = (s) => s.replace(/[^\d+\s().-]/g, '').slice(0, 20)
