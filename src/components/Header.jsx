import { Link } from 'react-router-dom'

export default function Header({ cartCount = 0, tenantId }) {
  const storePath = `/store/${tenantId}`
  return (
    <header className="site-header">
      <Link className="brand" to={storePath} aria-label="KakinadaMart home">
        <span>KakinadaMart</span>
      </Link>
      <nav aria-label="Store navigation">
        <Link to={`${storePath}/cart`} aria-label={`Cart with ${cartCount} items`}>
          <span>Cart</span><b className="cart-badge">{cartCount}</b>
        </Link>
      </nav>
    </header>
  )
}
