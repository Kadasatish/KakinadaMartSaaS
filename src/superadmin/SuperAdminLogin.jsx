import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function SuperAdminLogin() {
  const navigate = useNavigate()
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
    setBusy(true)
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const snapshot = await getDoc(doc(db, 'superAdmins', credential.user.uid))
      const data = snapshot.data()
      if (!snapshot.exists() || data?.role !== 'superAdmin' || data?.active !== true) {
        await signOut(auth)
        throw new Error('Super Admin access denied.')
      }
      navigate('/super-admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Sign in failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="container auth-page">
      <section className="auth-shell">
        <Link className="auth-back" to="/">← Back to customer store</Link>
        <div className="auth-card">
          <span className="auth-badge">Platform control</span>
          <h1>Super Admin</h1>
          <p>Secure access to tenant administrators and platform controls.</p>
          <form className="form-card" onSubmit={submit}>
            <label>Email<input autoComplete="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="superadmin@example.com" /></label>
            <label>Password<input autoComplete="current-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></label>
            <button type="submit" disabled={busy}>{busy ? 'Verifying access…' : 'Enter control center'}</button>
            {error && <p className="error">{error}</p>}
          </form>
        </div>
      </section>
    </main>
  )
}
