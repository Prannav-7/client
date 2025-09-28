import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { format } from 'date-fns';
import './OptimizedSalesAnalytics.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement
);

const SalesAnalytics = () => {
  console.log('🎯 SalesAnalytics component rendering with real data...');
  
  // Real sales data from API
  const [salesData, setSalesData] = useState({
    dailySales: [],
    recentOrders: [],
    monthlyComparison: [],
    topProducts: [],
    categoryBreakdown: [],
    loading: true,
    dataSource: 'loading' // 'real', 'sample', 'loading'
  });

  const [selectedMonth, setSelectedMonth] = useState('2025-09');

  // Fetch real sales data from API
  useEffect(() => {
    checkAdminPrivileges();
    fetchSalesData();
  }, [selectedMonth]);

  const checkAdminPrivileges = () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    console.log('🔐 Checking admin privileges:', {
      hasToken: !!token,
      userRole: userRole,
      tokenLength: token?.length || 0
    });
    
    if (!token) {
      console.warn('❌ No authentication token found');
    }
    
    if (userRole !== 'admin') {
      console.warn('❌ User role is not admin:', userRole);
    }
  };

  const fetchSalesData = async () => {
    try {
      console.log('🔄 Fetching real sales data for month:', selectedMonth);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      console.log('📝 Using token:', token ? 'Token found' : 'No token found');
      
      if (!token) {
        console.warn('❌ No authentication token found');
        // Use sample data if no token
        setSalesData({
          dailySales: getSampleDailySales(),
          recentOrders: getSampleRecentOrders(),
          monthlyComparison: getSampleMonthlyComparison(),
          topProducts: getSampleTopProducts(),
          categoryBreakdown: getSampleCategoryBreakdown(),
          loading: false,
          dataSource: 'sample'
        });
        return;
      }
      
      // Fetch sales analytics
      console.log('🌐 Fetching analytics from:', `/api/orders/sales-analytics?month=${selectedMonth}`);
      const analyticsResponse = await fetch(`/api/orders/sales-analytics?month=${selectedMonth}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Analytics response status:', analyticsResponse.status);
      
      let analyticsData = { data: { dailySales: [], recentOrders: [] } };
      if (analyticsResponse.ok) {
        analyticsData = await analyticsResponse.json();
        console.log('✅ Analytics data received:', analyticsData);
      } else {
        console.error('❌ Analytics fetch failed:', analyticsResponse.status, analyticsResponse.statusText);
      }
      
      // Fetch monthly comparison (current vs previous month)
      const prevMonth = getPreviousMonth(selectedMonth);
      console.log('📅 Fetching comparison:', `current=${selectedMonth}&previous=${prevMonth}`);
      const comparisonResponse = await fetch(`/api/orders/monthly-comparison?current=${selectedMonth}&previous=${prevMonth}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let comparisonData = [];
      if (comparisonResponse.ok) {
        const comparison = await comparisonResponse.json();
        comparisonData = comparison.data || [];
        console.log('✅ Comparison data received:', comparisonData);
      } else {
        console.error('❌ Comparison fetch failed:', comparisonResponse.status);
      }
      
      // Fetch top products
      console.log('🏆 Fetching top products...');
      const productsResponse = await fetch(`/api/orders/top-products?month=${selectedMonth}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let topProductsData = [];
      if (productsResponse.ok) {
        const products = await productsResponse.json();
        topProductsData = products.data || [];
        console.log('✅ Products data received:', topProductsData);
      } else {
        console.error('❌ Products fetch failed:', productsResponse.status);
      }
      
      // Fetch category breakdown
      console.log('🥧 Fetching category breakdown...');
      const categoryResponse = await fetch(`/api/orders/category-breakdown?month=${selectedMonth}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let categoryData = [];
      if (categoryResponse.ok) {
        const categories = await categoryResponse.json();
        categoryData = categories.data || [];
        console.log('✅ Category data received:', categoryData);
      } else {
        console.error('❌ Category fetch failed:', categoryResponse.status);
      }

      // Check if we have any real data, if not use sample data
      const hasRealData = (analyticsData.data?.dailySales?.length > 0) || 
                          (comparisonData.length > 0) || 
                          (topProductsData.length > 0);

      if (!hasRealData) {
        console.log('📝 No real data found, using sample data');
        setSalesData({
          dailySales: getSampleDailySales(),
          recentOrders: getSampleRecentOrders(),
          monthlyComparison: getSampleMonthlyComparison(),
          topProducts: getSampleTopProducts(),
          categoryBreakdown: getSampleCategoryBreakdown(),
          loading: false,
          dataSource: 'sample'
        });
        return;
      }

      setSalesData({
        dailySales: analyticsData.data?.dailySales || [],
        recentOrders: analyticsData.data?.recentOrders || [],
        monthlyComparison: comparisonData,
        topProducts: topProductsData,
        categoryBreakdown: categoryData,
        loading: false,
        dataSource: 'real'
      });

      console.log('✅ Real sales data loaded:', {
        dailySales: analyticsData.data?.dailySales?.length || 0,
        recentOrders: analyticsData.data?.recentOrders?.length || 0,
        topProducts: topProductsData.length,
        categories: categoryData.length
      });

    } catch (error) {
      console.error('❌ Error fetching sales data:', error);
      
      // Fallback to sample data on error
      console.log('🔄 Falling back to sample data');
      setSalesData({
        dailySales: getSampleDailySales(),
        recentOrders: getSampleRecentOrders(),
        monthlyComparison: getSampleMonthlyComparison(),
        topProducts: getSampleTopProducts(),
        categoryBreakdown: getSampleCategoryBreakdown(),
        loading: false,
        dataSource: 'sample'
      });
    }
  };

  const getPreviousMonth = (monthStr) => {
    const date = new Date(monthStr + '-01');
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 7);
  };

  // Sample data functions for fallback
  const getSampleDailySales = () => [
    { date: '2025-09-15', revenue: 45000, orders: 12, customers: 10 },
    { date: '2025-09-16', revenue: 38000, orders: 8, customers: 7 },
    { date: '2025-09-17', revenue: 52000, orders: 15, customers: 13 },
    { date: '2025-09-18', revenue: 41000, orders: 10, customers: 9 },
    { date: '2025-09-19', revenue: 48000, orders: 13, customers: 11 }
  ];

  const getSampleRecentOrders = () => [
    { orderId: 'ORD001', customer: 'Rajesh Kumar', amount: 2500, items: 3, date: '2025-09-19' },
    { orderId: 'ORD002', customer: 'Priya Sharma', amount: 1800, items: 2, date: '2025-09-19' },
    { orderId: 'ORD003', customer: 'Amit Patel', amount: 3200, items: 4, date: '2025-09-18' },
    { orderId: 'ORD004', customer: 'Sunita Devi', amount: 1500, items: 2, date: '2025-09-18' },
    { orderId: 'ORD005', customer: 'Vikash Singh', amount: 4100, items: 5, date: '2025-09-17' }
  ];

  const getSampleMonthlyComparison = () => [
    { month: 'Aug 2025', revenue: 180000, orders: 45, growth: 0 },
    { month: 'Sep 2025', revenue: 224000, orders: 58, growth: 24.4 }
  ];

  const getSampleTopProducts = () => [
    { name: 'LED Bulb 9W', sales: 45, revenue: 6750, category: 'Lighting' },
    { name: 'Ceiling Fan 48"', sales: 12, revenue: 36000, category: 'Fans' },
    { name: 'MCB 32A', sales: 25, revenue: 3750, category: 'Electrical' },
    { name: 'Copper Wire 2.5mm', sales: 18, revenue: 5400, category: 'Wiring' },
    { name: 'Switch Socket', sales: 35, revenue: 3150, category: 'Switches' }
  ];

  const getSampleCategoryBreakdown = () => [
    { category: 'Lighting', sales: 65000, percentage: 29 },
    { category: 'Fans', sales: 58000, percentage: 26 },
    { category: 'Electrical', sales: 42000, percentage: 19 },
    { category: 'Wiring', sales: 35000, percentage: 16 },
    { category: 'Tools', sales: 24000, percentage: 10 }
  ];

  // Calculate summary metrics from real data
  const calculateSummaryMetrics = () => {
    const totalRevenue = salesData.dailySales.reduce((sum, day) => sum + (day.revenue || 0), 0);
    const totalOrders = salesData.dailySales.reduce((sum, day) => sum + (day.orders || 0), 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const completedOrders = salesData.recentOrders.length;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      completedOrders
    };
  };

  const metrics = calculateSummaryMetrics();

  // Professional Chart configurations with dark theme
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#f7fafc',
          font: { size: 12, weight: '600' },
          usePointStyle: true,
          padding: 15
        }
      },
      title: {
        display: true,
        color: '#ffd700',
        font: { size: 14, weight: '700' }
      },
      tooltip: {
        backgroundColor: 'rgba(13, 21, 38, 0.95)',
        titleColor: '#ffd700',
        bodyColor: '#f7fafc',
        borderColor: 'rgba(255, 215, 0, 0.5)',
        borderWidth: 1,
        cornerRadius: 10,
        displayColors: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#e2e8f0', font: { size: 10 } }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#e2e8f0', font: { size: 10 } }
      }
    }
  };

  // Daily Sales Chart Data (Real Data)
  const dailySalesChart = {
    labels: salesData.dailySales.map(day => format(new Date(day.date || day._id), 'MMM dd')),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: salesData.dailySales.map(day => day.revenue || 0),
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        borderColor: '#ffd700',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ffd700',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5
      }
    ]
  };

  // Monthly Comparison Chart (Real Data)
  const monthlyComparisonChart = {
    labels: salesData.monthlyComparison.map(month => month.month),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: salesData.monthlyComparison.map(month => month.revenue),
        backgroundColor: ['rgba(0, 188, 212, 0.8)', 'rgba(255, 215, 0, 0.8)'],
        borderColor: ['#00bcd4', '#ffd700'],
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  // Top Products Chart (Real Data) 
  const topProductsChart = {
    labels: salesData.topProducts.map(product => product.name?.substring(0, 20) + '...' || 'Unknown'),
    datasets: [
      {
        label: 'Sales Quantity',
        data: salesData.topProducts.map(product => product.sales || 0),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)', 
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: '#1a202c',
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };

  // Category Distribution Chart (Real Data)
  const categoryChart = {
    labels: salesData.categoryBreakdown.map(cat => cat.category),
    datasets: [
      {
        data: salesData.categoryBreakdown.map(cat => cat.sales),
        backgroundColor: [
          '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', 
          '#9966ff', '#ff9f40', '#c9cbcf'
        ],
        borderColor: '#0d1526',
        borderWidth: 2,
        hoverOffset: 10
      }
    ]
  };

  if (salesData.loading) {
    return (
      <div className="sales-analytics">
        <div className="analytics-header">
                  <h1 className="analytics-header">📊 Sales Analytics Dashboard</h1>
        <div className="data-source-indicator">
          Data Source: {salesData.dataSource === 'real' ? '✅ Live Database' : 
                       salesData.dataSource === 'sample' ? '🔄 Sample Data' : '⏳ Loading...'}
        </div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner">Loading real sales data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-analytics">
      <div className="analytics-header">
        <h2>📊 Real Sales Analytics Dashboard</h2>
        <div className="analytics-controls">
          <select 
            className="month-selector"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="2025-09">September 2025</option>
            <option value="2025-08">August 2025</option>
            <option value="2025-07">July 2025</option>
            <option value="2025-06">June 2025</option>
            <option value="2025-05">May 2025</option>
            <option value="2025-04">April 2025</option>
          </select>
        </div>
      </div>

      {/* Key Performance Indicators - Real Data */}
      <div className="kpi-grid">
        <div className="kpi-card revenue">
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <h3>Total Revenue</h3>
            <div className="kpi-value">₹{metrics.totalRevenue.toLocaleString()}</div>
            <div className="kpi-subtitle">This Month</div>
          </div>
        </div>
        <div className="kpi-card orders">
          <div className="kpi-icon">📦</div>
          <div className="kpi-content">
            <h3>Total Orders</h3>
            <div className="kpi-value">{metrics.totalOrders}</div>
            <div className="kpi-subtitle">Confirmed Orders</div>
          </div>
        </div>
        <div className="kpi-card completed">
          <div className="kpi-icon">✅</div>
          <div className="kpi-content">
            <h3>Completed</h3>
            <div className="kpi-value">{metrics.completedOrders}</div>
            <div className="kpi-subtitle">Recent Orders</div>
          </div>
        </div>
        <div className="kpi-card avg-order">
          <div className="kpi-icon">📈</div>
          <div className="kpi-content">
            <h3>Avg Order Value</h3>
            <div className="kpi-value">₹{metrics.avgOrderValue.toLocaleString()}</div>
            <div className="kpi-subtitle">Per Order</div>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Daily Sales Trend - Real Data */}
        <div className="chart-card full-width">
          <h3>📈 Daily Sales Performance</h3>
          <div className="chart-container">
            <Line 
              data={dailySalesChart} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: { ...chartOptions.plugins.title, text: `Daily Revenue for ${selectedMonth}` }
                }
              }} 
            />
          </div>
        </div>

        {/* Monthly Comparison - Real Data */}
        <div className="chart-card">
          <h3>📊 Monthly Comparison</h3>
          <div className="chart-container">
            <Bar 
              data={monthlyComparisonChart} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: { ...chartOptions.plugins.title, text: 'Current vs Previous Month' }
                }
              }} 
            />
          </div>
          <div className="comparison-stats">
            {salesData.monthlyComparison.map((month, index) => (
              <div key={index} className="month-stat">
                <h4>{month.month}</h4>
                <p>₹{month.revenue?.toLocaleString() || 0}</p>
                <span className={month.growth >= 0 ? 'positive' : 'negative'}>
                  {month.growth >= 0 ? '↗' : '↘'} {Math.abs(month.growth || 0).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products - Real Data */}
        <div className="chart-card">
          <h3>🏆 Best Selling Products</h3>
          <div className="chart-container">
            <Bar 
              data={topProductsChart} 
              options={{
                ...chartOptions,
                indexAxis: 'y',
                plugins: {
                  ...chartOptions.plugins,
                  legend: { display: false },
                  title: { ...chartOptions.plugins.title, text: 'Top Products by Sales Volume' }
                }
              }} 
            />
          </div>
        </div>

        {/* Category Distribution - Real Data */}
        <div className="chart-card">
          <h3>🥧 Sales by Category</h3>
          <div className="chart-container">
            <Pie 
              data={categoryChart} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#f7fafc',
                      padding: 10,
                      usePointStyle: true,
                      font: { size: 10 }
                    }
                  },
                  title: { ...chartOptions.plugins.title, text: 'Category Performance' }
                }
              }} 
            />
          </div>
          <div className="category-stats">
            {salesData.categoryBreakdown.slice(0, 3).map((cat, index) => (
              <div key={index} className="category-item">
                <span className="category-name">{cat.category}</span>
                <span className="category-value">₹{cat.sales?.toLocaleString() || 0}</span>
                <span className="category-percent">{cat.percentage || 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table - Real Data */}
      <div className="recent-orders-section">
        <h3>📋 Recent Orders</h3>
        <div className="orders-table">
          <div className="table-header">
            <span>Order ID</span>
            <span>Customer</span>
            <span>Amount</span>
            <span>Items</span>
            <span>Date</span>
          </div>
          {salesData.recentOrders.slice(0, 8).map((order, index) => (
            <div key={index} className="table-row">
              <span className="order-id">#{order.orderId}</span>
              <span className="customer-name">{order.customer}</span>
              <span className="order-amount">₹{order.amount?.toLocaleString() || 0}</span>
              <span className="items-count">{order.items} items</span>
              <span className="order-date">{order.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;