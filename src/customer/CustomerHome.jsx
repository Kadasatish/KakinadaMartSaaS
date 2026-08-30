import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../services/products'
import { getCartKey } from '../tenant'

export default function CustomerHome() {
  const { tenantId } = useParams()
  const cartKey = getCartKey(tenantId)
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem(cartKey) || '[]'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    setCart(JSON.parse(localStorage.getItem(cartKey) || '[]'))
    getProducts(tenantId)
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [tenantId, cartKey])

  function addToCart(product) {
    const next = cart.some((item) => item.id === product.id)
      ? cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...product, quantity: 1 }]
    setCart(next)
    localStorage.setItem(cartKey, JSON.stringify(next))
  }

  const storePath = `/store/${tenantId}`
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      <Header tenantId={tenantId} cartCount={cartCount} />
      <main className="container store-page">
        <section className="hero">
          <p className="eyebrow">Local shopping · {tenantId}</p>
          <h1>Shop local.<br />Delivered simply.</h1>
          <p>Browse what this store has in stock, add your favourites to the cart, and share your delivery details only when you checkout.</p>
          <div className="hero-actions">
            <Link className="secondary-link" to={`${storePath}/cart`}>View cart {cartCount > 0 && `· ${cartCount}`}</Link>
            <span className="store-status"><i /> Store online</span>
          </div>
        </section>

        <section className="store-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Available now</p>
              <h2>Products</h2>
            </div>
            <span className="product-count">{products.length} items</span>
          </div>

          {error && <p className="error">{error}</p>}
          {loading ? (
            <div className="loading-grid" aria-label="Loading products">
              <span /><span /><span />
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state store-empty"><strong>No products yet.</strong><span>This store is getting ready. Please check again soon.</span></div>
          ) : (
            <section className="product-grid">
              {products.map((product) => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}
            </section>
          )}
        </section>
      </main>
    </>
  )
}
