import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const CART_KEY = 'kakinadamart-cart'

export default function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem(CART_KEY) || '[]'))

  function update(id, quantity) {
    const next = cart.map((item) => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)
    setCart(next)
    localStorage.setItem(CART_KEY, JSON.stringify(next))
  }

  function remove(id) {
    const next = cart.filter((item) => item.id !== id)
    setCart(next)
    localStorage.setItem(CART_KEY, JSON.stringify(next))
  }

  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)

  return (
    <main className="container narrow">
      <Link to="/">← Store</Link>
      <h1>Your cart</h1>
      {cart.length === 0 ? <p>Your cart is empty.</p> : (
        <>
          <div className="cart-list">
            {cart.map((item) => (
              <div className="cart-row" key={item.id}>
                <div><strong>{item.name}</strong><span>₹{Number(item.price).toFixed(2)}</span></div>
                <input type="number" min="1" value={item.quantity} onChange={(e) => update(item.id, Number(e.target.value))} />
                <button className="danger" onClick={() => remove(item.id)}>Remove</button>
              </div>
            ))}
          </div>
          <div className="cart-total">Total: ₹{total.toFixed(2)}</div>
          <button onClick={() => navigate('/checkout')}>Checkout</button>
        </>
      )}
    </main>
  )
}
