import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createOrder } from '../services/orders'

const CART_KEY = 'kakinadamart-cart'

export default function Checkout() {
  const navigate = useNavigate()
  const [cart] = useState(() => JSON.parse(localStorage.getItem(CART_KEY) || '[]'))
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [status, setStatus] = useState('')
  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)

  async function submit(event) {
    event.preventDefault()
    setStatus('Saving order…')
    try {
      await createOrder({ customer: form, items: cart, total })
      localStorage.removeItem(CART_KEY)
      setStatus('Order placed successfully.')
      setTimeout(() => navigate('/'), 700)
    } catch (error) {
      setStatus(error.message)
    }
  }

  if (!cart.length) return <main className="container narrow"><Link to="/">← Store</Link><h1>Checkout</h1><p>Your cart is empty.</p></main>

  return (
    <main className="container narrow">
      <Link to="/cart">← Cart</Link>
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
