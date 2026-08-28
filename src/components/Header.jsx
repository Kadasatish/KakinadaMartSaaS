import { Link } from 'react-router-dom'

export default function Header({ cartCount = 0, tenantId }) {
  const storePath = `/store/${tenantId}`
  return (
    <header className="site-header">
      <Link className="brand" to={storePath}>KakinadaMart</Link>
      <nav>
        <Link to={`${storePath}/cart`}>Cart ({cartCount})</Link>
      </nav>
    </header>
  )
}
