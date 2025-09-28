// src/pages/OrderDetails.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setOrder(response.data.data);
        } else {
          setError('Order not found or access denied');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else if (error.response?.status === 404) {
          setError('Order not found');
        } else {
          setError('Failed to load order details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    } else {
      setError('Invalid order ID');
      setLoading(false);
    }
  }, [orderId, isAuthenticated, navigate]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return { bg: '#D4EFDF', color: '#27AE60' };
      case 'shipped':
        return { bg: '#D6EAF8', color: '#2980B9' };
      case 'processing':
        return { bg: '#FCF3CF', color: '#F39C12' };
      case 'pending':
        return { bg: '#FEF9E7', color: '#F39C12' };
      case 'cancelled':
        return { bg: '#FADBD8', color: '#E74C3C' };
      default:
        return { bg: '#E8F4FD', color: '#3498DB' };
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#FAFBFC', minHeight: '100vh' }}>
        <Header />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
          flexDirection: 'column'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #F1F3F4',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '20px', color: '#7F8C8D', fontSize: '1.1rem' }}>
            Loading order details...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#FAFBFC', minHeight: '100vh' }}>
        <Header />
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
            border: '1px solid #F1F3F4'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>❌</div>
            <h2 style={{ color: '#E74C3C', marginBottom: '12px', fontSize: '1.5rem' }}>
              Error Loading Order
            </h2>
            <p style={{ color: '#7F8C8D', fontSize: '1.1rem', marginBottom: '30px' }}>
              {error}
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/account')}
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#5A6FD8'}
                onMouseOut={(e) => e.target.style.background = '#667eea'}
              >
                📋 Back to Orders
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: 'transparent',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#667eea';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#667eea';
                }}
              >
                🔄 Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusColor(order?.status);

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#FAFBFC', minHeight: '100vh' }}>
      <Header />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header Section */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
          border: '1px solid #F1F3F4'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#2C3E50',
                margin: '0 0 10px 0'
              }}>
                Order Details
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#7F8C8D',
                margin: 0,
                fontFamily: 'monospace'
              }}>
                Order ID: {order?._id}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '1rem',
                fontWeight: '600',
                background: statusStyle.bg,
                color: statusStyle.color,
                textTransform: 'capitalize'
              }}>
                {order?.status || 'Unknown'}
              </span>
              <p style={{
                fontSize: '0.9rem',
                color: '#7F8C8D',
                margin: '8px 0 0 0'
              }}>
                Placed on {formatDate(order?.createdAt)}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/account')}
            style={{
              background: 'transparent',
              color: '#667eea',
              border: '2px solid #667eea',
              padding: '10px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#667eea';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#667eea';
            }}
          >
            ← Back to Orders
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'flex-start' }}>
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Order Items */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
              border: '1px solid #F1F3F4'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#2C3E50',
                margin: '0 0 25px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                🛒 Order Items ({order?.items?.length || 0})
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {order?.items?.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    gap: '20px',
                    padding: '20px',
                    border: '1px solid #F1F3F4',
                    borderRadius: '15px',
                    background: '#FAFBFC',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid #E9ECEF',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {item.productId?.imageUrl ? (
                        <img 
                          src={item.productId.imageUrl} 
                          alt={item.productId?.name || 'Product'} 
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '2rem' }}>📦</span>
                      )}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#2C3E50',
                        margin: '0 0 8px 0'
                      }}>
                        {item.productId?.name || item.name || 'Product Name'}
                      </h3>
                      <p style={{
                        fontSize: '0.9rem',
                        color: '#7F8C8D',
                        margin: '0 0 8px 0'
                      }}>
                        Brand: {item.productId?.brand || item.brand || 'N/A'} • 
                        Model: {item.productId?.model || item.model || 'N/A'}
                      </p>
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.9rem',
                          color: '#495057',
                          fontWeight: '500'
                        }}>
                          Qty: {item.quantity}
                        </span>
                        <span style={{
                          fontSize: '0.9rem',
                          color: '#495057',
                          fontWeight: '500'
                        }}>
                          Unit Price: ₹{(item.price || 0).toLocaleString()}
                        </span>
                        <span style={{
                          fontSize: '1.1rem',
                          color: '#2C3E50',
                          fontWeight: '700'
                        }}>
                          Total: ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            {order?.shippingAddress && (
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                border: '1px solid #F1F3F4'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2C3E50',
                  margin: '0 0 20px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  🚚 Shipping Information
                </h2>
                
                <div style={{
                  background: '#F8F9FA',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #E9ECEF'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div>
                      <p style={{ margin: '0 0 5px 0', color: '#6C757D', fontSize: '0.9rem', fontWeight: '500' }}>
                        Name:
                      </p>
                      <p style={{ margin: '0', fontSize: '1rem', color: '#2C3E50', fontWeight: '600' }}>
                        {order.shippingAddress.name}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 5px 0', color: '#6C757D', fontSize: '0.9rem', fontWeight: '500' }}>
                        Phone:
                      </p>
                      <p style={{ margin: '0', fontSize: '1rem', color: '#2C3E50', fontWeight: '600' }}>
                        {order.shippingAddress.phone}
                      </p>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <p style={{ margin: '0 0 5px 0', color: '#6C757D', fontSize: '0.9rem', fontWeight: '500' }}>
                        Address:
                      </p>
                      <p style={{ margin: '0', fontSize: '1rem', color: '#2C3E50', fontWeight: '600', lineHeight: '1.5' }}>
                        {order.shippingAddress.street}, {order.shippingAddress.city}<br/>
                        {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Order Summary */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '25px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
              border: '1px solid #F1F3F4'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#2C3E50',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                💰 Order Summary
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6C757D', fontSize: '0.9rem' }}>Subtotal:</span>
                  <span style={{ color: '#2C3E50', fontWeight: '600' }}>
                    ₹{(order?.orderSummary?.subtotal || order?.subtotal || 0).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6C757D', fontSize: '0.9rem' }}>Tax:</span>
                  <span style={{ color: '#2C3E50', fontWeight: '600' }}>
                    ₹{(order?.orderSummary?.tax || order?.tax || 0).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6C757D', fontSize: '0.9rem' }}>Shipping:</span>
                  <span style={{ color: order?.orderSummary?.shipping === 0 || order?.shipping === 0 ? '#28A745' : '#2C3E50', fontWeight: '600' }}>
                    {(order?.orderSummary?.shipping === 0 || order?.shipping === 0) ? 'FREE' : `₹${(order?.orderSummary?.shipping || order?.shipping || 0).toLocaleString()}`}
                  </span>
                </div>
                <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #E9ECEF' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#2C3E50', fontSize: '1.1rem', fontWeight: '700' }}>Total:</span>
                  <span style={{ color: '#2C3E50', fontSize: '1.3rem', fontWeight: '700' }}>
                    ₹{(order?.orderSummary?.total || order?.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '25px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
              border: '1px solid #F1F3F4'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#2C3E50',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                💳 Payment Info
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ color: '#6C757D', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>
                    Payment Method:
                  </span>
                  <span style={{ color: '#2C3E50', fontWeight: '600', textTransform: 'capitalize' }}>
                    {order?.paymentMethod || 'N/A'}
                  </span>
                </div>
                {order?.paymentId && (
                  <div>
                    <span style={{ color: '#6C757D', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>
                      Payment ID:
                    </span>
                    <span style={{ color: '#2C3E50', fontWeight: '600', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {order.paymentId}
                    </span>
                  </div>
                )}
                <div>
                  <span style={{ color: '#6C757D', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>
                    Payment Status:
                  </span>
                  <span style={{
                    color: order?.paymentStatus === 'paid' ? '#28A745' : '#F39C12',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {order?.paymentStatus || 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '25px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
              border: '1px solid #F1F3F4'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#2C3E50',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ⚡ Actions
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => window.open(`http://localhost:5000/api/orders/${order._id}/invoice`, '_blank')}
                  style={{
                    background: '#28A745',
                    color: 'white',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#218838'}
                  onMouseOut={(e) => e.target.style.background = '#28A745'}
                >
                  📄 Download Invoice
                </button>
                
                <button
                  onClick={() => window.print()}
                  style={{
                    background: 'transparent',
                    color: '#667eea',
                    border: '2px solid #667eea',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#667eea';
                    e.target.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#667eea';
                  }}
                >
                  🖨️ Print Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .container {
            padding: 20px 15px !important;
          }
          
          .order-details-grid {
            grid-template-columns: 1fr !important;
          }
          
          .order-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            text-align: left !important;
          }
          
          .item-card {
            flex-direction: column !important;
            text-align: center !important;
          }
          
          .item-image {
            width: 100px !important;
            height: 100px !important;
          }
        }
        
        @media print {
          header, .back-button, .actions-card {
            display: none !important;
          }
          
          body {
            background: white !important;
          }
          
          .container {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetails;