import React, { useState, useEffect } from 'react';
import api from '../api';

const SalesDashboard = () => {
  const [salesData, setSalesData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const fetchSalesData = async (date = selectedDate) => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/admin/daily-sales?date=${date}`);
      if (response.data?.success) {
        setSalesData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      alert('Failed to fetch sales data. Please check if you have admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    fetchSalesData(newDate);
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
        <p style={{ fontSize: '18px', color: '#666' }}>Loading sales data...</p>
      </div>
    );
  }

  if (!salesData) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '25px',
        padding: '40px',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#ff6b6b', fontSize: '1.5rem', marginBottom: '15px' }}>
          📊 No Sales Data Available
        </h3>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Unable to load sales data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Date Selector */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '25px',
        padding: '25px',
        marginBottom: '30px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', margin: '0 0 20px 0', color: '#2c3e50' }}>
          📊 Daily Sales Report
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <label style={{ fontSize: '16px', fontWeight: '600', color: '#666' }}>
            Select Date:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '2px solid #f0f0f0',
              borderRadius: '15px',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
          />
          <button
            onClick={() => fetchSalesData(selectedDate)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '15px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🔄 Refresh
          </button>
        </div>
        <p style={{ color: '#666', margin: '10px 0 0 0', fontSize: '14px' }}>
          Showing data for: <strong>{new Date(selectedDate).toLocaleDateString()}</strong>
        </p>
      </div>

      {/* Sales Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(78, 205, 196, 0.3)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🛍️</div>
          <div style={{ fontSize: '2rem', fontWeight: '900' }}>{salesData.summary.totalOrders}</div>
          <div style={{ fontSize: '1rem', opacity: '0.9' }}>Total Orders</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>💰</div>
          <div style={{ fontSize: '2rem', fontWeight: '900' }}>₹{salesData.summary.totalRevenue.toLocaleString()}</div>
          <div style={{ fontSize: '1rem', opacity: '0.9' }}>Total Revenue</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(76, 175, 80, 0.3)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✅</div>
          <div style={{ fontSize: '2rem', fontWeight: '900' }}>{salesData.summary.completedOrders}</div>
          <div style={{ fontSize: '1rem', opacity: '0.9' }}>Completed</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ffd54f 0%, #ffb74d 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(255, 213, 79, 0.3)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⏳</div>
          <div style={{ fontSize: '2rem', fontWeight: '900' }}>{salesData.summary.pendingOrders}</div>
          <div style={{ fontSize: '1rem', opacity: '0.9' }}>Pending</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(255, 152, 0, 0.3)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📊</div>
          <div style={{ fontSize: '2rem', fontWeight: '900' }}>₹{salesData.summary.averageOrderValue}</div>
          <div style={{ fontSize: '1rem', opacity: '0.9' }}>Avg Order</div>
        </div>

        {salesData.summary.cancelledOrders > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
            color: 'white',
            padding: '25px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(255, 107, 107, 0.3)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>❌</div>
            <div style={{ fontSize: '2rem', fontWeight: '900' }}>{salesData.summary.cancelledOrders}</div>
            <div style={{ fontSize: '1rem', opacity: '0.9' }}>Cancelled</div>
          </div>
        )}
      </div>

      {/* Payment Method Breakdown */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '25px',
        padding: '30px',
        marginBottom: '30px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 20px 0', color: '#2c3e50' }}>
          💳 Payment Method Breakdown
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px'
        }}>
          {Object.entries(salesData.paymentMethodBreakdown).map(([method, data]) => (
            <div
              key={method}
              style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                padding: '20px',
                borderRadius: '15px',
                border: '1px solid #dee2e6'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <span style={{ fontWeight: '600', color: '#495057', textTransform: 'capitalize' }}>
                  {method === 'cod' ? '💵 Cash on Delivery' : 
                   method === 'upi' ? '📱 UPI Payment' :
                   method === 'razorpay' ? '💳 Online Payment' : `📄 ${method}`}
                </span>
              </div>
              <div style={{ color: '#6c757d', fontSize: '14px' }}>
                <div>Orders: <strong>{data.count}</strong></div>
                <div>Revenue: <strong>₹{data.revenue.toLocaleString()}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      {salesData.topProducts && salesData.topProducts.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '25px',
          padding: '30px',
          marginBottom: '30px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 20px 0', color: '#2c3e50' }}>
            🏆 Top Selling Products
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '15px', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Product</th>
                  <th style={{ padding: '15px', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Category</th>
                  <th style={{ padding: '15px', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Qty Sold</th>
                  <th style={{ padding: '15px', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Revenue</th>
                  <th style={{ padding: '15px', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Orders</th>
                </tr>
              </thead>
              <tbody>
                {salesData.topProducts.slice(0, 5).map((product, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '15px', fontWeight: '600', color: '#212529' }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📦'} {product.name}
                    </td>
                    <td style={{ padding: '15px', color: '#6c757d' }}>{product.category}</td>
                    <td style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#495057' }}>
                      {product.totalQuantity}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#28a745' }}>
                      ₹{product.totalRevenue.toLocaleString()}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', color: '#6c757d' }}>
                      {product.orders}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDashboard;
