import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext'; // ✅ Import cart context

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart(); // ✅ Use addToCart from context
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching product:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div style={{ padding: '20px' }}>
      <Link to="/">← Back to Products</Link>
      <h2>{product.name}</h2>
      <img
        src={product.image_url}
        alt={product.name}
        style={{ width: '300px', height: '300px', objectFit: 'cover' }}
      />
      <p><strong>Category:</strong> {product.category}</p>
      <p><strong>Price:</strong> ${product.price}</p>
      <p>{product.description}</p>

      {/* ✅ Add to Cart button */}
      <button
        onClick={() => addToCart(product)}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductDetail;
