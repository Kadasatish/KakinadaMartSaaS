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
    try {
      await updateDoc(doc(db, 'admins', admin.id), {
        active: admin.active !== true,
        updatedAt: serverTimestamp()
      })
      await loadAdmins()
    } catch (err) {
      setError(err.message || 'Unable to update admin.')
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
          {admins.map((admin) => (
            <article className="form-card" key={admin.id}>
              <h2>{admin.tenantId || 'No tenant'}</h2>
              <p><strong>UID:</strong> {admin.id}</p>
              <p><strong>Role:</strong> {admin.role || 'admin'}</p>
              <p><strong>Status:</strong> {admin.active === true ? 'Active' : 'Suspended'}</p>
              <button type="button" onClick={() => toggleAdmin(admin)}>
                {admin.active === true ? 'Suspend Admin' : 'Activate Admin'}
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
