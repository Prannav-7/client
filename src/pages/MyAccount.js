// src/pages/MyAccount.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const MyAccount = () => {
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({});
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit Profile Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [editLoading, setEditLoading] = useState(false);
  
  // Change Password Modal states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Get user profile from auth context or localStorage
        if (user) {
          setProfile(user);
        }

        // Fetch orders using the correct endpoint
        const token = localStorage.getItem('token');
        if (token) {
          const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (ordersResponse.data.success) {
            const ordersData = ordersResponse.data.data.orders || [];
            setOrders(ordersData);
            setFilteredOrders(ordersData);
          } else {
            setOrders([]);
            setFilteredOrders([]);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          setError('Please login to view your account details');
          navigate('/login');
        } else {
          setError('Failed to load account data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    let updatedOrders = [...orders];

    if (filter !== '') {
      updatedOrders = updatedOrders.filter((order) =>
        order.status.toLowerCase().includes(filter.toLowerCase())
      );
    }

    if (sortOrder === 'date') {
      updatedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === 'total') {
      updatedOrders.sort((a, b) => b.totalAmount - a.totalAmount);
    }

    setFilteredOrders(updatedOrders);
  }, [filter, sortOrder, orders]);

  // Handle Edit Profile
  const handleEditProfile = () => {
    setEditForm({
      name: profile.name || '',
      email: profile.email || ''
    });
    setShowEditProfile(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5000/api/users/profile', {
        name: editForm.name,
        email: editForm.email
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setProfile(response.data.user);
        if (updateUser) updateUser(response.data.user);
        setShowEditProfile(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowChangePassword(true);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long!');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5000/api/users/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setShowChangePassword(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        alert('Password updated successfully!');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert(error.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#FAFBFC', minHeight: '100vh' }}>
      <Header />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
          border: '1px solid #F1F3F4'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#2C3E50',
            margin: '0 0 30px 0',
            textAlign: 'center'
          }}>My Account</h2>

          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '300px',
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
                Loading your account...
              </p>
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#E74C3C',
              backgroundColor: '#FFF5F5',
              borderRadius: '15px',
              border: '1px solid #FADBD8'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>❌</div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>Error Loading Account</h3>
              <p style={{ fontSize: '1.1rem' }}>{error}</p>
            </div>
          ) : (
            <>
              {/* Profile Section */}
              <section style={{ marginBottom: '40px' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2C3E50',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  👤 Profile Information
                </h3>
                <div style={{
                  background: '#F8F9FA',
                  padding: '25px',
                  borderRadius: '15px',
                  border: '1px solid #E9ECEF'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div>
                      <p style={{ margin: '0 0 10px 0', color: '#6C757D', fontSize: '0.9rem', fontWeight: '500' }}>
                        <strong>Name:</strong>
                      </p>
                      <p style={{ margin: '0', fontSize: '1.1rem', color: '#2C3E50', fontWeight: '600' }}>
                        {profile.name || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 10px 0', color: '#6C757D', fontSize: '0.9rem', fontWeight: '500' }}>
                        <strong>Email:</strong>
                      </p>
                      <p style={{ margin: '0', fontSize: '1.1rem', color: '#2C3E50', fontWeight: '600' }}>
                        {profile.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div style={{ marginTop: '25px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={handleEditProfile}
                      style={{
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#5A6FD8'}
                      onMouseOut={(e) => e.target.style.background = '#667eea'}
                    >
                      Edit Profile
                    </button>
                    <button 
                      onClick={handleChangePassword}
                      style={{
                        background: 'transparent',
                        color: '#667eea',
                        border: '2px solid #667eea',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem',
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
                      Change Password
                    </button>
                  </div>
                </div>
              </section>

              {/* Order History Section */}
              <section>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2C3E50',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  📦 Order History
                </h3>

                {/* Filters */}
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  marginBottom: '30px',
                  flexWrap: 'wrap',
                  padding: '20px',
                  background: '#F8F9FA',
                  borderRadius: '15px',
                  border: '1px solid #E9ECEF'
                }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#495057',
                      fontSize: '0.9rem'
                    }}>
                      Filter by Status:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., delivered, pending"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #E9ECEF',
                        borderRadius: '12px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#E9ECEF'}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#495057',
                      fontSize: '0.9rem'
                    }}>
                      Sort by:
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #E9ECEF',
                        borderRadius: '12px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">None</option>
                      <option value="date">Date (Newest First)</option>
                      <option value="total">Total Amount</option>
                    </select>
                  </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '80px 20px',
                    background: '#F8F9FA',
                    borderRadius: '15px',
                    border: '1px solid #E9ECEF'
                  }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📦</div>
                    <h3 style={{ marginBottom: '12px', color: '#2C3E50', fontSize: '1.5rem' }}>
                      No Orders Found
                    </h3>
                    <p style={{ color: '#7F8C8D', fontSize: '1.1rem', marginBottom: '30px' }}>
                      {filter ? 'No orders match your current filter.' : 'You haven\'t placed any orders yet.'}
                    </p>
                    <button
                      onClick={() => navigate('/products')}
                      style={{
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        padding: '14px 30px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#5A6FD8'}
                      onMouseOut={(e) => e.target.style.background = '#667eea'}
                    >
                      🛒 Start Shopping
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {filteredOrders.map((order, idx) => (
                      <div key={order._id || idx} style={{
                        background: 'white',
                        border: '2px solid #F1F3F4',
                        borderRadius: '15px',
                        padding: '25px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = '#667eea';
                        e.currentTarget.style.boxShadow = '0 5px 20px rgba(102, 126, 234, 0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = '#F1F3F4';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
                      }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                          <div>
                            <p style={{ margin: '0 0 5px 0', color: '#6C757D', fontSize: '0.9rem', fontWeight: '500' }}>
                              Order ID:
                            </p>
                            <p style={{ margin: '0', fontSize: '1rem', color: '#2C3E50', fontWeight: '600', fontFamily: 'monospace' }}>
                              {order._id || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 5px 0', color: '#6C757D', fontSize: '0.9rem', fontWeight: '500' }}>
                              Date:
                            </p>
                            <p style={{ margin: '0', fontSize: '1rem', color: '#2C3E50', fontWeight: '600' }}>
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 5px 0', color: '#6C757D', fontSize: '0.9rem', fontWeight: '500' }}>
                              Total Amount:
                            </p>
                            <p style={{ margin: '0', fontSize: '1.2rem', color: '#2C3E50', fontWeight: '700' }}>
                              ₹{order.orderSummary?.total ? order.orderSummary.total.toLocaleString() : 
                                order.totalAmount ? order.totalAmount.toLocaleString() : '0'}
                            </p>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 5px 0', color: '#6C757D', fontSize: '0.9rem', fontWeight: '500' }}>
                              Status:
                            </p>
                            <span style={{
                              padding: '6px 14px',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              background: order.status === 'delivered' ? '#D4EFDF' : 
                                         order.status === 'pending' ? '#FEF9E7' : 
                                         order.status === 'cancelled' ? '#FADBD8' : '#E8F4FD',
                              color: order.status === 'delivered' ? '#27AE60' : 
                                     order.status === 'pending' ? '#F39C12' : 
                                     order.status === 'cancelled' ? '#E74C3C' : '#3498DB'
                            }}>
                              {order.status || 'Unknown'}
                            </span>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => navigate(`/order-details/${order._id}`)}
                            style={{
                              background: '#667eea',
                              color: 'white',
                              border: 'none',
                              padding: '10px 20px',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.9rem',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#5A6FD8'}
                            onMouseOut={(e) => e.target.style.background = '#667eea'}
                          >
                            📋 View Details
                          </button>
                          <button
                            onClick={() => window.open(`http://localhost:5000/api/orders/${order._id}/invoice`, '_blank')}
                            style={{
                              background: 'transparent',
                              color: '#28A745',
                              border: '2px solid #28A745',
                              padding: '10px 20px',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.9rem',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.background = '#28A745';
                              e.target.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.background = 'transparent';
                              e.target.style.color = '#28A745';
                            }}
                          >
                            📄 Download Invoice
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '500px',
            margin: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              margin: '0 0 30px 0',
              fontSize: '1.5rem',
              color: '#2C3E50',
              textAlign: 'center'
            }}>
              ✏️ Edit Profile
            </h3>
            
            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#495057'
                }}>
                  Name:
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #E9ECEF',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#E9ECEF'}
                />
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#495057'
                }}>
                  Email:
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #E9ECEF',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#E9ECEF'}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  style={{
                    background: 'transparent',
                    color: '#6C757D',
                    border: '2px solid #E9ECEF',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  style={{
                    background: editLoading ? '#CCC' : '#667eea',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    cursor: editLoading ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {editLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '500px',
            margin: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              margin: '0 0 30px 0',
              fontSize: '1.5rem',
              color: '#2C3E50',
              textAlign: 'center'
            }}>
              🔒 Change Password
            </h3>
            
            <form onSubmit={handleUpdatePassword}>
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#495057'
                }}>
                  Current Password:
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #E9ECEF',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#E9ECEF'}
                />
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#495057'
                }}>
                  New Password:
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #E9ECEF',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#E9ECEF'}
                />
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#495057'
                }}>
                  Confirm New Password:
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #E9ECEF',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#E9ECEF'}
                />
                {passwordForm.newPassword && passwordForm.confirmPassword && 
                 passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p style={{ color: '#E74C3C', fontSize: '14px', marginTop: '5px' }}>
                    Passwords do not match
                  </p>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  style={{
                    background: 'transparent',
                    color: '#6C757D',
                    border: '2px solid #E9ECEF',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading || (passwordForm.newPassword !== passwordForm.confirmPassword)}
                  style={{
                    background: (passwordLoading || (passwordForm.newPassword !== passwordForm.confirmPassword)) ? '#CCC' : '#667eea',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    cursor: (passwordLoading || (passwordForm.newPassword !== passwordForm.confirmPassword)) ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MyAccount;
