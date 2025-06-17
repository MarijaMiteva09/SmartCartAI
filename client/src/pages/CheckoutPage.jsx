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

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.fullName || !form.address || !form.email || !form.cardNumber) {
    alert('Please fill out all fields');
    return;
  }

  try {
    const response = await axios.post('http://localhost:5000/api/checkout', {
      fullName: form.fullName,
      address: form.address,
      email: form.email,
      cardNumber: form.cardNumber,
      cartItems,
    });

    if (response.status === 201) {
      clearCart();
      alert('✅ Order placed and saved!');
      navigate('/');
    }
  } catch (err) {
    console.error('Checkout error:', err);
    alert('❌ Failed to place order');
  }
};

  return (
    <div style={{ padding: '20px' }}>
      <h2>Checkout 🧾</h2>
      <h3>Total: ${total.toFixed(2)}</h3>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Shipping Address"
          value={form.address}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="cardNumber"
          placeholder="Card Number"
          value={form.cardNumber}
          onChange={handleChange}
          required
        />
        <button type="submit">Place Order</button>
      </form>
    </div>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '400px',
    marginTop: '20px'
  }
};

export default CheckoutPage;
