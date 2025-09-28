import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { addToCart: addToCartContext } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, navigate]);

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist');
      if (response.data.success) {
        setWishlist(response.data.data.products || []);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await api.delete(`/wishlist/remove/${productId}`);
      if (response.data.success) {
        setWishlist(prev => prev.filter(product => product._id !== productId));
        alert('Item removed from wishlist');
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert('Failed to remove item from wishlist');
    }
  };

  const addToCart = async (productId) => {
    try {
      const success = await addToCartContext(productId, 1);
      
      if (success) {
        alert('Product added to cart successfully!');
      } else {
        alert('Failed to add product to cart');
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert('Error adding to cart');
    }
  };

  const clearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        // Remove all items individually since there might not be a clear all endpoint
        const promises = wishlist.map(product => 
          api.delete(`/wishlist/remove/${product._id}`)
        );
        await Promise.all(promises);
        setWishlist([]);
        alert('Wishlist cleared successfully');
      } catch (error) {
        console.error('Error clearing wishlist:', error);
        alert('Failed to clear wishlist');
      }
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#666', fontSize: '18px' }}>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Header />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Wishlist Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '2.5rem', 
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                ❤️ My Wishlist
              </h1>
              <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '16px' }}>
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
              </p>
            </div>
            {wishlist.length > 0 && (
              <button
                onClick={clearWishlist}
                style={{
                  backgroundColor: '#ff4757',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                🗑️ Clear All
              </button>
            )}
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '60px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💔</div>
            <h2 style={{ color: '#333', marginBottom: '15px' }}>Your wishlist is empty</h2>
            <p style={{ color: '#666', marginBottom: '30px', fontSize: '16px' }}>
              Start adding products you love to your wishlist!
            </p>
            <Link 
              to="/products" 
              style={{
                backgroundColor: '#667eea',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '25px',
                textDecoration: 'none',
                fontWeight: '500',
                display: 'inline-block',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🛍️ Browse Products
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <Link 
                to="/products"
                style={{
                  backgroundColor: 'transparent',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ← Continue Shopping
              </Link>
              <Link 
                to="/cart"
                style={{
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🛒 View Cart
              </Link>
            </div>

            {/* Wishlist Items Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {wishlist.map((product) => (
                <div key={product._id} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                }}
                >
                  {/* Product Image */}
                  <div style={{
                    height: '200px',
                    backgroundColor: '#f8f9fa',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={product.imageUrl ? `http://localhost:5000${product.imageUrl}` : 'http://localhost:5000/images/products/default-product.png'}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.src = '/images/default-product.svg';
                      }}
                    />
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(255, 71, 87, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px'
                      }}
                      title="Remove from wishlist"
                    >
                      ×
                    </button>
                  </div>

                  {/* Product Details */}
                  <div style={{ padding: '20px' }}>
                    <h3 style={{
                      margin: '0 0 10px 0',
                      fontSize: '18px',
                      color: '#333',
                      fontWeight: '600',
                      lineHeight: '1.4'
                    }}>
                      {product.name}
                    </h3>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <span style={{
                        color: '#666',
                        fontSize: '14px',
                        backgroundColor: '#f8f9fa',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        marginRight: '8px'
                      }}>
                        📦 {product.category}
                      </span>
                      <span style={{
                        color: '#666',
                        fontSize: '14px',
                        backgroundColor: '#f8f9fa',
                        padding: '4px 8px',
                        borderRadius: '12px'
                      }}>
                        🏢 {product.brand}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px'
                    }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#667eea'
                      }}>
                        ₹{product.price?.toLocaleString()}
                      </div>
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        backgroundColor: product.stock > 0 ? '#d4edda' : '#f8d7da',
                        color: product.stock > 0 ? '#155724' : '#721c24',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {product.stock > 0 ? `✅ ${product.stock} in stock` : '❌ Out of stock'}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '10px'
                    }}>
                      <button
                        onClick={() => addToCart(product._id)}
                        disabled={product.stock === 0}
                        style={{
                          backgroundColor: product.stock > 0 ? '#667eea' : '#ccc',
                          color: 'white',
                          border: 'none',
                          padding: '12px 20px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        🛒 Add to Cart
                      </button>
                      <Link
                        to={`/products/${product._id}`}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#667eea',
                          border: '1px solid #667eea',
                          padding: '12px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        👁️
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default WishlistPage;
