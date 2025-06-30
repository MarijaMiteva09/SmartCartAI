import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => {
        setProducts(res.data);
        setError('');
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{...styles.container, textAlign: 'center', paddingTop: '60px'}}>
        <div className="spinner-border text-primary" role="status" style={{width: '4rem', height: '4rem'}}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{marginTop: '1rem', fontSize: '1.25rem'}}>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{...styles.container, textAlign: 'center', paddingTop: '60px'}}>
        <p style={{color: 'red', fontSize: '1.25rem'}}>{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{...styles.container, textAlign: 'center', paddingTop: '60px'}}>
        <p style={{fontSize: '1.25rem'}}>No products found 😞</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>🛍️ Smart Cart AI Products</h1>
      <div style={styles.grid}>
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 250px)', // fixed card width
    gap: '24px',
    justifyContent: 'center',
    marginTop: '24px'
  }
};

export default Home;
