import { signInWithEmailAndPassword } from 'firebase/auth'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../firebase'

export default function AdminLogin() {
  const navigate = useNavigate()
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
    setBusy(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="container auth-page">
      <section className="auth-shell">
        <Link className="auth-back" to="/">← Back to customer store</Link>
        <div className="auth-card">
          <span className="auth-badge">Store management</span>
          <h1>Admin login</h1>
          <p>Sign in to manage your products, images, and customer orders.</p>
          <form className="form-card" onSubmit={submit}>
            <label>Email<input autoComplete="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" /></label>
            <label>Password<input autoComplete="current-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></label>
            <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in to dashboard'}</button>
            {error && <p className="error">{error}</p>}
          </form>
        </div>
      </section>
    </main>
  )
}
