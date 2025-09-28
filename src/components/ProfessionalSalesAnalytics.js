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
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import api from '../api';

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

const ProfessionalSalesAnalytics = () => {
  const [salesData, setSalesData] = useState({
    dailySales: [],
    monthlyComparison: [],
    topProducts: [],
    categoryBreakdown: [],
    loading: true,
    error: null
  });

  const [selectedTimeRange, setSelectedTimeRange] = useState('30'); // days
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    fetchSalesData();
  }, [selectedTimeRange]);

  const fetchSalesData = async () => {
    try {
      setSalesData(prev => ({ ...prev, loading: true, error: null }));
      
      const [dailySalesRes, monthlyRes, topProductsRes, categoryRes] = await Promise.all([
        api.get('/orders/admin/sales-analytics'),
        api.get('/orders/admin/monthly-comparison'),
        api.get('/orders/admin/top-products'),
        api.get('/orders/admin/category-breakdown')
      ]);

      setSalesData({
        dailySales: dailySalesRes.data?.data?.dailySales || [],
        monthlyComparison: monthlyRes.data?.data || [],
        topProducts: topProductsRes.data?.data || [],
        categoryBreakdown: categoryRes.data?.data || [],
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setSalesData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch sales data. Please ensure you are logged in as admin.'
      }));
    }
  };

  // Chart configurations
  const chartColors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    tertiary: '#F59E0B',
    quaternary: '#EF4444',
    gradient: {
      blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      green: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      orange: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    }
  };

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3B82F6',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          borderDash: [5, 5]
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  // Daily Sales Chart Data
  const dailySalesChartData = {
    labels: salesData.dailySales.slice(-7).map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: salesData.dailySales.slice(-7).map(day => day.revenue),
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: chartColors.primary,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  // Monthly Comparison Chart Data
  const monthlyComparisonData = {
    labels: salesData.monthlyComparison.map(month => month.month),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: salesData.monthlyComparison.map(month => month.revenue),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          chartColors.primary,
          chartColors.secondary,
          chartColors.tertiary,
          chartColors.quaternary
        ],
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  // Top Products Chart Data
  const topProductsData = {
    labels: salesData.topProducts.slice(0, 5).map(product => 
      product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name
    ),
    datasets: [
      {
        data: salesData.topProducts.slice(0, 5).map(product => product.sales),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderColor: [
          chartColors.primary,
          chartColors.secondary,
          chartColors.tertiary,
          chartColors.quaternary,
          '#8B5CF6'
        ],
        borderWidth: 2
      }
    ]
  };

  if (salesData.loading) {
    return (
      <div className="sales-analytics-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (salesData.error) {
    return (
      <div className="sales-analytics-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{salesData.error}</p>
          <button onClick={fetchSalesData} className="retry-button">
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="professional-sales-analytics">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <h2>Sales Analytics Dashboard</h2>
          <p>Comprehensive insights into your business performance</p>
        </div>
        <div className="header-controls">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="time-range-selector"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button onClick={fetchSalesData} className="refresh-button">
            <span>🔄</span> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">📈</div>
          <div className="kpi-content">
            <h3>Total Revenue</h3>
            <p className="kpi-value">
              ₹{salesData.dailySales.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}
            </p>
            <span className="kpi-subtitle">Last 7 days</span>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon">🛍️</div>
          <div className="kpi-content">
            <h3>Total Orders</h3>
            <p className="kpi-value">
              {salesData.dailySales.reduce((sum, day) => sum + day.orders, 0)}
            </p>
            <span className="kpi-subtitle">Last 7 days</span>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon">👥</div>
          <div className="kpi-content">
            <h3>Active Customers</h3>
            <p className="kpi-value">
              {salesData.dailySales.reduce((sum, day) => sum + day.customers, 0)}
            </p>
            <span className="kpi-subtitle">Last 7 days</span>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <h3>Avg Order Value</h3>
            <p className="kpi-value">
              ₹{Math.round(
                salesData.dailySales.reduce((sum, day) => sum + day.revenue, 0) /
                Math.max(salesData.dailySales.reduce((sum, day) => sum + day.orders, 0), 1)
              ).toLocaleString()}
            </p>
            <span className="kpi-subtitle">Average per order</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Daily Sales Trend */}
        <div className="chart-card large">
          <div className="chart-header">
            <h3>Daily Sales Trend</h3>
            <p>Revenue performance over the last 7 days</p>
          </div>
          <div className="chart-container">
            <Line data={dailySalesChartData} options={commonChartOptions} />
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Monthly Comparison</h3>
            <p>Revenue comparison by month</p>
          </div>
          <div className="chart-container">
            <Bar data={monthlyComparisonData} options={commonChartOptions} />
          </div>
        </div>

        {/* Top Products */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Top Products</h3>
            <p>Best selling products by revenue</p>
          </div>
          <div className="chart-container">
            <Doughnut 
              data={topProductsData} 
              options={{
                ...commonChartOptions,
                plugins: {
                  ...commonChartOptions.plugins,
                  legend: {
                    position: 'bottom',
                    labels: {
                      usePointStyle: true,
                      padding: 15,
                      font: {
                        size: 11
                      }
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="insights-section">
        <h3>Key Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>📊 Performance</h4>
            <p>
              {salesData.monthlyComparison.length > 1 && 
               salesData.monthlyComparison[0]?.revenue > salesData.monthlyComparison[1]?.revenue
                ? "Revenue is increasing compared to last month"
                : "Focus on improving sales performance"}
            </p>
          </div>
          <div className="insight-card">
            <h4>🎯 Top Category</h4>
            <p>
              {salesData.categoryBreakdown.length > 0 
                ? `${salesData.categoryBreakdown[0]?.category} is your top performing category`
                : "No category data available"}
            </p>
          </div>
          <div className="insight-card">
            <h4>🚀 Growth</h4>
            <p>
              {salesData.topProducts.length > 0
                ? `${salesData.topProducts[0]?.name} is your bestseller`
                : "Focus on promoting top products"}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .professional-sales-analytics {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f8fafc;
          min-height: 100vh;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding: 24px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header-content h2 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .header-content p {
          margin: 0;
          color: #6b7280;
          font-size: 16px;
        }

        .header-controls {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .time-range-selector {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .refresh-button {
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background-color 0.2s;
        }

        .refresh-button:hover {
          background: #2563eb;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .kpi-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .kpi-icon {
          font-size: 32px;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 12px;
        }

        .kpi-content h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .kpi-value {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }

        .kpi-subtitle {
          font-size: 12px;
          color: #9ca3af;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }

        @media (max-width: 1200px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }

        .chart-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 24px;
        }

        .chart-card.large {
          grid-column: span 2;
        }

        @media (max-width: 1200px) {
          .chart-card.large {
            grid-column: span 1;
          }
        }

        .chart-header {
          margin-bottom: 20px;
        }

        .chart-header h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .chart-header p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }

        .chart-container {
          height: 300px;
        }

        .insights-section {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .insights-section h3 {
          margin: 0 0 20px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .insight-card {
          padding: 20px;
          background: #f9fafb;
          border-radius: 12px;
          border-left: 4px solid #3b82f6;
        }

        .insight-card h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .insight-card p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .error-container h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          color: #ef4444;
        }

        .error-container p {
          margin: 0 0 20px 0;
          color: #6b7280;
        }

        .retry-button {
          padding: 10px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .retry-button:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default ProfessionalSalesAnalytics;