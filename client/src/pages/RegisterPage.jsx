import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Notice the keys: full_name, email, password to match backend
      await axios.post('http://localhost:5000/api/register', {
        full_name: form.fullName,
        email: form.email,
        password: form.password,
      });

      alert('✅ Registration successful! You can now login.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      alert(`❌ Registration failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Register</h2>
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
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

const styles = {
  container: { padding: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' },
};

export default RegisterPage;
