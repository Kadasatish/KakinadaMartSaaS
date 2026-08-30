import { signOut } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth } from '../firebase'
import { getProducts, removeProduct, saveProduct } from '../services/products'
import { uploadImage } from '../services/cloudinary'
import { getOrders, ORDER_STATUSES, updateOrderStatus } from '../services/orders'
import { getAdminTenant } from '../tenant'

function formatDate(value) {
  if (!value?.toDate) return 'Just now'
  return value.toDate().toLocaleString('en-IN')
}

const emptyForm = { name: '', price: '', imageUrls: [''] }

export default function AdminDashboard() {
  const tenantId = getAdminTenant()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [uploading, setUploading] = useState(false)

  async function loadProducts() {
    try { setProducts(await getProducts(tenantId)) } catch (err) { setError(err.message) }
  }

  async function loadOrders() {
    try { setOrders(await getOrders(tenantId)) } catch (err) { setError(err.message) }
    finally { setLoadingOrders(false) }
  }

  useEffect(() => {
    loadProducts()
    loadOrders()
  }, [tenantId])

  function setImageUrl(value) {
    setForm((current) => ({ ...current, imageUrls: [value] }))
  }

  async function handleImageUpload(file) {
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setImageUrl(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      await saveProduct(form, tenantId)
      setForm(emptyForm)
      await loadProducts()
    } catch (err) { setError(err.message) }
  }

  async function remove(id) {
    setError('')
    try { await removeProduct(id); await loadProducts() } catch (err) { setError(err.message) }
  }

  async function changeOrderStatus(id, status) {
    setError('')
    try {
      await updateOrderStatus(id, status)
      await loadOrders()
    } catch (err) { setError(err.message) }
  }

  const storePath = `/store/${tenantId}`
  const pendingOrders = orders.filter((order) => !['delivered', 'cancelled'].includes(order.status)).length

  return (
    <main className="container admin-page">
      <header className="admin-bar admin-hero-bar">
        <div>
          <p className="eyebrow">Private store workspace</p>
          <h1>Admin Dashboard</h1>
          <p className="muted">Manage <strong>{tenantId}</strong>, products, images, and orders.</p>
        </div>
        <div className="admin-header-actions">
          <a className="secondary-link" href={storePath}>View customer store ↗</a>
          <button className="secondary" type="button" onClick={() => auth && signOut(auth)}>Sign out</button>
        </div>
      </header>

      <section className="admin-stats" aria-label="Store overview">
        <article><span>Products</span><strong>{products.length}</strong></article>
        <article><span>Total orders</span><strong>{orders.length}</strong></article>
        <article><span>Open orders</span><strong>{pendingOrders}</strong></article>
      </section>

      <section className="admin-grid">
        <form className="form-card" onSubmit={submit}>
          <div><p className="eyebrow">Catalog</p><h2>Add product</h2></div>
          <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" /></label>
          <label>Price<input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" /></label>

          <fieldset className="image-upload-card">
            <legend>Product picture</legend>
            <div className="image-upload-slot">
              <strong>Take or choose one product photo</strong>
              {form.imageUrls[0] && <img className="image-preview" src={form.imageUrls[0]} alt="Product preview" />}
              <div className="upload-actions">
                <label className="upload-button">
                  📷 Camera
                  <input hidden type="file" accept="image/*" capture="environment" onChange={(e) => handleImageUpload(e.target.files?.[0])} />
                </label>
                <label className="upload-button">
                  🖼️ Gallery
                  <input hidden type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0])} />
                </label>
              </div>
              {uploading && <small>Uploading image…</small>}
              <input type="url" placeholder="Or paste online image URL" value={form.imageUrls[0]} onChange={(e) => setImageUrl(e.target.value)} />
            </div>
          </fieldset>

          <button type="submit" disabled={uploading}>{uploading ? 'Uploading…' : 'Save product'}</button>
        </form>

        <section className="admin-list-panel">
          <div className="section-heading"><div><p className="eyebrow">Catalog</p><h2>Products</h2></div><span className="product-count">{products.length} items</span></div>
          {products.length === 0 && <div className="empty-state"><strong>No products yet.</strong><span>Add the first product using the form.</span></div>}
          {products.map((product) => (
            <div className="admin-row" key={product.id}>
              <div className="admin-product-info">
                {product.imageUrls?.find(Boolean) ? <img src={product.imageUrls.find(Boolean)} alt="" className="admin-thumb" /> : <div className="admin-thumb admin-thumb-placeholder">KM</div>}
                <span><strong>{product.name}</strong><small>₹{Number(product.price).toFixed(2)}</small></span>
              </div>
              {product.id.startsWith('demo-') ? <small>demo</small> : <button className="danger" type="button" onClick={() => remove(product.id)}>Delete</button>}
            </div>
          ))}
        </section>
      </section>

      <section className="orders-section">
        <div className="admin-bar">
          <div><p className="eyebrow">Fulfilment</p><h2>Orders</h2></div>
          <button className="secondary" type="button" onClick={loadOrders}>Refresh</button>
        </div>
        {loadingOrders ? <p>Loading orders…</p> : orders.length === 0 ? <div className="empty-state"><strong>No orders yet.</strong><span>Customer orders will appear here.</span></div> : (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div className="order-head">
                  <div><strong>#{order.id.slice(0, 8)}</strong><small>{formatDate(order.createdAt)}</small></div>
                  <strong>₹{Number(order.total).toFixed(2)}</strong>
                </div>
                <p><strong>{order.customer?.name}</strong> · {order.customer?.phone}</p>
                <p>{order.customer?.address}</p>
                <p>{order.items?.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</p>
                <label className="order-status">Status<select value={order.status || 'new'} onChange={(e) => changeOrderStatus(order.id, e.target.value)}>{ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
              </article>
            ))}
          </div>
        )}
      </section>

      {error && <p className="error">{error}</p>}
    </main>
  )
}
