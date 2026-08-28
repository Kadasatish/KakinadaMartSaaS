import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createOrder } from '../services/orders'
import { getCartKey } from '../tenant'

export default function Checkout() {
  const navigate = useNavigate()
  const { tenantId } = useParams()
  const cartKey = getCartKey(tenantId)
  const storePath = `/store/${tenantId}`
  const [cart] = useState(() => JSON.parse(localStorage.getItem(cartKey) || '[]'))
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [status, setStatus] = useState('')
  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)

  async function submit(event) {
    event.preventDefault()
    setStatus('Saving order…')
    try {
      await createOrder({ customer: form, items: cart, total, tenantId })
      localStorage.removeItem(cartKey)
      setStatus('Order placed successfully.')
      setTimeout(() => navigate(storePath), 700)
    } catch (error) {
      setStatus(error.message)
    }
  }

  if (!cart.length) return <main className="container narrow"><Link to={storePath}>← Store</Link><h1>Checkout</h1><p>Your cart is empty.</p></main>

  return (
    <main className="container narrow">
      <Link to={`${storePath}/cart`}>← Cart</Link>
      <h1>Checkout</h1>
      <p>Customer login is not required. These details are collected only for this order.</p>
      <form className="form-card" onSubmit={submit}>
        <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>Phone<input required inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <label>Address<textarea required rows="4" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
        <strong>Total: ₹{total.toFixed(2)}</strong>
        <button type="submit">Place order</button>
        {status && <p className="status">{status}</p>}
      </form>
    </main>
  )
}
