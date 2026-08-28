import { signOut } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth } from '../firebase'
import { getProducts, removeProduct, saveProduct } from '../services/products'

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ name: '', price: '' })
  const [error, setError] = useState('')

  async function load() {
    try { setProducts(await getProducts()) } catch (err) { setError(err.message) }
  }

  useEffect(() => { load() }, [])

  async function submit(event) {
    event.preventDefault()
    try {
      await saveProduct(form)
      setForm({ name: '', price: '' })
      await load()
    } catch (err) { setError(err.message) }
  }

  async function remove(id) {
    try { await removeProduct(id); await load() } catch (err) { setError(err.message) }
  }

  return (
    <main className="container admin-page">
      <div className="admin-bar">
        <div><span className="eyebrow">Private area</span><h1>Admin Dashboard</h1></div>
        <button className="secondary" onClick={() => auth && signOut(auth)}>Sign out</button>
      </div>
      <section className="admin-grid">
        <form className="form-card" onSubmit={submit}>
          <h2>Add product</h2>
          <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Price<input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
          <button type="submit">Save product</button>
        </form>
        <section>
          <h2>Products</h2>
          {products.map((product) => (
            <div className="admin-row" key={product.id}>
              <span>{product.name} · ₹{Number(product.price).toFixed(2)}</span>
              {product.id.startsWith('demo-') ? <small>demo</small> : <button className="danger" onClick={() => remove(product.id)}>Delete</button>}
            </div>
          ))}
        </section>
      </section>
      {error && <p className="error">{error}</p>}
    </main>
  )
}
