import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={styles.card}>
        <img src={product.image_url} alt={product.name} style={styles.image} />
        <h3>{product.name}</h3>
        <p>{product.category}</p>
        <p><strong>${product.price}</strong></p>
      </div>
    </Link>
  );
};

const styles = {
  card: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    width: '250px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    cursor: 'pointer'
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  }
};

export default ProductCard;
