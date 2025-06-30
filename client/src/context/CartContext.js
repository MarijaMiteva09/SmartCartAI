import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://localhost:5000/api/cart';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  // Fetch cart items from backend
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
      setCartItems([]); // Reset on error to avoid stale data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  // Add product to cart
  const addToCart = async (product) => {
    try {
      // Check if product already in cart
      const existingItem = cartItems.find(item => item.product_id === product.id);

      if (existingItem) {
        // Update quantity by +1
        await updateQuantity(existingItem.id, existingItem.quantity + 1);
      } else {
        // Add new item
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ product_id: product.id, quantity: 1 }),
        });
        if (!res.ok) throw new Error('Failed to add to cart');
        // Refresh cart after add
        await fetchCartItems();
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add product to cart. Please try again.');
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
      // Update state locally after removal
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
    } catch (error) {
      console.error('Remove from cart error:', error);
      alert('Failed to remove item from cart.');
    }
  };

  // Update quantity of an item
  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) {
      // If quantity less than 1, remove item
      return removeFromCart(cartItemId);
    }

    try {
      const res = await fetch(`${API_BASE}/${cartItemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error('Failed to update quantity');
      // Update locally
      setCartItems(prev =>
        prev.map(item => (item.id === cartItemId ? { ...item, quantity } : item))
      );
    } catch (error) {
      console.error('Update quantity error:', error);
      alert('Failed to update quantity.');
    }
  };

  // Increase quantity by 1
  const increaseQuantity = (cartItemId) => {
    const item = cartItems.find(item => item.id === cartItemId);
    if (item) updateQuantity(cartItemId, item.quantity + 1);
  };

  // Decrease quantity by 1 or remove if quantity is 1
  const decreaseQuantity = (cartItemId) => {
    const item = cartItems.find(item => item.id === cartItemId);
    if (item) {
      if (item.quantity > 1) {
        updateQuantity(cartItemId, item.quantity - 1);
      } else {
        removeFromCart(cartItemId);
      }
    }
  };

  // Clear entire cart (make sure backend supports this endpoint)
  const clearCart = async () => {
    try {
      // Your backend currently has no /api/cart/clear DELETE endpoint
      // You can either:
      // 1) Add this endpoint backend to delete all user's cart items
      // OR
      // 2) Remove all cart items one by one here in frontend

      // Here is option 2 for now:
      await Promise.all(cartItems.map(item => removeFromCart(item.id)));
      setCartItems([]);
    } catch (error) {
      console.error('Clear cart error:', error);
      alert('Failed to clear cart.');
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
        fetchCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
