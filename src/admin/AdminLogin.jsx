import { signInWithEmailAndPassword } from 'firebase/auth'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { auth } from '../firebase'
import { getAdminIdentity, getAdminIdentityBySlug, PLATFORM_NAME } from '../tenant'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { adminSlug } = useParams()
  const tenantId = getAdminIdentityBySlug(adminSlug)
  const identity = tenantId ? getAdminIdentity(tenantId) : null
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (!auth) {
      setError('Firebase is not configured yet.')
      return
    }
    if (!tenantId) {
      setError('Unknown admin URL.')
      return
    }
    setBusy(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      sessionStorage.setItem('kakinadamart-admin-expected-tenant', tenantId)
      navigate(`/admin/${adminSlug}`, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="container auth-page">
      <section className="auth-shell">
        <Link className="auth-back" to={`/store/${tenantId || 'kakinadamart'}`}>← Back to {PLATFORM_NAME}</Link>
        <div className="auth-card">
          <span className="auth-badge">{PLATFORM_NAME} · Admin #{identity?.number || '—'}</span>
          <h1>{identity?.storeName || PLATFORM_NAME}</h1>
          <p>Admin login for <strong>{identity?.storeName || 'your store'}</strong>. Manage products, images, and customer orders.</p>
          <form className="form-card" onSubmit={submit}>
            <label>Email<input autoComplete="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" /></label>
            <label>Password<input autoComplete="current-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></label>
            <button type="submit" disabled={busy}>{busy ? 'Signing in…' : `Sign in to ${identity?.storeName || 'store'}`}</button>
            {error && <p className="error">{error}</p>}
          </form>
        </div>
      </section>
    </main>
  )
}
