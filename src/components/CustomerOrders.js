import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

const CustomerOrders = () => {
  const [ordersData, setOrdersData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    startDate: '',
    endDate: ''
  });

  const fetchOrdersData = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      
      // Build query parameters more explicitly
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      // Add filters only if they have values
      if (filters.status) queryParams.set('status', filters.status);
      if (filters.paymentMethod) queryParams.set('paymentMethod', filters.paymentMethod);
      if (filters.startDate) queryParams.set('startDate', filters.startDate);
      if (filters.endDate) queryParams.set('endDate', filters.endDate);
      
      console.log('Fetching orders with params:', queryParams.toString());
      
      const response = await api.get(`/orders/admin/all-orders?${queryParams}`);
      if (response.data?.success) {
        setOrdersData(response.data.data);
        setCurrentPage(page);
        console.log('Orders fetched successfully:', response.data.data);
      } else {
        console.error('Failed to fetch orders:', response.data);
      }
    } catch (error) {
      console.error('Error fetching orders data:', error);
      alert('Failed to fetch orders data. Please check if you have admin privileges.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrdersData();
  }, [fetchOrdersData]);

  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await api.put(`/orders/admin/update-status/${orderId}`, {
        status: newStatus
      });

      if (response.data?.success) {
        // Update the local order data
        setOrdersData(prevData => ({
          ...prevData,
          orders: prevData.orders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        }));
        
        alert(`✅ Order status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(`❌ Failed to update order status: ${error.response?.data?.message || error.message}`);
    }
  };

  // Auto-apply filters when they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('Filters changed, applying:', filters);
      fetchOrdersData(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters, fetchOrdersData]);

  const handleFilterChange = (key, value) => {
    console.log(`Filter changed: ${key} = ${value}`);
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    console.log('Clearing filters');
    setFilters({
      status: '',
      paymentMethod: '',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: { bg: '#fff3cd', color: '#856404', text: '⏳ Pending' },
      confirmed: { bg: '#d4edda', color: '#155724', text: '✅ Confirmed' },
      processing: { bg: '#cce7ff', color: '#004085', text: '🔄 Processing' },
      shipped: { bg: '#e7f3ff', color: '#0056b3', text: '🚚 Shipped' },
      delivered: { bg: '#d1ecf1', color: '#0c5460', text: '📦 Delivered' },
      cancelled: { bg: '#f8d7da', color: '#721c24', text: '❌ Cancelled' }
    };

    const style = statusStyles[status] || statusStyles.pending;
    return (
      <span style={{
        background: style.bg,
        color: style.color,
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {style.text}
      </span>
    );
  };

  const getPaymentBadge = (method, status) => {
    const methodStyles = {
      cod: { icon: '💵', name: 'COD' },
      upi: { icon: '📱', name: 'UPI' },
      razorpay: { icon: '💳', name: 'Card/Wallet' },
      card: { icon: '💳', name: 'Card' },
      wallet: { icon: '👛', name: 'Wallet' },
      netbanking: { icon: '🏦', name: 'Net Banking' }
    };

    const statusColor = status === 'paid' ? '#28a745' : status === 'pending' ? '#ffc107' : '#dc3545';
    const methodInfo = methodStyles[method] || { icon: '💳', name: method };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '16px' }}>{methodInfo.icon}</span>
        <span style={{ fontSize: '11px', color: '#6c757d' }}>{methodInfo.name}</span>
        <span style={{ 
          fontSize: '10px', 
          color: statusColor, 
          fontWeight: '600',
          textTransform: 'capitalize'
        }}>
          {status}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '25px',
        margin: '20px 0'
      }}>
        <div style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite',
          marginRight: '15px'
        }}></div>
        <p style={{ fontSize: '18px', color: '#666' }}>Loading customer orders...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '25px',
        padding: '25px',
        marginBottom: '30px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', margin: '0 0 20px 0', color: '#2c3e50' }}>
          🛍️ Customer Orders Management
          {(filters.status || filters.paymentMethod || filters.startDate || filters.endDate) && (
            <span style={{
              marginLeft: '10px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              Filters Active
            </span>
          )}
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
              Order Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '2px solid #f0f0f0',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
              Payment Method
            </label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '2px solid #f0f0f0',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="">All Methods</option>
              <option value="cod">Cash on Delivery</option>
              <option value="upi">UPI Payment</option>
              <option value="razorpay">Razorpay</option>
              <option value="card">Card Payment</option>
              <option value="wallet">Wallet</option>
              <option value="netbanking">Net Banking</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '2px solid #f0f0f0',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '2px solid #f0f0f0',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={clearFilters}
            style={{
              background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '15px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🔄 Clear Filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      {ordersData && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '25px',
          padding: '30px',
          marginBottom: '30px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: '#2c3e50' }}>
              📋 Order Details ({ordersData.pagination.totalOrders} total)
            </h3>
          </div>

          {ordersData.orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📭</div>
              <h4>No orders found</h4>
              <p>Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Order</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Customer</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Items</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Amount</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Payment</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData.orders.map((order, index) => (
                    <tr key={order._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '15px 8px', verticalAlign: 'top' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#212529', fontSize: '13px' }}>
                            #{order.orderNumber}
                          </div>
                          <div style={{ color: '#6c757d', fontSize: '11px' }}>
                            {order.trackingId && `Track: ${order.trackingId}`}
                          </div>
                        </div>
                      </td>
                      
                      <td style={{ padding: '15px 8px', verticalAlign: 'top' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#212529', fontSize: '13px' }}>
                            {order.customer.orderDetails.name}
                          </div>
                          <div style={{ color: '#6c757d', fontSize: '11px' }}>
                            {order.customer.orderDetails.email}
                          </div>
                          <div style={{ color: '#6c757d', fontSize: '11px' }}>
                            📞 {order.customer.orderDetails.phone}
                          </div>
                          <div style={{ color: '#6c757d', fontSize: '10px', marginTop: '2px' }}>
                            📍 {order.customer.orderDetails.address.details.city}, {order.customer.orderDetails.address.details.state}
                          </div>
                        </div>
                      </td>
                      
                      <td style={{ padding: '15px 8px', verticalAlign: 'top' }}>
                        <div style={{ maxWidth: '200px' }}>
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} style={{ fontSize: '11px', color: '#495057', marginBottom: '2px' }}>
                              • {item.product.name} (×{item.quantity})
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div style={{ fontSize: '10px', color: '#6c757d', fontStyle: 'italic' }}>
                              +{order.items.length - 2} more items
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td style={{ padding: '15px 8px', textAlign: 'center', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '600', color: '#28a745', fontSize: '14px' }}>
                          ₹{order.orderSummary.total.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '10px', color: '#6c757d' }}>
                          Items: {order.orderSummary.itemCount}
                        </div>
                      </td>
                      
                      <td style={{ padding: '15px 8px', textAlign: 'center', verticalAlign: 'top' }}>
                        {getPaymentBadge(order.payment.method, order.payment.status)}
                      </td>
                      
                      <td style={{ padding: '15px 8px', textAlign: 'center', verticalAlign: 'top' }}>
                        <StatusDropdown 
                          orderId={order._id}
                          currentStatus={order.status}
                          onStatusUpdate={(newStatus) => handleStatusUpdate(order._id, newStatus)}
                        />
                      </td>
                      
                      <td style={{ padding: '15px 8px', textAlign: 'center', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '11px', color: '#495057' }}>
                          {new Date(order.dates.orderDate).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '10px', color: '#6c757d' }}>
                          {new Date(order.dates.orderDate).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {ordersData.pagination.totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              marginTop: '25px',
              padding: '15px'
            }}>
              <button
                onClick={() => fetchOrdersData(currentPage - 1)}
                disabled={currentPage <= 1}
                style={{
                  background: currentPage <= 1 ? '#e9ecef' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: currentPage <= 1 ? '#6c757d' : 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ← Previous
              </button>

              <span style={{ fontSize: '14px', color: '#495057' }}>
                Page {ordersData.pagination.currentPage} of {ordersData.pagination.totalPages}
              </span>

              <button
                onClick={() => fetchOrdersData(currentPage + 1)}
                disabled={!ordersData.pagination.hasMore}
                style={{
                  background: !ordersData.pagination.hasMore ? '#e9ecef' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: !ordersData.pagination.hasMore ? '#6c757d' : 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: !ordersData.pagination.hasMore ? 'not-allowed' : 'pointer'
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Status Dropdown Component for Admin
const StatusDropdown = ({ orderId, currentStatus, onStatusUpdate }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#ffc107', icon: '⏳' },
    { value: 'confirmed', label: 'Confirmed', color: '#17a2b8', icon: '✅' },
    { value: 'processing', label: 'Processing', color: '#007bff', icon: '🔄' },
    { value: 'shipped', label: 'Shipped', color: '#6f42c1', icon: '🚚' },
    { value: 'delivered', label: 'Delivered', color: '#28a745', icon: '📦' },
    { value: 'completed', label: 'Completed', color: '#28a745', icon: '🎉' },
    { value: 'cancelled', label: 'Cancelled', color: '#dc3545', icon: '❌' }
  ];

  const currentStatusOption = statusOptions.find(option => option.value === currentStatus) || statusOptions[0];

  const handleStatusChange = (newStatus) => {
    if (newStatus !== currentStatus) {
      onStatusUpdate(newStatus);
    }
    setIsDropdownOpen(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        style={{
          background: currentStatusOption.color,
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          minWidth: '100px',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.opacity = '0.8';
        }}
        onMouseOut={(e) => {
          e.target.style.opacity = '1';
        }}
      >
        <span>{currentStatusOption.icon}</span>
        <span>{currentStatusOption.label}</span>
        <span style={{ fontSize: '8px' }}>▼</span>
      </button>

      {isDropdownOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          minWidth: '140px',
          padding: '4px 0'
        }}>
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: option.value === currentStatus ? '#f8f9fa' : 'transparent',
                color: option.value === currentStatus ? option.color : '#333',
                fontSize: '11px',
                fontWeight: option.value === currentStatus ? '600' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textAlign: 'left',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => {
                if (option.value !== currentStatus) {
                  e.target.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseOut={(e) => {
                if (option.value !== currentStatus) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
