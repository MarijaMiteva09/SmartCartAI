import React, { useState, useEffect } from 'react';

const SearchProducts = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (category) params.append('category', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const res = await fetch(`http://localhost:5000/api/products/search?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query || category || minPrice || maxPrice) fetchResults();
      else setResults([]); // clear results if no filters
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query, category, minPrice, maxPrice]);

  return (
    <div style={{ padding: '1rem', maxWidth: 600, margin: 'auto' }}>
      <h2>Search Products</h2>
      <input
        type="text"
        placeholder="Search products"
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={e => setCategory(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <input
        type="number"
        placeholder="Min price"
        value={minPrice}
        onChange={e => setMinPrice(e.target.value)}
        style={{ marginRight: 8, width: 100 }}
      />
      <input
        type="number"
        placeholder="Max price"
        value={maxPrice}
        onChange={e => setMaxPrice(e.target.value)}
        style={{ marginRight: 8, width: 100 }}
      />

      {loading ? <p>Loading...</p> : (
        results.length > 0 ? (
          <ul>
            {results.map(product => (
              <li key={product.id}>
                <strong>{product.name}</strong> — ${product.price}
              </li>
            ))}
          </ul>
        ) : (
          (query || category || minPrice || maxPrice) && <p>No results found</p>
        )
      )}
    </div>
  );
};

export default SearchProducts;
