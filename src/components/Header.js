// src/components/Header.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useAdmin } from '../hooks/useAdmin';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { isAdmin } = useAdmin();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  // Handle window resize for responsive design
  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  // Responsive style functions
  const getResponsiveStyle = (mobile, tablet, desktop) => {
    if (windowWidth <= 480) return mobile;
    if (windowWidth <= 768) return tablet;
    return desktop;
  };

  return (
    <>
      {/* Responsive CSS Injection */}
      <style jsx>{`
        @media (max-width: 480px) {
          .mobile-nav-toggle { display: block !important; }
          .hide-mobile { display: none !important; }
          .show-mobile { display: block !important; }
          .brand-text h1 { font-size: 1.2rem !important; }
          .brand-text p { font-size: 0.75rem !important; }
          .header-content { flex-wrap: wrap !important; }
          .search-bar-container { order: 3; width: 100%; margin-top: 10px; }
        }
        
        @media (min-width: 481px) and (max-width: 768px) {
          .mobile-nav-toggle { display: block !important; }
          .hide-mobile { display: none !important; }
          .brand-text h1 { font-size: 1.4rem !important; }
          .brand-text p { font-size: 0.8rem !important; }
        }
        
        @media (min-width: 769px) {
          .mobile-nav-toggle { display: none !important; }
          .show-mobile { display: none !important; }
          .hide-mobile { display: block !important; }
        }
        
        .responsive-container {
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
        }
        
        .mobile-menu.active {
          animation: slideInTop 0.3s ease-out;
        }
        
        @keyframes slideInTop {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        /* Touch-friendly buttons for mobile */
        @media (max-width: 768px) {
          button, .mobile-menu a {
            min-height: 44px;
            min-width: 44px;
          }
        }
        
        /* Prevent horizontal scroll */
        .overflow-fix {
          overflow-x: hidden;
          max-width: 100%;
        }
        
        .full-width {
          width: 100%;
          max-width: 100vw;
        }
      `}</style>
      {/* Top Bar - Mobile Responsive */}
      <div className="header-top-bar overflow-fix full-width" style={{
        background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)',
        color: 'white',
        padding: '8px 0',
        fontSize: '13px',
        fontWeight: '500',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}>
        <div className="container full-width" style={{ 
          maxWidth: '100%', 
          margin: '0 auto', 
          padding: '0 10px',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}>
          <div className="top-bar-content overflow-fix" style={{ 
            display: 'flex', 
            justifyContent: window.innerWidth <= 768 ? 'center' : 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: window.innerWidth <= 768 ? '8px' : '10px',
            width: '100%',
            maxWidth: '100%',
            overflowX: 'hidden'
          }}>
            <div className="contact-info" style={{ 
              display: 'flex', 
              gap: window.innerWidth <= 768 ? '12px' : '20px', 
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-start',
              fontSize: window.innerWidth <= 768 ? '11px' : '13px'
            }}>
              <span className="contact-phone" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                minWidth: 'fit-content',
                whiteSpace: 'nowrap'
              }}>
                <span style={{ fontSize: '14px' }}>📞</span> +91 8838686407
              </span>
              {window.innerWidth > 480 && (
                <span className="contact-email" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}>
                  <span style={{ fontSize: '14px' }}>✉️</span> info.jaimaaruthi@gmail.com
                </span>
              )}
            </div>
            {window.innerWidth > 768 && (
              <div className="store-hours" style={{ 
                display: 'flex', 
                gap: '20px', 
                alignItems: 'center' 
              }}>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  whiteSpace: 'nowrap'
                }}>
                  <span style={{ fontSize: '16px' }}>🚚</span> Free Delivery on orders above ₹2000
                </span>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}>
                  <span style={{ fontSize: '16px' }}>🕒</span> Mon-Sat: 9AM-8PM
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Header - Mobile Responsive */}
      <header className="main-header overflow-fix full-width" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        color: '#2c3e50',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        border: '1px solid rgba(255,255,255,0.2)',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}>
        <div className="container full-width" style={{ 
          maxWidth: '100%', 
          margin: '0 auto', 
          padding: '0 10px',
          boxSizing: 'border-box'
        }}>
          <div className="header-content overflow-fix" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: window.innerWidth <= 768 ? '10px 0' : '12px 0',
            flexWrap: 'wrap',
            gap: '10px',
            width: '100%',
            maxWidth: '100%'
          }}>
            {/* Logo - Mobile Responsive */}
            <Link to="/" className="logo-section" style={{ textDecoration: 'none', color: '#2c3e50' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: getResponsiveStyle('8px', '10px', '12px') }}>
                <div style={{ 
                  fontSize: getResponsiveStyle('1.4rem', '1.6rem', '1.8rem'),
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: getResponsiveStyle('10px', '11px', '12px'),
                  width: getResponsiveStyle('40px', '45px', '50px'),
                  height: getResponsiveStyle('40px', '45px', '50px'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.3)',
                  flexShrink: 0
                }}>
                  ⚡
                </div>
                <div className="brand-text">
                  <h1 className="brand-title" style={{ 
                    margin: 0, 
                    fontSize: getResponsiveStyle('1.2rem', '1.4rem', '1.6rem'), 
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: '1.2',
                    whiteSpace: 'nowrap'
                  }}>
                    ELECTROSTORE
                  </h1>
                  <p style={{ 
                    margin: 0, 
                    fontSize: getResponsiveStyle('0.7rem', '0.8rem', '0.85rem'), 
                    color: '#666',
                    fontWeight: '500',
                    lineHeight: '1.1',
                    display: windowWidth <= 380 ? 'none' : 'block'
                  }}>
                    {windowWidth <= 600 ? 'Jaimaaruthi Electricals' : 'Jaimaaruthi Electricals and Hardware'}
                  </p>
                </div>
              </div>
            </Link>

            {/* Search Bar - Responsive */}
            <div className="search-bar-container responsive-container" style={{ 
              flex: window.innerWidth <= 768 ? '0 0 auto' : '1', 
              maxWidth: window.innerWidth <= 768 ? 'none' : '500px', 
              margin: window.innerWidth <= 768 ? '0' : '0 20px',
              position: 'relative',
              display: window.innerWidth <= 480 ? 'none' : 'block',
              width: window.innerWidth <= 768 ? '100%' : 'auto',
              order: window.innerWidth <= 768 ? '3' : 'initial'
            }}>
              <div className="search-input-wrapper" style={{
                position: 'relative',
                background: '#f8f9fa',
                borderRadius: window.innerWidth <= 768 ? '25px' : '50px',
                overflow: 'hidden',
                border: '2px solid transparent',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="text"
                  placeholder={window.innerWidth <= 768 ? "Search products..." : "Search for electrical products, switches, lights..."}
                  className="responsive-input"
                  style={{
                    width: '100%',
                    padding: window.innerWidth <= 768 ? '10px 50px 10px 16px' : '14px 60px 14px 24px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: window.innerWidth <= 768 ? '13px' : '14px',
                    outline: 'none',
                    fontWeight: '500'
                  }}
                  onFocus={(e) => {
                    e.target.parentElement.style.borderColor = '#667eea';
                    e.target.parentElement.style.background = 'white';
                    e.target.parentElement.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.parentElement.style.borderColor = 'transparent';
                    e.target.parentElement.style.background = '#f8f9fa';
                    e.target.parentElement.style.boxShadow = 'none';
                  }}
                />
                <button className="search-btn" style={{
                  position: 'absolute',
                  right: window.innerWidth <= 768 ? '4px' : '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: window.innerWidth <= 768 ? '32px' : '40px',
                  height: window.innerWidth <= 768 ? '32px' : '40px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: window.innerWidth <= 768 ? '14px' : '16px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-50%) scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(-50%) scale(1)'}
                >
                  🔍
                </button>
              </div>
            </div>

            {/* User Actions - Enhanced */}
            <div className="user-actions" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: getResponsiveStyle('4px', '6px', '8px'),
              flexShrink: 0
            }}>
              {/* Mobile Menu Toggle */}
              <button
                className="mobile-nav-toggle"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                style={{
                  display: 'none',
                  background: 'none',
                  border: 'none',
                  fontSize: getResponsiveStyle('20px', '22px', '24px'),
                  cursor: 'pointer',
                  color: '#333',
                  padding: getResponsiveStyle('6px', '7px', '8px'),
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {showMobileMenu ? '✕' : '☰'}
              </button>

              {/* Cart */}
              <Link to="/cart" className="cart-link" style={{ 
                color: '#2c3e50', 
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: getResponsiveStyle('2px', '3px', '4px'),
                padding: getResponsiveStyle('8px 10px', '10px 12px', '12px 16px'),
                borderRadius: getResponsiveStyle('12px', '14px', '16px'),
                transition: 'all 0.3s ease',
                position: 'relative',
                minWidth: '44px',
                minHeight: '44px',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#2c3e50';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <span style={{ fontSize: getResponsiveStyle('1.2rem', '1.3rem', '1.4rem') }}>🛒</span>
                {windowWidth > 480 && (
                  <span style={{ 
                    fontSize: getResponsiveStyle('9px', '10px', '11px'), 
                    fontWeight: '600',
                    lineHeight: '1'
                  }}>Cart</span>
                )}
                {/* Cart Badge */}
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: getResponsiveStyle('4px', '5px', '6px'),
                    right: getResponsiveStyle('6px', '8px', '10px'),
                    background: '#ff6b6b',
                    color: 'white',
                    borderRadius: '50%',
                    width: getResponsiveStyle('16px', '17px', '18px'),
                    height: getResponsiveStyle('16px', '17px', '18px'),
                    fontSize: getResponsiveStyle('9px', '9px', '10px'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    minWidth: 'fit-content'
                  }}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Wishlist */}
              {windowWidth > 380 && (
                <Link to="/wishlist" className="wishlist-link" style={{ 
                  color: '#2c3e50', 
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: getResponsiveStyle('2px', '3px', '4px'),
                  padding: getResponsiveStyle('8px 10px', '10px 12px', '12px 16px'),
                  borderRadius: getResponsiveStyle('12px', '14px', '16px'),
                  transition: 'all 0.3s ease',
                  minWidth: '44px',
                  minHeight: '44px',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#2c3e50';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <span style={{ fontSize: getResponsiveStyle('1.2rem', '1.3rem', '1.4rem') }}>❤️</span>
                  {windowWidth > 480 && (
                    <span style={{ 
                      fontSize: getResponsiveStyle('9px', '10px', '11px'), 
                      fontWeight: '600',
                      lineHeight: '1'
                    }}>Wishlist</span>
                  )}
                </Link>
              )}

              {/* User Account - Enhanced */}
              <div style={{ position: 'relative', marginLeft: getResponsiveStyle('4px', '6px', '8px') }}>
                {isAuthenticated ? (
                  <div>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        color: 'white',
                        padding: getResponsiveStyle('8px 12px', '10px 16px', '12px 20px'),
                        borderRadius: getResponsiveStyle('25px', '35px', '50px'),
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: getResponsiveStyle('6px', '8px', '10px'),
                        fontWeight: '600',
                        fontSize: getResponsiveStyle('12px', '13px', '14px'),
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                        minHeight: '44px',
                        maxWidth: getResponsiveStyle('120px', '140px', 'none')
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                      }}
                    >
                      <span style={{ 
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: getResponsiveStyle('24px', '26px', '28px'),
                        height: getResponsiveStyle('24px', '26px', '28px'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: getResponsiveStyle('12px', '13px', '14px'),
                        flexShrink: 0
                      }}>👤</span>
                      {windowWidth > 480 && (
                        <>
                          <span style={{ 
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: getResponsiveStyle('60px', '80px', 'none')
                          }}>
                            {user?.name?.split(' ')[0] || 'Account'}
                          </span>
                          <span style={{ fontSize: '12px', opacity: '0.8' }}>▼</span>
                        </>
                      )}
                    </button>
                    
                    {showUserMenu && (
                      <div style={{
                        position: 'absolute',
                        top: '110%',
                        right: 0,
                        background: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(20px)',
                        color: '#2c3e50',
                        borderRadius: '16px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        minWidth: '220px',
                        zIndex: 9999,
                        border: '1px solid rgba(255,255,255,0.2)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          padding: '20px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          Welcome, {user?.name}! 👋
                          {isAdmin && (
                            <div style={{
                              marginTop: '8px',
                              padding: '4px 8px',
                              background: 'rgba(255, 255, 255, 0.2)',
                              borderRadius: '12px',
                              fontSize: '12px',
                              textAlign: 'center'
                            }}>
                              🔑 Administrator Access
                            </div>
                          )}
                        </div>
                        
                        <Link to="/account" style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '16px 20px', 
                          textDecoration: 'none', 
                          color: '#2c3e50',
                          borderBottom: '1px solid #f0f0f0',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => setShowUserMenu(false)}
                        onMouseOver={(e) => e.target.style.background = '#f8f9fa'}
                        onMouseOut={(e) => e.target.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: '16px' }}>👤</span> My Account
                        </Link>

                        {/* Admin Dashboard Link - Only for Admin */}
                        {isAdmin && (
                          <Link to="/admin" style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px 20px', 
                            textDecoration: 'none', 
                            color: '#667eea',
                            borderBottom: '1px solid #f0f0f0',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            background: 'rgba(102, 126, 234, 0.05)'
                          }}
                          onClick={() => setShowUserMenu(false)}
                          onMouseOver={(e) => {
                            e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                            e.target.style.color = '#764ba2';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = 'rgba(102, 126, 234, 0.05)';
                            e.target.style.color = '#667eea';
                          }}
                          >
                            <span style={{ fontSize: '16px' }}>🔧</span> Admin Dashboard
                          </Link>
                        )}
                        
                        <Link to="/orders" style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '16px 20px', 
                          textDecoration: 'none', 
                          color: '#2c3e50',
                          borderBottom: '1px solid #f0f0f0',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => setShowUserMenu(false)}
                        onMouseOver={(e) => e.target.style.background = '#f8f9fa'}
                        onMouseOut={(e) => e.target.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: '16px' }}>📦</span> My Orders
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px 20px',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            color: '#dc3545',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#fff5f5'}
                          onMouseOut={(e) => e.target.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: '16px' }}>🚪</span> Logout
                        </button>
                      </div>
                    )}
                  </div>
                  ) : (
                  <button
                    onClick={handleLogin}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '50px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                    }}
                  >
                    👤 Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Menu - Desktop */}
      <nav className="hide-mobile" style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #f0f0f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '0',
            padding: '0',
            flexWrap: 'wrap'
          }}>
            {[
              { path: '/', label: '🏠 Home', icon: '🏠', isPublic: true },
              { path: `/products?category=${encodeURIComponent('Electrical Goods')}`, label: '⚡ Electrical', icon: '⚡', isPublic: true },
              { path: `/products?category=${encodeURIComponent('Switches & Sockets')}`, label: '🔌 Switches', icon: '🔌', isPublic: true },
              { path: `/products?category=${encodeURIComponent('Lighting Solutions')}`, label: '💡 Lighting', icon: '💡', isPublic: true },
              { path: `/products?category=${encodeURIComponent('Hardware & Tools')}`, label: '🔧 Tools', icon: '🔧', isPublic: true },
              { path: '/admin', label: '🔧 Admin Panel', icon: '🔧', isPublic: false, adminOnly: true },
              { path: '/add-product', label: '➕ Add Product', icon: '➕', isPublic: false, adminOnly: true },
              { path: '/about', label: 'ℹ️ About', icon: 'ℹ️', isPublic: true },
              { path: '/contact', label: '📞 Contact', icon: '📞', isPublic: true }
            ].filter(item => {
              // Filter out admin-only items if user is not admin
              if (item.adminOnly) {
                return isAdmin;
              }
              return true;
            }).map((item, index) => (
              <Link key={index} to={item.path} style={{ 
                textDecoration: 'none', 
                color: '#2c3e50', 
                fontWeight: '600',
                padding: '16px 20px',
                borderRadius: '0',
                transition: 'all 0.3s ease',
                fontSize: '14px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#2c3e50';
                e.target.style.transform = 'translateY(0)';
              }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span>{item.label.replace(item.icon + ' ', '')}</span>
                {/* Admin badge for admin-only items */}
                {item.adminOnly && (
                  <span style={{
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    marginLeft: '4px'
                  }}>
                    ADMIN
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div
          className="mobile-menu active"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            padding: '80px 20px 20px',
            overflowY: 'auto',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <button
            onClick={() => setShowMobileMenu(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#333',
              padding: '8px',
              borderRadius: '8px'
            }}
          >
            ✕
          </button>

          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
            }}>
              ELECTROSTORE
            </h2>
            <p style={{ color: '#666', fontSize: '14px' }}>Jaimaaruthi Electricals and Hardware</p>
          </div>

          {[
            { path: '/', label: '🏠 Home', icon: '🏠', isPublic: true },
            { path: `/products?category=${encodeURIComponent('Electrical Goods')}`, label: '⚡ Electrical', icon: '⚡', isPublic: true },
            { path: `/products?category=${encodeURIComponent('Switches & Sockets')}`, label: '🔌 Switches', icon: '🔌', isPublic: true },
            { path: `/products?category=${encodeURIComponent('Lighting Solutions')}`, label: '💡 Lighting', icon: '💡', isPublic: true },
            { path: `/products?category=${encodeURIComponent('Hardware & Tools')}`, label: '🔧 Tools', icon: '🔧', isPublic: true },
            { path: '/about', label: 'ℹ️ About', icon: 'ℹ️', isPublic: true },
            { path: '/contact', label: '📞 Contact', icon: '📞', isPublic: true },
            { path: '/cart', label: '🛒 Cart', icon: '🛒', isPublic: true },
            { path: '/admin', label: '🔧 Admin Panel', icon: '🔧', isPublic: false, adminOnly: true },
            { path: '/add-product', label: '➕ Add Product', icon: '➕', isPublic: false, adminOnly: true }
          ].filter(item => {
            // Filter out admin-only items if user is not admin
            if (item.adminOnly) {
              return isAdmin;
            }
            return true;
          }).map((item, index) => (
            <Link 
              key={index} 
              to={item.path}
              onClick={() => setShowMobileMenu(false)}
              style={{
                display: 'block',
                padding: '18px 0',
                textDecoration: 'none',
                color: '#333',
                fontSize: '18px',
                fontWeight: '500',
                borderBottom: '1px solid #eee',
                transition: 'color 0.3s ease',
                textAlign: 'center'
              }}
              onMouseOver={(e) => e.target.style.color = '#667eea'}
              onMouseOut={(e) => e.target.style.color = '#333'}
            >
              <span style={{ marginRight: '12px', fontSize: '20px' }}>{item.icon}</span>
              {item.label.replace(item.icon + ' ', '')}
              {item.adminOnly && (
                <span style={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  marginLeft: '8px'
                }}>
                  ADMIN
                </span>
              )}
            </Link>
          ))}

          {/* Mobile Auth Buttons */}
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            {isAuthenticated ? (
              <div>
                <p style={{ marginBottom: '20px', fontSize: '16px', color: '#666' }}>
                  Welcome, <strong>{user?.name}</strong>
                </p>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                  className="btn-full-mobile"
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%',
                    maxWidth: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  handleLogin();
                  setShowMobileMenu(false);
                }}
                className="btn-full-mobile"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                👤 Login
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
