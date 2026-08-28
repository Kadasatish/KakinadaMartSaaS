export default function ProductCard({ product, onAdd }) {
  return (
    <article className="product-card">
      <div className="product-placeholder">KM</div>
      <h2>{product.name}</h2>
      <p className="price">₹{Number(product.price).toFixed(2)}</p>
      <button onClick={() => onAdd(product)}>Add to cart</button>
    </article>
  )
}
