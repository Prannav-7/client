// src/pages/Home.js - Modern Sathiya-inspired UI
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async (productId, productName) => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      const success = await addToCart(productId, 1);
      
      if (success) {
        alert(`✅ ${productName} added to cart successfully!`);
      } else {
        alert('❌ Failed to add product to cart');
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert('❌ Error adding to cart: ' + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        if (response.data.success) {
          setFeaturedProducts(response.data.data.slice(0, 8));
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const categories = [
    { name: 'Electrical Goods', icon: '⚡', color: '#FF6B35', path: `/products?category=${encodeURIComponent('Electrical Goods')}` },
    { name: 'Switches & Sockets', icon: '🔌', color: '#4ECDC4', path: `/products?category=${encodeURIComponent('Switches & Sockets')}` },
    { name: 'Lighting Solutions', icon: '💡', color: '#FFD93D', path: `/products?category=${encodeURIComponent('Lighting Solutions')}` },
    { name: 'Fans & Ventilation', icon: '🌀', color: '#6BCF7F', path: `/products?category=${encodeURIComponent('Fans & Ventilation')}` },
    { name: 'Wiring & Cables', icon: '🔗', color: '#4D96FF', path: `/products?category=${encodeURIComponent('Wiring & Cables')}` },
    { name: 'Hardware & Tools', icon: '🔧', color: '#9B59B6', path: `/products?category=${encodeURIComponent('Hardware & Tools')}` },
    { name: 'Power Tools', icon: '⚒️', color: '#E74C3C', path: `/products?category=${encodeURIComponent('Power Tools')}` },
    { name: 'Safety Equipment', icon: '🦺', color: '#F39C12', path: `/products?category=${encodeURIComponent('Safety Equipment')}` }
  ];

  return (
    <div className="overflow-fix full-width" style={{ 
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      backgroundColor: '#FAFBFC', 
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      <Header />

      {/* Hero Banner - Mobile First Responsive */}
      <section className="hero-section full-width" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div className="hero-container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 12px',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '20px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          boxSizing: 'border-box'
        }}>
          {/* Left Content */}
          <div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              padding: '8px 16px',
              borderRadius: '25px',
              display: 'inline-block',
              marginBottom: '20px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '500' }}>
                🚀 Now Open & Serving Customers
              </span>
            </div>

            <h1 className="hero-title" style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: 'white',
              margin: '0 0 20px 0',
              lineHeight: '1.1',
              letterSpacing: '-0.02em'
            }}>
              Premium <span style={{ color: '#FFD93D' }}>Electrical</span><br />
              Solutions
            </h1>

            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255,255,255,0.9)',
              margin: '0 0 40px 0',
              lineHeight: '1.6'
            }}>
              Discover quality electrical products with unbeatable prices. 
              Your trusted partner for all electrical needs in Mettukadai.
            </p>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <Link 
                to="/products" 
                style={{
                  background: 'white',
                  color: '#667eea',
                  padding: '18px 40px',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🛒 Shop Now
              </Link>
              <Link 
                to="/contact" 
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  padding: '18px 40px',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  border: '2px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              >
                📞 Contact Us
              </Link>
            </div>
          </div>

          {/* Right Content - Stats Cards */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {[
              { number: '10K+', text: 'Happy Customers', icon: '😊', color: '#4ECDC4' },
              { number: '5000+', text: 'Products', icon: '📦', color: '#FFD93D' },
              { number: '24/7', text: 'Support', icon: '🎧', color: '#FF6B35' },
              { number: '99%', text: 'Satisfaction', icon: '⭐', color: '#6BCF7F' }
            ].map((stat, index) => (
              <div key={index} style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                padding: '30px 20px',
                borderRadius: '20px',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: stat.color,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  margin: '0 auto 15px',
                  boxShadow: `0 5px 15px ${stat.color}30`
                }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '5px' }}>
                  {stat.number}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                  {stat.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Background Decoration */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
          zIndex: 1
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-5%',
          width: '400px',
          height: '400px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '50%',
          zIndex: 1
        }}></div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
        
        {/* Categories Section - Clean Grid */}
        <section style={{ marginBottom: '100px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#2C3E50',
              margin: '0 0 16px 0',
              letterSpacing: '-0.02em'
            }}>
              Shop by Category
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#7F8C8D',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Browse our comprehensive range of electrical products
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '25px'
          }}>
            {categories.map((category, index) => (
              <Link key={index} to={category.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'white',
                  padding: '40px 30px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid #F1F3F4',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.12)';
                  e.currentTarget.style.borderColor = category.color;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#F1F3F4';
                }}
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: `${category.color}15`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    margin: '0 auto 20px',
                    border: `3px solid ${category.color}30`
                  }}>
                    {category.icon}
                  </div>
                  <h3 style={{
                    margin: '0 0 10px 0',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#2C3E50'
                  }}>
                    {category.name}
                  </h3>
                  <div style={{
                    width: '40px',
                    height: '3px',
                    background: category.color,
                    margin: '0 auto',
                    borderRadius: '2px'
                  }}></div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products Section - Mobile First */}
        <section className="featured-products-section full-width" style={{ width: '100%', boxSizing: 'border-box' }}>
          <div className="container" style={{ 
            textAlign: 'center', 
            marginBottom: '60px',
            padding: '0 10px',
            boxSizing: 'border-box'
          }}>
            <h2 className="section-title text-wrap" style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#2C3E50',
              margin: '0 0 16px 0',
              letterSpacing: '-0.02em',
              lineHeight: '1.2'
            }}>
              Featured Products
            </h2>
            <p className="section-subtitle text-wrap" style={{
              fontSize: '1rem',
              color: '#7F8C8D',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.4'
            }}>
              Handpicked quality products for your electrical needs
            </p>
          </div>

          {loading ? (
            <div className="loading-container" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '300px',
              flexDirection: 'column',
              padding: '20px'
            }}>
              <div className="loading-spinner" style={{
                width: '50px',
                height: '50px',
                border: '4px solid #F1F3F4',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ 
                marginTop: '20px', 
                color: '#7F8C8D', 
                fontSize: '1rem',
                textAlign: 'center'
              }}>
                Loading products...
              </p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="products-grid-container" style={{
              width: '100%',
              padding: '0 10px',
              boxSizing: 'border-box'
            }}>
              <div className="products-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '25px',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}>
                {featuredProducts.map((product, index) => (
                  <div 
                    key={product._id}
                    className="product-card"
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                      border: '1px solid #E8E8E8',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      width: '100%',
                      maxWidth: '320px',
                      margin: '0 auto',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
                    }}
                  >
                    {/* Product Image */}
                    <div className="product-image-container" style={{
                      width: '100%',
                      height: '200px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      marginBottom: '16px',
                      backgroundColor: '#F8F9FA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <img
                        src={product.image || '/images/default-product.svg'}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                        onError={(e) => {
                          e.target.src = '/images/default-product.svg';
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="product-info" style={{
                      flex: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <h3 className="product-name text-wrap" style={{
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#2C3E50',
                          margin: '0 0 8px 0',
                          lineHeight: '1.3',
                          display: '-webkit-box',
                          WebkitLineClamp: '2',
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {product.name}
                        </h3>

                        <p className="product-description text-wrap" style={{
                          fontSize: '0.9rem',
                          color: '#7F8C8D',
                          margin: '0 0 12px 0',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: '3',
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {product.description || 'High-quality electrical product'}
                        </p>
                      </div>

                      {/* Price and Stock */}
                      <div className="product-footer" style={{
                        marginTop: 'auto'
                      }}>
                        <div className="price-stock-info" style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '16px'
                        }}>
                          <span className="product-price" style={{
                            fontSize: '1.3rem',
                            fontWeight: '700',
                            color: '#667eea',
                            display: 'block'
                          }}>
                            ₹{product.price?.toLocaleString()}
                          </span>
                          <span className={`stock-badge ${product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-of-stock'}`} style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            padding: '4px 8px',
                            borderRadius: '20px',
                            backgroundColor: product.stock > 10 ? '#D4EDDA' : 
                                           product.stock > 0 ? '#FFF3CD' : '#F8D7DA',
                            color: product.stock > 10 ? '#155724' : 
                                   product.stock > 0 ? '#856404' : '#721C24'
                          }}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </span>
                        </div>

                        <button 
                          className="add-to-cart-btn"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: product.stock > 0 ? '#667eea' : '#E9ECEF',
                            color: product.stock > 0 ? '#FFFFFF' : '#6C757D',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                            transition: 'all 0.3s ease',
                            textAlign: 'center'
                          }}
                          disabled={product.stock === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (product.stock > 0) {
                              addToCart(product);
                            }
                          }}
                          onMouseEnter={(e) => {
                            if (product.stock > 0) {
                              e.currentTarget.style.backgroundColor = '#5A6FE8';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (product.stock > 0) {
                              e.currentTarget.style.backgroundColor = '#667eea';
                            }
                          }}
                        >
                          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#7F8C8D'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.3rem' }}>No products found</h3>
              <p style={{ margin: 0, fontSize: '1rem' }}>Check back soon for our latest products!</p>
            </div>
          )}
        </section>
                  background: 'white',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid #F1F3F4',
                  position: 'relative'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.08)';
                }}
                >
                  {/* Product Image */}
                  <div style={{
                    width: '100%',
                    height: '240px',
                    background: '#F8F9FA',
                    backgroundImage: `url(${product.imageUrl ? `http://localhost:5000${product.imageUrl}` : '/images/default-product.jpg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}>
                    {/* Discount Badge */}
                    {product.originalPrice && (
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        left: '15px',
                        background: '#E74C3C',
                        color: 'white',
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      background: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      fontSize: '1.2rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      🤍
                    </button>
                  </div>

                  {/* Product Details */}
                  <div style={{ padding: '25px' }}>
                    <div style={{
                      background: '#F8F9FA',
                      color: '#6C757D',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      display: 'inline-block',
                      marginBottom: '15px'
                    }}>
                      {product.category}
                    </div>

                    <h4 style={{
                      margin: '0 0 10px 0',
                      fontSize: '1.2rem',
                      color: '#2C3E50',
                      fontWeight: '600',
                      lineHeight: '1.4'
                    }}>
                      {product.name}
                    </h4>

                    <p style={{
                      color: '#7F8C8D',
                      fontSize: '0.9rem',
                      margin: '0 0 20px 0',
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.description}
                    </p>

                    {/* Price */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '25px'
                    }}>
                      <span style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#2C3E50'
                      }}>
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span style={{
                          fontSize: '1rem',
                          color: '#BDC3C7',
                          textDecoration: 'line-through'
                        }}>
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Link 
                        to={`/products/${product._id}`}
                        style={{
                          flex: 1,
                          background: '#667eea',
                          color: 'white',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          padding: '14px 20px',
                          borderRadius: '12px',
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          border: 'none'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#5A6FD8'}
                        onMouseOut={(e) => e.target.style.background = '#667eea'}
                      >
                        View Details
                      </Link>
                      <button 
                        onClick={() => handleAddToCart(product._id, product.name)}
                        style={{
                          background: '#4ECDC4',
                          color: 'white',
                          border: 'none',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          padding: '14px 20px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#45B7B8'}
                        onMouseOut={(e) => e.target.style.background = '#4ECDC4'}
                      >
                        🛒 Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📦</div>
              <h3 style={{ marginBottom: '12px', color: '#2C3E50', fontSize: '1.5rem' }}>
                No Products Available
              </h3>
              <p style={{ color: '#7F8C8D' }}>
                We're working hard to bring you amazing products. Check back soon!
              </p>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#7F8C8D'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.3rem' }}>No products found</h3>
              <p style={{ margin: 0, fontSize: '1rem' }}>Check back soon for our latest products!</p>
            </div>
          )}
        </section>
      </div>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
        color: 'white',
        padding: '80px 0',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{
            fontSize: '2.5rem',
            marginBottom: '20px',
            fontWeight: '700',
            letterSpacing: '-0.02em'
          }}>
            Ready to Get Started?
          </h2>
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '40px',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: '1.6'
          }}>
            Join thousands of satisfied customers who trust us for their electrical needs
          </p>
          <Link 
            to="/products" 
            style={{
              background: 'white',
              color: '#2C3E50',
              padding: '18px 50px',
              fontSize: '1.1rem',
              fontWeight: '700',
              borderRadius: '50px',
              textDecoration: 'none',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🛒 Explore All Products
          </Link>
        </div>
      </section>

      {/* Enhanced Styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          
          .hero-title {
            font-size: 2.5rem !important;
          }
          
          .stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem !important;
          }
          
          .hero-buttons {
            flex-direction: column !important;
          }
          
          .hero-buttons > * {
            width: 100% !important;
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
