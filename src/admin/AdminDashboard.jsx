import { signOut } from 'firebase/auth'
import { useEffect, useRef, useState } from 'react'
import { auth } from '../firebase'
import { getProducts, removeProduct, saveProduct } from '../services/products'
import { uploadProductImage } from '../services/cloudinary'
import { getOrders, ORDER_STATUSES, updateOrderStatus } from '../services/orders'
import { getAdminTenant } from '../tenant'

function formatDate(value) {
  if (!value?.toDate) return 'Just now'
  return value.toDate().toLocaleString('en-IN')
}

function ImageInput({ label, side, file, setFile }) {
  const galleryRef = useRef(null)
  const cameraRef = useRef(null)
  return (
    <div className="image-input">
      <strong>{label}</strong>
      <div className="image-actions">
        <button className="secondary" type="button" onClick={() => galleryRef.current?.click()}>📱 Gallery</button>
        <button className="secondary" type="button" onClick={() => cameraRef.current?.click()}>📷 Camera</button>
      </div>
      <input ref={galleryRef} hidden type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <input ref={cameraRef} hidden type="file" accept="image/*" capture="environment" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      {file && <small>{side}: {file.name}</small>}
    </div>
  )
}

export default function AdminDashboard() {
  const tenantId = getAdminTenant()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState({ name: '', price: '', imageUrl: '' })
  const [frontFile, setFrontFile] = useState(null)
  const [backFile, setBackFile] = useState(null)
  const [frontPreview, setFrontPreview] = useState('')
  const [backPreview, setBackPreview] = useState('')
  const [error, setError] = useState('')
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [savingProduct, setSavingProduct] = useState(false)

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

  useEffect(() => {
    if (!frontFile) return setFrontPreview('')
    const url = URL.createObjectURL(frontFile)
    setFrontPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [frontFile])

  useEffect(() => {
    if (!backFile) return setBackPreview('')
    const url = URL.createObjectURL(backFile)
    setBackPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [backFile])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSavingProduct(true)
    try {
      const imageFrontUrl = frontFile ? await uploadProductImage(frontFile, tenantId, 'front') : ''
      const imageBackUrl = backFile ? await uploadProductImage(backFile, tenantId, 'back') : ''
      await saveProduct({ ...form, imageFrontUrl, imageBackUrl }, tenantId)
      setForm({ name: '', price: '', imageUrl: '' })
      setFrontFile(null)
      setBackFile(null)
      await loadProducts()
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingProduct(false)
    }
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

  return (
    <main className="container admin-page">
      <div className="admin-bar">
        <div><span className="eyebrow">Private area · {tenantId}</span><h1>Admin Dashboard</h1></div>
        <button className="secondary" onClick={() => auth && signOut(auth)}>Sign out</button>
      </div>

      <section className="admin-grid">
        <form className="form-card" onSubmit={submit}>
          <h2>Add product</h2>
          <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Price<input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>

          <label>Online image URL (optional)<input type="url" placeholder="https://example.com/product.jpg" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></label>

          <ImageInput label="Front photo" side="front" file={frontFile} setFile={setFrontFile} />
          {frontPreview && <img className="image-preview" src={frontPreview} alt="Front preview" />}

          <ImageInput label="Back photo" side="back" file={backFile} setFile={setBackFile} />
          {backPreview && <img className="image-preview" src={backPreview} alt="Back preview" />}

          <small className="muted">Photos are uploaded to Cloudinary when configured. Online image URLs can be used without an upload.</small>
          <button type="submit" disabled={savingProduct}>{savingProduct ? 'Saving…' : 'Save product'}</button>
        </form>

        <section>
          <h2>Products</h2>
          {products.length === 0 && <p>No products yet.</p>}
          {products.map((product) => (
            <div className="admin-row" key={product.id}>
              <div className="admin-product-info">
                {product.imageUrl || product.imageFrontUrl ? <img src={product.imageUrl || product.imageFrontUrl} alt="" className="admin-product-thumb" /> : null}
                <span>{product.name} · ₹{Number(product.price).toFixed(2)}</span>
              </div>
              {product.id.startsWith('demo-') ? <small>demo</small> : <button className="danger" type="button" onClick={() => remove(product.id)}>Delete</button>}
            </div>
          ))}
        </section>
      </section>

      <section className="orders-section">
        <div className="admin-bar">
          <div><span className="eyebrow">Fulfilment</span><h2>Orders</h2></div>
          <button className="secondary" type="button" onClick={loadOrders}>Refresh</button>
        </div>
        {loadingOrders ? <p>Loading orders…</p> : orders.length === 0 ? <p>No orders yet.</p> : (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div className="order-head">
                  <div>
                    <strong>#{order.id.slice(0, 8)}</strong>
                    <small>{formatDate(order.createdAt)}</small>
                  </div>
                  <strong>₹{Number(order.total).toFixed(2)}</strong>
                </div>
                <p><strong>{order.customer?.name}</strong> · {order.customer?.phone}</p>
                <p>{order.customer?.address}</p>
                <p>{order.items?.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</p>
                <label className="order-status">Status
                  <select value={order.status || 'new'} onChange={(e) => changeOrderStatus(order.id, e.target.value)}>
                    {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
              </article>
            ))}
          </div>
        )}
      </section>

      {error && <p className="error">{error}</p>}
    </main>
  )
}
