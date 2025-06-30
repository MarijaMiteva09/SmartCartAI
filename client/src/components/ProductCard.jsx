// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { token } = useAuth();           // Get token from AuthContext
  const { refreshCart } = useCart();    // Optional: to refresh cart after add

  const handleAddToCart = async () => {
    if (!token) {
      alert('Please log in to add products to your cart.');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/cart',
        { product_id: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Added "${product.name}" to cart!`);

      if (refreshCart) {
        refreshCart();  // If you have a method to update cart state globally
      }
    } catch (error) {
      console.error('Add to cart failed:', error.response?.data || error.message);
      alert('Failed to add product to cart. Please try again.');
    }
  };

  return (
    <div style={styles.card}>
      <img src={product.image_url} alt={product.name} style={styles.image} />
      <h3 style={styles.title} title={product.name}>{product.name}</h3>
      <p style={styles.category}>{product.category}</p>
      <p style={styles.price}>${Number(product.price).toFixed(2)}</p>

      <div style={styles.buttonsContainer}>
        <button
          style={{ ...styles.button, ...styles.addButton }}
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
        >
          Add to Cart
        </button>

        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <button
            style={{ ...styles.button, ...styles.viewButton }}
            aria-label={`View details for ${product.name}`}
          >
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
};

const styles = {
  card: {
    width: '250px',
    height: '380px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '16px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    cursor: 'default',
  },
  image: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderRadius: '6px',
  },
  title: {
    fontSize: '1.1rem',
    margin: '12px 0 6px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  category: {
    color: '#666',
    fontSize: '0.9rem',
    marginBottom: '8px',
  },
  price: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
    marginBottom: '12px',
  },
  buttonsContainer: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    flex: 1,
    padding: '10px 8px',
    fontSize: '0.9rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  addButton: {
    backgroundColor: '#28a745',
    color: 'white',
  },
  viewButton: {
    backgroundColor: '#007bff',
    color: 'white',
  }
};

export default ProductCard;
