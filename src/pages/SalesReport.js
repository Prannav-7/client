import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import api from '../api';
import Header from '../components/Header';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const SalesReport = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  
  // Filter states
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin-login');
      return;
    }
    
    if (!user?.isAdmin) {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch sales data
  const fetchSalesData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching sales report data...');
      
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        paymentMethod: selectedPaymentMethod !== 'all' ? selectedPaymentMethod : '',
        status: selectedStatus !== 'all' ? selectedStatus : '',
        category: selectedCategory !== 'all' ? selectedCategory : ''
      });

      const response = await api.get(`/orders/admin/sales-report?${params}`);
      
      if (response.data?.success) {
        console.log('✅ Sales data fetched:', response.data.data);
        setSalesData(response.data.data);
        setFilteredData(response.data.data);
      } else {
        throw new Error('Failed to fetch sales data');
      }
    } catch (error) {
      console.error('❌ Error fetching sales data:', error);
      alert('Failed to fetch sales data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (user?.isAdmin) {
      fetchSalesData();
    }
  }, [user]);

  // Apply filters when they change
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchSalesData();
    }
  }, [dateRange, selectedPaymentMethod, selectedStatus, selectedCategory]);

  // Chart data preparation
  const chartData = useMemo(() => {
    if (!filteredData) return null;

    // Revenue by Date (Line Chart)
    const dailyRevenue = filteredData.dailyRevenue || [];
    const revenueByDateData = {
      labels: dailyRevenue.map(item => new Date(item.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Daily Revenue (₹)',
          data: dailyRevenue.map(item => item.revenue),
          borderColor: 'rgba(102, 126, 234, 1)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgba(102, 126, 234, 1)',
          pointRadius: 5
        },
        {
          label: 'Daily Orders',
          data: dailyRevenue.map(item => item.orders),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          tension: 0.4,
          fill: false,
          pointBackgroundColor: 'rgba(255, 99, 132, 1)',
          pointRadius: 4,
          yAxisID: 'y1'
        }
      ]
    };

    // Payment Method Distribution (Pie Chart)
    const paymentMethods = filteredData.paymentMethodBreakdown || {};
    const paymentMethodData = {
      labels: Object.keys(paymentMethods).map(method => 
        method === 'cod' ? 'Cash on Delivery' : 
        method === 'upi' ? 'UPI Payment' :
        method === 'razorpay' ? 'Online Payment' : method
      ),
      datasets: [
        {
          data: Object.values(paymentMethods).map(item => item.revenue),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 2
        }
      ]
    };

    // Top Products (Bar Chart)
    const topProducts = filteredData.topProducts || [];
    const topProductsData = {
      labels: topProducts.slice(0, 10).map(product => 
        product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name
      ),
      datasets: [
        {
          label: 'Revenue (₹)',
          data: topProducts.slice(0, 10).map(product => product.totalRevenue),
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2
        },
        {
          label: 'Quantity Sold',
          data: topProducts.slice(0, 10).map(product => product.totalQuantity),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          yAxisID: 'y1'
        }
      ]
    };

    // Order Status Distribution (Doughnut Chart)
    const statusBreakdown = filteredData.statusBreakdown || {};
    const statusData = {
      labels: Object.keys(statusBreakdown).map(status => 
        status.charAt(0).toUpperCase() + status.slice(1)
      ),
      datasets: [
        {
          data: Object.values(statusBreakdown).map(item => item.count),
          backgroundColor: [
            'rgba(40, 167, 69, 0.8)',   // confirmed - green
            'rgba(255, 193, 7, 0.8)',    // pending - yellow  
            'rgba(220, 53, 69, 0.8)',    // cancelled - red
            'rgba(23, 162, 184, 0.8)',   // processing - blue
            'rgba(108, 117, 125, 0.8)'   // other - gray
          ],
          borderColor: [
            'rgba(40, 167, 69, 1)',
            'rgba(255, 193, 7, 1)',
            'rgba(220, 53, 69, 1)',
            'rgba(23, 162, 184, 1)',
            'rgba(108, 117, 125, 1)'
          ],
          borderWidth: 2
        }
      ]
    };

    return {
      revenueByDate: revenueByDateData,
      paymentMethods: paymentMethodData,
      topProducts: topProductsData,
      orderStatus: statusData
    };
  }, [filteredData]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue (₹)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Number of Orders'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue (₹)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Quantity Sold'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Header />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '100px 20px',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '25px',
            padding: '60px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <h3 style={{ color: '#2c3e50', margin: '20px 0 10px' }}>Loading Sales Report...</h3>
            <p style={{ color: '#666', fontSize: '16px' }}>Please wait while we fetch your sales data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Header />
      
      <div style={{ padding: '40px 20px' }}>
        {/* Page Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '25px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 15px 50px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            margin: '0 0 15px 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            📊 Sales Analytics Dashboard
          </h1>
          <p style={{ color: '#666', fontSize: '18px', margin: 0 }}>
            Comprehensive sales reports with interactive charts and filtering
          </p>
        </div>

        {/* Filters Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '25px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 15px 50px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 25px 0', color: '#2c3e50', fontSize: '1.5rem', fontWeight: '700' }}>
            🔍 Filters & Date Range
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            alignItems: 'end'
          }}>
            {/* Date Range */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>
                📅 Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: '2px solid #e9ecef',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>
                📅 End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: '2px solid #e9ecef',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>

            {/* Payment Method Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>
                💳 Payment Method
              </label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: '2px solid #e9ecef',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">All Payment Methods</option>
                <option value="razorpay">Online Payment (Razorpay)</option>
                <option value="upi">UPI Payment</option>
                <option value="cod">Cash on Delivery</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>
                📋 Order Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: '2px solid #e9ecef',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Refresh Button */}
            <div>
              <button
                onClick={fetchSalesData}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: loading ? '#6c757d' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? '⏳ Loading...' : '🔄 Apply Filters'}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {filteredData && (
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
              <div style={{ fontSize: '2rem', fontWeight: '900' }}>
                {filteredData.summary?.totalOrders || 0}
              </div>
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
              <div style={{ fontSize: '2rem', fontWeight: '900' }}>
                ₹{(filteredData.summary?.totalRevenue || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '1rem', opacity: '0.9' }}>Total Revenue</div>
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
              <div style={{ fontSize: '2rem', fontWeight: '900' }}>
                ₹{(filteredData.summary?.averageOrderValue || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '1rem', opacity: '0.9' }}>Avg Order Value</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
              color: 'white',
              padding: '25px',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(76, 175, 80, 0.3)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📦</div>
              <div style={{ fontSize: '2rem', fontWeight: '900' }}>
                {filteredData.summary?.totalProducts || 0}
              </div>
              <div style={{ fontSize: '1rem', opacity: '0.9' }}>Products Sold</div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {chartData && (
          <>
            {/* Revenue Trend Chart */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '25px',
              padding: '30px',
              marginBottom: '30px',
              boxShadow: '0 15px 50px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 25px 0', color: '#2c3e50', fontSize: '1.5rem', fontWeight: '700' }}>
                📈 Revenue & Orders Trend
              </h3>
              <div style={{ height: '400px', position: 'relative' }}>
                <Line data={chartData.revenueByDate} options={{...lineChartOptions, plugins: {...lineChartOptions.plugins, title: {display: true, text: 'Daily Revenue and Orders Over Time'}}}} />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
              gap: '30px',
              marginBottom: '30px'
            }}>
              {/* Payment Method Distribution */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '25px',
                padding: '30px',
                boxShadow: '0 15px 50px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 25px 0', color: '#2c3e50', fontSize: '1.5rem', fontWeight: '700' }}>
                  💳 Payment Methods Distribution
                </h3>
                <div style={{ height: '350px', position: 'relative' }}>
                  <Pie data={chartData.paymentMethods} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {display: true, text: 'Revenue by Payment Method'}}}} />
                </div>
              </div>

              {/* Order Status Distribution */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '25px',
                padding: '30px',
                boxShadow: '0 15px 50px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 25px 0', color: '#2c3e50', fontSize: '1.5rem', fontWeight: '700' }}>
                  📋 Order Status Distribution
                </h3>
                <div style={{ height: '350px', position: 'relative' }}>
                  <Doughnut data={chartData.orderStatus} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {display: true, text: 'Orders by Status'}}}} />
                </div>
              </div>
            </div>

            {/* Top Products Chart */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '25px',
              padding: '30px',
              marginBottom: '30px',
              boxShadow: '0 15px 50px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 25px 0', color: '#2c3e50', fontSize: '1.5rem', fontWeight: '700' }}>
                🏆 Top 10 Best Selling Products
              </h3>
              <div style={{ height: '400px', position: 'relative' }}>
                <Bar data={chartData.topProducts} options={{...barChartOptions, plugins: {...barChartOptions.plugins, title: {display: true, text: 'Revenue and Quantity Sold by Product'}}}} />
              </div>
            </div>
          </>
        )}

        {/* No Data Message */}
        {!loading && (!filteredData || (filteredData.summary?.totalOrders === 0)) && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '25px',
            padding: '60px',
            textAlign: 'center',
            boxShadow: '0 15px 50px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📊</div>
            <h3 style={{ color: '#ff6b6b', fontSize: '1.8rem', marginBottom: '15px' }}>
              No Sales Data Found
            </h3>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '25px' }}>
              No sales data available for the selected date range and filters.
              <br />
              Try adjusting your filters or selecting a different date range.
            </p>
            <button
              onClick={() => {
                setDateRange({
                  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  endDate: new Date().toISOString().split('T')[0]
                });
                setSelectedPaymentMethod('all');
                setSelectedStatus('all');
                setSelectedCategory('all');
              }}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '15px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔄 Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Add CSS animation for loading spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SalesReport;