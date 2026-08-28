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

  return (
    <>
      <Header tenantId={tenantId} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
      <main className="container">
        <section className="hero">
          <p className="eyebrow">Local shopping demo · {tenantId}</p>
          <h1>KakinadaMart</h1>
          <p>Browse products without customer login. Customer details are collected only at checkout.</p>
          <Link className="secondary-link" to={`${storePath}/cart`}>View cart</Link>
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
