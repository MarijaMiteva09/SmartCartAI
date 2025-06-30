import React, { useState } from 'react';
import axios from 'axios'; 
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    address: '',
    email: '',
    cardNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const validateCardNumber = (num) => {
    // Simple check: 13 to 19 digits, numbers only
    return /^\d{13,19}$/.test(num.replace(/\s+/g, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullName, address, email, cardNumber } = form;

    if (!fullName || !address || !email || !cardNumber) {
      setErrorMsg('Please fill out all fields.');
      return;
    }

    if (!validateCardNumber(cardNumber)) {
      setErrorMsg('Please enter a valid card number (13-19 digits).');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await axios.post('http://localhost:5000/api/checkout', {
        fullName,
        address,
        email,
        cardNumber,
        cartItems,
      });

      if (response.status === 201) {
        clearCart();
        setSuccessMsg('✅ Order placed successfully!');
        // Navigate after short delay to let user see success
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg('❌ Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Checkout 🧾</h2>
      <h3>Total: ${total.toFixed(2)}</h3>

      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          required
          style={styles.input}
          minLength={2}
        />
        <input
          type="text"
          name="address"
          placeholder="Shipping Address"
          value={form.address}
          onChange={handleChange}
          required
          style={styles.input}
          minLength={5}
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="cardNumber"
          placeholder="Card Number"
          value={form.cardNumber}
          onChange={handleChange}
          required
          style={styles.input}
          maxLength={19}
          pattern="\d{13,19}"
          inputMode="numeric"
          autoComplete="cc-number"
        />

        {errorMsg && <p style={styles.error}>{errorMsg}</p>}
        {successMsg && <p style={styles.success}>{successMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ 
            ...styles.button, 
            opacity: loading ? 0.7 : 1, 
            cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            'Place Order'
          )}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: '20px',
  },
  input: {
    padding: '12px 16px',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1.5px solid #ccc',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  button: {
    padding: '14px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    fontSize: '18px',
    border: 'none',
    borderRadius: '6px',
  },
  error: {
    color: '#dc3545',
    fontWeight: '600',
    marginTop: '-10px',
  },
  success: {
    color: '#28a745',
    fontWeight: '600',
    marginTop: '-10px',
  }
};

export default CheckoutPage;
