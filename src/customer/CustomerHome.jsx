import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../services/products'

const CART_KEY = 'kakinadamart-cart'

export default function CustomerHome() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem(CART_KEY) || '[]'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function addToCart(product) {
    const next = cart.some((item) => item.id === product.id)
      ? cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...product, quantity: 1 }]
    setCart(next)
    localStorage.setItem(CART_KEY, JSON.stringify(next))
  }

  return (
    <>
      <Header cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
      <main className="container">
        <section className="hero">
          <p className="eyebrow">Local shopping demo</p>
          <h1>KakinadaMart</h1>
          <p>Browse products without customer login. Customer details are collected only at checkout.</p>
          <Link className="secondary-link" to="/cart">View cart</Link>
        </section>

        {error && <p className="error">{error}</p>}
        {loading ? <p>Loading products…</p> : (
          <section className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </section>
        )}
      </main>
    </>
  )
}
