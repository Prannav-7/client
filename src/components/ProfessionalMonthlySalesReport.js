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
import { Bar, Line } from 'react-chartjs-2';
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

const ProfessionalMonthlySalesReport = () => {
  const [monthlyData, setMonthlyData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('current'); // 'current', 'comparison'
  const [error, setError] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    if (viewMode === 'current') {
      fetchMonthlyData();
    } else {
      fetchComparisonData();
    }
  }, [selectedMonth, selectedYear, viewMode]);

  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/orders/admin/monthly-summary?year=${selectedYear}&month=${selectedMonth}`);
      if (response.data?.success) {
        setMonthlyData(response.data.data);
      } else {
        setError('Failed to fetch monthly data');
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      setError(error.response?.data?.message || 'Failed to fetch monthly sales data. Please ensure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentMonthPromise = api.get(`/orders/admin/monthly-summary?year=${selectedYear}&month=${selectedMonth}`);
      const previousMonthPromise = selectedMonth === 1 
        ? api.get(`/orders/admin/monthly-summary?year=${selectedYear - 1}&month=12`)
        : api.get(`/orders/admin/monthly-summary?year=${selectedYear}&month=${selectedMonth - 1}`);
      
      const [currentResponse, previousResponse] = await Promise.all([currentMonthPromise, previousMonthPromise]);
      
      if (currentResponse.data?.success && previousResponse.data?.success) {
        const currentData = currentResponse.data.data;
        const previousData = previousResponse.data.data;
        
        setComparisonData({
          current: currentData,
          previous: previousData,
          currentPeriod: `${months[selectedMonth - 1]} ${selectedYear}`,
          previousPeriod: selectedMonth === 1 ? `December ${selectedYear - 1}` : `${months[selectedMonth - 2]} ${selectedYear}`
        });
      } else {
        setError('Failed to fetch comparison data');
      }
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      setError(error.response?.data?.message || 'Failed to fetch comparison data. Please ensure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalFromDaily = (dailySummary) => {
    if (!dailySummary || dailySummary.length === 0) {
      return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    }

    const totalRevenue = dailySummary.reduce((sum, day) => sum + day.totalRevenue, 0);
    const totalOrders = dailySummary.reduce((sum, day) => sum + day.totalOrders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalOrders, avgOrderValue };
  };

  const getGrowthIndicator = (current, previous) => {
    if (!previous || previous === 0) return { value: 0, isPositive: true };
    const growth = ((current - previous) / previous) * 100;
    return { value: Math.abs(growth).toFixed(1), isPositive: growth >= 0 };
  };

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3B82F6',
        borderWidth: 1,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)', borderDash: [5, 5] },
        ticks: { font: { size: 11 } }
      }
    }
  };

  if (loading) {
    return (
      <div className="professional-monthly-report">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading monthly sales report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="professional-monthly-report">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Report</h3>
          <p>{error}</p>
          <button onClick={viewMode === 'current' ? fetchMonthlyData : fetchComparisonData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="professional-monthly-report">
      {/* Controls */}
      <div className="report-header">
        <div className="header-content">
          <h2>Monthly Sales Report</h2>
          <p>Comprehensive monthly sales analysis and insights</p>
        </div>
        
        <div className="controls-section">
          {/* View Mode Toggle */}
          <div className="view-toggle">
            <button
              className={viewMode === 'current' ? 'active' : ''}
              onClick={() => setViewMode('current')}
            >
              Current Month
            </button>
            <button
              className={viewMode === 'comparison' ? 'active' : ''}
              onClick={() => setViewMode('comparison')}
            >
              Month Comparison
            </button>
          </div>

          {/* Date Selectors */}
          <div className="date-selectors">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="date-selector"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="date-selector"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <button
            onClick={viewMode === 'current' ? fetchMonthlyData : fetchComparisonData}
            className="refresh-button"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Current Month View */}
      {viewMode === 'current' && monthlyData && (
        <div className="current-month-view">
          {/* KPI Cards */}
          <div className="kpi-cards">
            {(() => {
              const totals = calculateTotalFromDaily(monthlyData.dailySummary);
              const kpiData = [
                {
                  title: 'Total Orders',
                  value: totals.totalOrders.toLocaleString(),
                  icon: '🛍️',
                  color: '#3B82F6'
                },
                {
                  title: 'Total Revenue',
                  value: `₹${totals.totalRevenue.toLocaleString()}`,
                  icon: '💰',
                  color: '#10B981'
                },
                {
                  title: 'Average Order Value',
                  value: `₹${Math.round(totals.avgOrderValue).toLocaleString()}`,
                  icon: '📊',
                  color: '#F59E0B'
                },
                {
                  title: 'Active Days',
                  value: monthlyData.dailySummary.length,
                  icon: '📅',
                  color: '#EF4444'
                }
              ];

              return kpiData.map((kpi, index) => (
                <div key={index} className="kpi-card" style={{ borderLeft: `4px solid ${kpi.color}` }}>
                  <div className="kpi-icon" style={{ backgroundColor: `${kpi.color}20` }}>
                    {kpi.icon}
                  </div>
                  <div className="kpi-content">
                    <h3>{kpi.title}</h3>
                    <p className="kpi-value">{kpi.value}</p>
                  </div>
                </div>
              ));
            })()}
          </div>

          {/* Charts */}
          <div className="charts-section">
            {/* Daily Revenue Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Daily Revenue Trend</h3>
                <p>{months[selectedMonth - 1]} {selectedYear} - Day by day performance</p>
              </div>
              <div className="chart-container">
                <Line
                  data={{
                    labels: monthlyData.dailySummary.map(day => `Day ${day._id.day}`),
                    datasets: [{
                      label: 'Revenue (₹)',
                      data: monthlyData.dailySummary.map(day => day.totalRevenue),
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderColor: '#3B82F6',
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: '#3B82F6',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      pointRadius: 6
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
            </div>

            {/* Daily Orders Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Daily Orders Volume</h3>
                <p>Number of orders received each day</p>
              </div>
              <div className="chart-container">
                <Bar
                  data={{
                    labels: monthlyData.dailySummary.map(day => `Day ${day._id.day}`),
                    datasets: [{
                      label: 'Orders',
                      data: monthlyData.dailySummary.map(day => day.totalOrders),
                      backgroundColor: 'rgba(16, 185, 129, 0.8)',
                      borderColor: '#10B981',
                      borderWidth: 2,
                      borderRadius: 6
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison View */}
      {viewMode === 'comparison' && comparisonData && (
        <div className="comparison-view">
          <div className="comparison-header">
            <h3>Month-over-Month Comparison</h3>
            <p>{comparisonData.currentPeriod} vs {comparisonData.previousPeriod}</p>
          </div>

          <div className="comparison-cards">
            {(() => {
              const currentTotals = calculateTotalFromDaily(comparisonData.current.dailySummary);
              const previousTotals = calculateTotalFromDaily(comparisonData.previous.dailySummary);
              
              const comparisons = [
                {
                  title: 'Total Revenue',
                  current: currentTotals.totalRevenue,
                  previous: previousTotals.totalRevenue,
                  format: 'currency',
                  icon: '💰'
                },
                {
                  title: 'Total Orders',
                  current: currentTotals.totalOrders,
                  previous: previousTotals.totalOrders,
                  format: 'number',
                  icon: '🛍️'
                },
                {
                  title: 'Avg Order Value',
                  current: currentTotals.avgOrderValue,
                  previous: previousTotals.avgOrderValue,
                  format: 'currency',
                  icon: '📊'
                }
              ];

              return comparisons.map((item, index) => {
                const growth = getGrowthIndicator(item.current, item.previous);
                return (
                  <div key={index} className="comparison-card">
                    <div className="comparison-icon">{item.icon}</div>
                    <div className="comparison-content">
                      <h4>{item.title}</h4>
                      <div className="comparison-values">
                        <div className="current-value">
                          <span className="label">Current</span>
                          <span className="value">
                            {item.format === 'currency' 
                              ? `₹${Math.round(item.current).toLocaleString()}` 
                              : item.current.toLocaleString()}
                          </span>
                        </div>
                        <div className="previous-value">
                          <span className="label">Previous</span>
                          <span className="value">
                            {item.format === 'currency' 
                              ? `₹${Math.round(item.previous).toLocaleString()}` 
                              : item.previous.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className={`growth-indicator ${growth.isPositive ? 'positive' : 'negative'}`}>
                        <span className="growth-arrow">{growth.isPositive ? '↗️' : '↘️'}</span>
                        <span>{growth.value}% vs last month</span>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* No Data State */}
      {((viewMode === 'current' && !monthlyData) || (viewMode === 'comparison' && !comparisonData)) && !loading && (
        <div className="no-data-container">
          <div className="no-data-icon">📊</div>
          <h3>No Sales Data Available</h3>
          <p>No sales data found for the selected period. Try selecting a different month or ensure orders exist for this time frame.</p>
        </div>
      )}

      <style jsx>{`
        .professional-monthly-report {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f8fafc;
          min-height: 100vh;
        }

        .report-header {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }

        .header-content h2 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .header-content p {
          margin: 0 0 24px 0;
          color: #6b7280;
          font-size: 16px;
        }

        .controls-section {
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
        }

        .view-toggle {
          display: flex;
          background: #f3f4f6;
          padding: 4px;
          border-radius: 8px;
        }

        .view-toggle button {
          padding: 8px 16px;
          border: none;
          background: transparent;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-toggle button.active {
          background: #3b82f6;
          color: white;
        }

        .date-selectors {
          display: flex;
          gap: 12px;
        }

        .date-selector {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .refresh-button {
          padding: 8px 16px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .refresh-button:hover {
          background: #059669;
        }

        .kpi-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .kpi-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .kpi-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .kpi-content h3 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
        }

        .kpi-value {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }

        .charts-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .charts-section {
            grid-template-columns: 1fr;
          }
        }

        .chart-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

        .comparison-view {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .comparison-header {
          margin-bottom: 24px;
          text-align: center;
        }

        .comparison-header h3 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .comparison-header p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }

        .comparison-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
        }

        .comparison-card {
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .comparison-icon {
          font-size: 32px;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 12px;
        }

        .comparison-content h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .comparison-values {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .current-value, .previous-value {
          display: flex;
          flex-direction: column;
        }

        .label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .value {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .growth-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .growth-indicator.positive {
          color: #10b981;
        }

        .growth-indicator.negative {
          color: #ef4444;
        }

        .loading-container, .error-container, .no-data-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          background: white;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

        .error-icon, .no-data-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .error-container h3, .no-data-container h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          color: #1f2937;
        }

        .error-container p, .no-data-container p {
          margin: 0 0 20px 0;
          color: #6b7280;
          max-width: 400px;
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

export default ProfessionalMonthlySalesReport;