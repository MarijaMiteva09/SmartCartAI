import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import emptyCartAnimation from '../animations/empty-cart.json'; 

const CartPage = () => {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart
  } = useCart();

  // Make sure price is treated as number
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div style={{ maxWidth: 300, margin: '0 auto' }}>
          <Lottie animationData={emptyCartAnimation} loop={true} />
        </div>
        <h2 className="mb-4">Your Cart is Empty 🛒</h2>
        <p className="mb-4">Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn btn-outline-primary">
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">Your Shopping Cart 🛒</h2>
      <Link to="/" className="btn btn-link mb-4 p-0">
        ← Continue Shopping
      </Link>

      {cartItems.map((item) => (
        <div
          key={item.id}
          className="card mb-3 shadow-sm"
          style={{ maxWidth: '700px', height: '180px' }}
        >
          <div className="row g-0 align-items-center h-100">
            <div className="col-md-3 h-100">
              <img
                src={item.image_url}
                alt={item.name}
                className="img-fluid rounded-start h-100"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="col-md-9">
              <div className="card-body d-flex flex-column h-100 justify-content-between">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text fw-bold">${Number(item.price).toFixed(2)}</p>

                <div className="d-flex align-items-center">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="btn btn-outline-secondary btn-sm"
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    −
                  </button>
                  <span className="mx-3 fs-5">{item.quantity}</span>
                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="btn btn-outline-secondary btn-sm"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="btn btn-outline-danger btn-sm ms-4"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    ❌
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div
        className="d-flex justify-content-between align-items-center mt-4"
        style={{ maxWidth: '700px' }}
      >
        <h4>Total: ${totalPrice.toFixed(2)}</h4>
        <Link to="/checkout">
          <button className="btn btn-success btn-lg">Proceed to Checkout</button>
        </Link>
      </div>
    </div>
  );
};

export default CartPage;
