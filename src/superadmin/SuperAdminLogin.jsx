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
    <main className="container narrow admin-page">
      <Link to="/">← Customer store</Link>
      <h1>Super Admin</h1>
      <p>Platform management access.</p>
      <form className="form-card" onSubmit={submit}>
        <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        {error && <p className="error">{error}</p>}
      </form>
    </main>
  )
}
