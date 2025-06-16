import React, { createContext, useContext, useEffect, useState } from 'react';

// Create context
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://localhost:5000/api/cart';

  // Fetch cart items from backend on mount
  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to fetch cart');
      const data = await res.json();
      setCartItems(data);
    } catch (error) {
      console.error('Fetch cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  // Add product to cart
  const addToCart = async (product) => {
    try {
      // Check if product already in cart
      const existingItem = cartItems.find(item => item.product_id === product.id);
      if (existingItem) {
        // Increase quantity if exists
        await updateQuantity(existingItem.id, existingItem.quantity + 1);
      } else {
        // Add new cart item
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: product.id, quantity: 1 }),
        });
        if (!res.ok) throw new Error('Failed to add to cart');
        await fetchCartItems();
      }
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId) => {
    try {
      const res = await fetch(`${API_BASE}/${cartItemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove item');
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
    } catch (error) {
      console.error('Remove from cart error:', error);
    }
  };

  // Update quantity of an item
  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) return removeFromCart(cartItemId);

    try {
      const res = await fetch(`${API_BASE}/${cartItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error('Failed to update quantity');
      // Update local state with new quantity
      setCartItems(prev =>
        prev.map(item =>
          item.id === cartItemId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Update quantity error:', error);
    }
  };

  // Add these inside CartProvider, below updateQuantity
const increaseQuantity = (cartItemId) => {
  const item = cartItems.find(item => item.id === cartItemId);
  if (item) updateQuantity(cartItemId, item.quantity + 1);
};

const decreaseQuantity = (cartItemId) => {
  const item = cartItems.find(item => item.id === cartItemId);
  if (item && item.quantity > 1) {
    updateQuantity(cartItemId, item.quantity - 1);
  } else {
    removeFromCart(cartItemId);
  }
};


  // Clear entire cart (optional)
  const clearCart = async () => {
    try {
      // Assuming you have an API endpoint to clear the cart (optional)
      const res = await fetch(`${API_BASE}/clear`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to clear cart');
      setCartItems([]);
    } catch (error) {
      console.error('Clear cart error:', error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        increaseQuantity,    
        decreaseQuantity     
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
