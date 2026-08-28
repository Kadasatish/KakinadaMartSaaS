import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { setAdminTenant } from '../tenant'

export function AdminGuard({ children }) {
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
        const adminDoc = await getDoc(doc(db, 'admins', user.uid))
        const data = adminDoc.data()
        if (adminDoc.exists() && data?.role === 'admin' && data?.tenantId) {
          setAdminTenant(data.tenantId)
          setState('allowed')
        } else {
          setState('forbidden')
        }
      } catch {
        setState('forbidden')
      }
    })
  }, [])

  if (state === 'checking') return <main className="container"><p>Checking access…</p></main>
  if (state === 'unconfigured') return <main className="container"><p className="error">Firebase is not configured yet.</p></main>
  if (state === 'signed-out') return <Navigate to="/admin/login" replace />
  if (state === 'forbidden') return <main className="container"><p className="error">Admin access denied.</p></main>
  return children
}
