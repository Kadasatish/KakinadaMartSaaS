import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { auth, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { SUPER_ADMIN_URL_IDENTITY, PLATFORM_NAME } from '../tenant'

export default function SuperAdminLogin() {
  const navigate = useNavigate()
  const { superAdminSlug } = useParams()
  const validUrl = superAdminSlug === SUPER_ADMIN_URL_IDENTITY.slug
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (!auth || !db) {
      setError('Firebase is not configured yet.')
      return
    }
    if (!validUrl) {
      setError('Unknown Super Admin URL.')
      return
    }
    setBusy(true)
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const snapshot = await getDoc(doc(db, 'superAdmins', credential.user.uid))
      const data = snapshot.data()
      if (!snapshot.exists() || data?.role !== 'superAdmin' || data?.active !== true) {
        await signOut(auth)
        throw new Error('Super Admin access denied.')
      }
      navigate(`/super-admin/${superAdminSlug}`, { replace: true })
    } catch (err) {
      setError(err.message || 'Sign in failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="container auth-page">
      <section className="auth-shell">
        <Link className="auth-back" to="/">← Back to {PLATFORM_NAME}</Link>
        <div className="auth-card">
          <span className="auth-badge">{PLATFORM_NAME} · Super Admin #{SUPER_ADMIN_URL_IDENTITY.number}</span>
          <h1>{PLATFORM_NAME}</h1>
          <p>Super Admin #{SUPER_ADMIN_URL_IDENTITY.number} control center. Secure access to tenant administrators, stores, and platform controls.</p>
          <form className="form-card" onSubmit={submit}>
            <label>Email<input autoComplete="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="superadmin@example.com" /></label>
            <label>Password<input autoComplete="current-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></label>
            <button type="submit" disabled={busy || !validUrl}>{busy ? 'Verifying access…' : `Enter ${PLATFORM_NAME} control center`}</button>
            {error && <p className="error">{error}</p>}
          </form>
        </div>
      </section>
    </main>
  )
}
