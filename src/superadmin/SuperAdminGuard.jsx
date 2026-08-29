import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { auth, db } from '../firebase'

export function SuperAdminGuard({ children }) {
  const [state, setState] = useState('checking')

  useEffect(() => {
    if (!auth || !db) {
      setState('unconfigured')
      return undefined
    }

    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState('signed-out')
        return
      }

      try {
        const snapshot = await getDoc(doc(db, 'superAdmins', user.uid))
        if (snapshot.exists() && snapshot.data()?.active === true && snapshot.data()?.role === 'superAdmin') {
          setState('allowed')
        } else {
          setState('forbidden')
        }
      } catch {
        setState('forbidden')
      }
    })
  }, [])

  if (state === 'checking') return <main className="container"><p>Checking Super Admin access…</p></main>
  if (state === 'unconfigured') return <main className="container"><p className="error">Firebase is not configured yet.</p></main>
  if (state === 'signed-out') return <Navigate to="/super-admin/login" replace />
  if (state === 'forbidden') return <main className="container"><p className="error">Super Admin access denied.</p></main>
  return children
}
