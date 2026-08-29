import { collection, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState('')

  async function loadAdmins() {
    setError('')
    try {
      const snapshot = await getDocs(collection(db, 'admins'))
      setAdmins(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    } catch (err) {
      setError(err.message || 'Unable to load admins.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAdmins() }, [])

  async function toggleAdmin(admin) {
    const nextActive = admin.active !== true
    setUpdatingId(admin.id)
    setError('')
    try {
      await updateDoc(doc(db, 'admins', admin.id), {
        active: nextActive,
        updatedAt: serverTimestamp()
      })
      setAdmins((current) => current.map((item) => item.id === admin.id ? { ...item, active: nextActive } : item))
    } catch (err) {
      setError(err.message || 'Unable to update admin status.')
    } finally {
      setUpdatingId('')
    }
  }

  async function logout() {
    await signOut(auth)
    navigate('/super-admin/login', { replace: true })
  }

  return (
    <main className="container">
      <header className="hero">
        <p className="eyebrow">Platform Control</p>
        <h1>Super Admin Dashboard</h1>
        <p>Manage tenant administrators and their access status.</p>
        <button type="button" onClick={logout}>Logout</button>
      </header>

      {error && <p className="error">{error}</p>}
      {loading ? <p>Loading admins…</p> : (
        <section className="product-grid">
          {admins.map((admin) => {
            const active = admin.active === true
            return (
              <article className="form-card" key={admin.id}>
                <div className="admin-status-head">
                  <div>
                    <h2>{admin.tenantId || 'No tenant'}</h2>
                    <p className="status-label">{active ? 'Active' : 'Inactive'}</p>
                  </div>
                  <label className={`status-toggle ${active ? 'is-on' : ''}`}>
                    <input
                      type="checkbox"
                      checked={active}
                      disabled={updatingId === admin.id}
                      onChange={() => toggleAdmin(admin)}
                      aria-label={`${active ? 'Deactivate' : 'Activate'} ${admin.tenantId || 'admin'}`}
                    />
                    <span className="status-toggle-track" aria-hidden="true"><span /></span>
                  </label>
                </div>
                <p><strong>UID:</strong> {admin.id}</p>
                <p><strong>Role:</strong> {admin.role || 'admin'}</p>
              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}
