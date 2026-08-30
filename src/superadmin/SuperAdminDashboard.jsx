import { collection, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { SUPER_ADMIN_URL_IDENTITY } from '../tenant'

function Toggle({ checked, disabled, onChange }) {
  return (
    <button
      type="button"
      className={`status-toggle ${checked ? 'on' : ''}`}
      aria-pressed={checked}
      aria-label={checked ? 'Deactivate admin' : 'Activate admin'}
      disabled={disabled}
      onClick={onChange}
    >
      <span className="status-toggle-knob" />
    </button>
  )
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

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
    setBusyId(admin.id)
    setError('')
    try {
      await updateDoc(doc(db, 'admins', admin.id), {
        active: admin.active !== true,
        updatedAt: serverTimestamp()
      })
      await loadAdmins()
    } catch (err) {
      setError(err.message || 'Unable to update admin.')
    } finally {
      setBusyId('')
    }
  }

  async function logout() {
    await signOut(auth)
    navigate(`/super-admin/${SUPER_ADMIN_URL_IDENTITY.slug}/login`, { replace: true })
  }

  const stats = useMemo(() => ({
    total: admins.length,
    active: admins.filter((admin) => admin.active === true).length,
    inactive: admins.filter((admin) => admin.active !== true).length
  }), [admins])

  return (
    <main className="container superadmin-page">
      <header className="superadmin-header">
        <div>
          <p className="eyebrow">Platform Control Center · {SUPER_ADMIN_URL_IDENTITY.name} · #{SUPER_ADMIN_URL_IDENTITY.number}</p>
          <h1>{SUPER_ADMIN_URL_IDENTITY.name}</h1>
          <p className="muted">Control tenant administrators, access, and storefront links.</p>
        </div>
        <button className="secondary" type="button" onClick={logout}>Sign out</button>
      </header>

      <section className="sa-stats" aria-label="Admin statistics">
        <article><span>Total admins</span><strong>{stats.total}</strong></article>
        <article><span>Active</span><strong>{stats.active}</strong></article>
        <article><span>Inactive</span><strong>{stats.inactive}</strong></article>
      </section>

      <section className="sa-panel">
        <div className="sa-panel-head">
          <div><p className="eyebrow">Tenant access</p><h2>Administrators</h2></div>
          <button className="secondary" type="button" onClick={loadAdmins} disabled={loading}>Refresh</button>
        </div>

        {error && <p className="error">{error}</p>}
        {loading ? <p>Loading administrators…</p> : admins.length === 0 ? (
          <div className="empty-state"><strong>No tenant admins yet.</strong><span>Create an admin account and assign its tenant ID to manage it here.</span></div>
        ) : (
          <div className="admin-table">
            {admins.map((admin) => {
              const active = admin.active === true
              const busy = busyId === admin.id
              const tenantId = admin.tenantId || ''
              const storeUrl = tenantId ? `/store/${tenantId}` : ''
              return (
                <article className="sa-admin-row" key={admin.id}>
                  <div className="sa-admin-main">
                    <strong>{tenantId || 'No tenant assigned'}</strong>
                    <span>{admin.email || admin.id}</span>
                    <small>Role: {admin.role || 'admin'}</small>
                    {storeUrl && <a className="tenant-store-link" href={storeUrl}>Open customer store →</a>}
                  </div>
                  <div className="sa-admin-status">
                    <span className={`status-label ${active ? 'active' : 'inactive'}`}>{active ? 'Active' : 'Inactive'}</span>
                    <Toggle checked={active} disabled={busy} onChange={() => toggleAdmin(admin)} />
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
