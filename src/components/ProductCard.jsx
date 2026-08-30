export default function ProductCard({ product, onAdd }) {
  const image = product.imageUrls?.[0]

  return (
    <article className="product-card">
      {image ? <img className="product-image" src={image} alt={product.name} loading="lazy" /> : <div className="product-placeholder">KM</div>}
      <h2>{product.name}</h2>
      <p className="price">₹{Number(product.price).toFixed(2)}</p>
      <button onClick={() => onAdd(product)}>Add to cart</button>
    </article>
  )
}
