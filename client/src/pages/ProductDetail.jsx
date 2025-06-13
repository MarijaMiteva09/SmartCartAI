import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams();
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
      <img src={product.image_url} alt={product.name} style={{ width: '300px', height: '300px', objectFit: 'cover' }} />
      <p><strong>Category:</strong> {product.category}</p>
      <p><strong>Price:</strong> ${product.price}</p>
      <p>{product.description}</p>
      {/* Add to Cart button will come later */}
    </div>
  );
};

export default ProductDetail;
