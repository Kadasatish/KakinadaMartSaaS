import { Link } from 'react-router-dom'

export default function Header({ cartCount = 0 }) {
  return (
    <header className="site-header">
      <Link className="brand" to="/">KakinadaMart</Link>
      <nav>
        <Link to="/cart">Cart ({cartCount})</Link>
      </nav>
    </header>
  )
}
