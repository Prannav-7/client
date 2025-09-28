import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getImageUrl, getDefaultImageUrl } from '../utils/imageUtils';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    cartItems, 
    cartCount, 
    loading, 
    error, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    fetchCart
  } = useCart();

  // Calculate total price from cart items
  const total = cartItems.reduce((sum, item) => {
    const price = item.price || (item.productId?.price * item.quantity) || 0;
    return sum + price;
  }, 0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Cart is automatically fetched by the CartContext
  }, [isAuthenticated, navigate]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await handleRemoveItem(productId);
      return;
    }
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      alert('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId, productName = '') => {
    if (productName && !window.confirm(`Remove "${productName}" from cart?`)) {
      return;
    }
    try {
      await removeFromCart(productId);
      alert('Item removed from cart');
    } catch (error) {
      alert('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear all items from your cart?')) {
      return;
    }
    try {
      await clearCart();
      alert('Cart cleared successfully');
    } catch (error) {
      alert('Failed to clear cart');
    }
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="cart-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Header />
      
      <div className="cart-container">
        <div className="cart-header">
          <h1>🛒 Shopping Cart</h1>
          <div className="cart-summary">
            <span className="item-count">{cartCount} items</span>
            <span className="total-amount">Total: ₹{total.toLocaleString()}</span>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchCart} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <button 
              onClick={() => navigate('/products')}
              className="continue-shopping-btn"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-actions">
              <button 
                onClick={() => navigate('/products')}
                className="continue-shopping-btn"
              >
                ← Continue Shopping
              </button>
              <button 
                onClick={handleClearCart}
                className="clear-cart-btn"
              >
                Clear Cart
              </button>
            </div>

            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="item-image">
                    <img
                      src={getImageUrl(item.productId?.imageUrl)}
                      alt={item.productId?.name}
                      onError={(e) => {
                        e.target.src = getDefaultImageUrl();
                      }}
                    />
                  </div>
                  
                  <div className="item-details">
                    <h3 className="item-name">{item.productId?.name}</h3>
                    <p className="item-category">{item.productId?.category}</p>
                    <p className="item-brand">Brand: {item.productId?.brand}</p>
                    
                    <div className="item-stock">
                      {item.productId?.stock > 0 ? (
                        <span className="in-stock">✅ In Stock ({item.productId.stock})</span>
                      ) : (
                        <span className="out-of-stock">❌ Out of Stock</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="item-price">
                    <span className="unit-price">₹{item.price?.toLocaleString()}</span>
                    <span className="price-unit">per {item.productId?.unit}</span>
                  </div>
                  
                  <div className="quantity-controls">
                    <button
                      onClick={() => handleUpdateQuantity(item.productId._id, item.quantity - 1)}
                      className="quantity-btn"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.productId._id, item.quantity + 1)}
                      className="quantity-btn"
                      disabled={item.quantity >= item.productId?.stock}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="item-total">
                    <span className="total-price">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="item-actions">
                    <button
                      onClick={() => handleRemoveItem(item.productId._id, item.productId.name)}
                      className="remove-btn"
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <div className="total-breakdown">
                  <div className="subtotal">
                    <span>Subtotal ({cartCount} items):</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <div className="shipping">
                    <span>Shipping:</span>
                    <span>{total > 500 ? 'Free' : '₹50'}</span>
                  </div>
                  <div className="total">
                    <span>Total:</span>
                    <span>₹{(total + (total > 500 ? 0 : 50)).toLocaleString()}</span>
                  </div>
                </div>
                
                <button 
                  onClick={proceedToCheckout}
                  className="checkout-btn"
                >
                  Proceed to Checkout →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
