import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Calculate cart count from items
  const calculateCartCount = (items) => {
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  // Fetch cart items from API
  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setCartCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/cart');
      console.log('CartContext: Fetching cart data', response.data);
      
      // Handle different response formats
      let cartData;
      if (response.data.success && response.data.data) {
        cartData = response.data.data;
      } else if (response.data.cart) {
        cartData = response.data.cart;
      } else {
        cartData = response.data;
      }
      
      const items = cartData.items || [];
      const count = calculateCartCount(items);
      
      console.log('CartContext: Cart updated', { itemsCount: items.length, totalQuantity: count });
      
      setCartItems(items);
      setCartCount(count);
      setError(null);
    } catch (err) {
      console.error('CartContext: Error fetching cart:', err);
      setError('Failed to load cart');
      setCartItems([]);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Please log in to add items to cart');
      }
      
      console.log('CartContext: Adding to cart - Product:', productId, 'Quantity:', quantity);
      const response = await api.post('/cart/add', { productId, quantity });
      console.log('CartContext: Add to cart API response', response.data);
      
      if (response.data.success) {
        await fetchCart(); // Refresh cart data
        return true;
      } else {
        console.error('CartContext: Add to cart failed:', response.data.message);
        return false;
      }
    } catch (error) {
      console.error('CartContext: Error adding to cart:', error);
      
      // Check if it's an authentication error
      if (error.response && error.response.status === 401) {
        console.log('CartContext: Authentication error, user needs to log in again');
        // Let the error bubble up so the component can handle it
        throw new Error('Authentication expired. Please log in again.');
      } else if (error.message && error.message.includes('log in')) {
        throw error;
      } else {
        throw new Error('Failed to add item to cart. Please try again.');
      }
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity < 1) {
        return await removeFromCart(productId);
      }
      
      const response = await api.put(`/cart/update/${productId}`, { quantity });
      if (response.data.success) {
        await fetchCart(); // Refresh cart data
        return true;
      }
      return false;
    } catch (error) {
      console.error('CartContext: Error updating quantity:', error);
      throw error;
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      const response = await api.delete(`/cart/remove/${productId}`);
      if (response.data.success) {
        await fetchCart(); // Refresh cart data
        return true;
      }
      return false;
    } catch (error) {
      console.error('CartContext: Error removing from cart:', error);
      throw error;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      const response = await api.delete('/cart/clear');
      if (response.data.success) {
        setCartItems([]);
        setCartCount(0);
        return true;
      }
      return false;
    } catch (error) {
      console.error('CartContext: Error clearing cart:', error);
      throw error;
    }
  };

  // Fetch cart when authentication status changes
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const value = {
    cartItems,
    cartCount,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    refreshCart: fetchCart // Alias for backward compatibility
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};