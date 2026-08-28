import { signInWithEmailAndPassword } from 'firebase/auth'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../firebase'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (!auth) {
      setError('Firebase is not configured yet.')
      return
    }
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="container narrow admin-page">
      <Link to="/">← Customer store</Link>
      <h1>Admin</h1>
      <p>This area is intentionally separate from the customer store.</p>
      <form className="form-card" onSubmit={submit}>
        <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button type="submit">Sign in</button>
        {error && <p className="error">{error}</p>}
      </form>
    </main>
  )
}
