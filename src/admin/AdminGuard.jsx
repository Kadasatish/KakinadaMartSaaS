import { onAuthStateChanged } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { auth } from '../firebase'

export function AdminGuard({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    if (!auth) {
      setUser(null)
      return undefined
    }
    return onAuthStateChanged(auth, setUser)
  }, [])

  if (user === undefined) return <main className="container"><p>Checking admin session…</p></main>
  if (!user) return <Navigate to="/admin/login" replace />
  return children
}
