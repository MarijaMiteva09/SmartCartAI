import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

const SearchResults = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get query param from URL
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const searchTerm = queryParams.get('query') || '';

  useEffect(() => {
    if (!searchTerm.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Adjust URL to your backend's product search API
        const res = await fetch(`http://localhost:5000/api/products/search?query=${encodeURIComponent(searchTerm)}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error('Search fetch error:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Search Results for: "{searchTerm}"</h2>

      {loading && <p>Loading...</p>}

      {!loading && products.length === 0 && <p>No products found.</p>}

      {!loading && products.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {products.map(product => (
            <li key={product.id} style={{ marginBottom: '15px' }}>
              <Link to={`/product/${product.id}`} style={{ fontWeight: 'bold', fontSize: '18px' }}>
                {product.name}
              </Link>
              <p>{product.description}</p>
              <p>${product.price}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchResults;
