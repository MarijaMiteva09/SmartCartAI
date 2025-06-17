import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart
  } = useCart();

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Your Cart is Empty 🛒</h2>
        <Link to="/">← Back to Products</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Your Shopping Cart 🛒</h2>
      <Link to="/">← Continue Shopping</Link>
      {cartItems.map((item) => (
        <div key={item.id} style={styles.item}>
          <img src={item.image_url} alt={item.name} style={styles.image} />
          <div style={styles.details}>
            <h3>{item.name}</h3>
            <p><strong>${item.price}</strong></p>
            <div style={styles.controls}>
              <button onClick={() => decreaseQuantity(item.id)}>-</button>
              <span style={{ margin: '0 10px' }}>{item.quantity}</span>
              <button onClick={() => increaseQuantity(item.id)}>+</button>
              <button onClick={() => removeFromCart(item.id)} style={styles.remove}>❌</button>
            </div>
          </div>
        </div>
      ))}
      <h3>Total: ${totalPrice.toFixed(2)}</h3>
      <Link to="/checkout">
       <button style={styles.checkout}>Proceed to Checkout</button>
      </Link>
    </div>
  );
};

const styles = {
  item: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '10px',
    backgroundColor: '#fdfdfd'
  },
  image: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    marginRight: '20px'
  },
  details: {
    flex: 1
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '10px'
  },
  remove: {
    marginLeft: '15px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'red',
    cursor: 'pointer'
  },
  checkout: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer'
  }
};

export default CartPage;
