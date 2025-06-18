import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Create context
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://localhost:5000/api/cart';

  // Helper: Get auth headers with JWT token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  // Fetch cart items from backend, stable with useCallback
  const fetchCartItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch cart');
      const data = await res.json();
      setCartItems(data);
    } catch (error) {
      console.error('Fetch cart error:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]); // fetchCartItems included here because it's stable

  // Add product to cart
  const addToCart = async (product) => {
    try {
      const existingItem = cartItems.find(item => item.product_id === product.id);
      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + 1);
      } else {
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: getAuthHeaders(),
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
      const res = await fetch(`${API_BASE}/${cartItemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
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
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) throw new Error('Failed to update quantity');
    setCartItems(prev =>
      prev.map(item =>
        item.id === cartItemId ? { ...item, quantity } : item
      )
    );
  } catch (error) {
    console.error('Update quantity error:', error);
  }
};


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

  // Clear entire cart
  const clearCart = async () => {
    try {
      const res = await fetch(`${API_BASE}/clear`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
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
        decreaseQuantity,
        fetchCartItems, // exposed for external calls like after login
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
