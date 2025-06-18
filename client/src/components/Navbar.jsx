import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();          
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>
        <Link to="/" style={styles.link}>🛍️ SmartCartAI</Link>
      </div>

      <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <button type="submit" style={styles.searchButton}>Search</button>
      </form>

      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/cart" style={styles.link}>Cart</Link>

        {user ? (
          <>
            <span style={styles.user}>👤 {user.full_name}</span>
            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#222',
    color: '#fff',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  searchForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  searchInput: {
    padding: '5px 10px',
    borderRadius: '3px',
    border: 'none',
    fontSize: '16px',
  },
  searchButton: {
    padding: '6px 12px',
    borderRadius: '3px',
    border: 'none',
    backgroundColor: '#444',
    color: '#fff',
    cursor: 'pointer',
  },
  links: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '16px',
  },
  user: {
    color: '#fff',
    marginRight: '10px',
  },
  logoutButton: {
    backgroundColor: '#444',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    cursor: 'pointer',
  }
};

export default Navbar;
