import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { auth, db } from '../firebase'
import { DEFAULT_TENANT_ID, getAdminIdentityBySlug, setAdminTenant } from '../tenant'

export function AdminGuard({ children }) {
  const { adminSlug } = useParams()
  const routeTenantId = getAdminIdentityBySlug(adminSlug)
  const [state, setState] = useState('checking')

  useEffect(() => {
    if (!auth || !db) {
      setState('unconfigured')
      return undefined
    }

    if (!routeTenantId) {
      setState('invalid-url')
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
        if (adminDoc.exists() && data?.active === true) {
          const tenantId = data?.tenantId || DEFAULT_TENANT_ID
          if (tenantId !== routeTenantId) {
            setState('wrong-admin')
            return
          }
          setAdminTenant(tenantId)
          sessionStorage.setItem('kakinadamart-admin-expected-tenant', tenantId)
          setState('allowed')
        } else {
          setState('forbidden')
        }
      } catch {
        setState('forbidden')
      }
    })
  }, [routeTenantId])

  if (state === 'checking') return <main className="container"><p>Checking access…</p></main>
  if (state === 'unconfigured') return <main className="container"><p className="error">Firebase is not configured yet.</p></main>
  if (state === 'invalid-url') return <main className="container"><p className="error">Unknown admin URL.</p></main>
  if (state === 'signed-out') return <Navigate to={`/admin/${adminSlug}/login`} replace />
  if (state === 'wrong-admin') return <main className="container"><p className="error">This admin account does not belong to this admin URL.</p></main>
  if (state === 'forbidden') return <main className="container"><p className="error">Admin access denied or account is inactive.</p></main>
  return children
}
