import React, { useState, useEffect } from 'react';
import api from '../api';
import { SimpleBarChart, SimpleLineChart } from './SimpleCharts';

const MonthlySalesDashboard = () => {
  const [monthlyData, setMonthlyData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('current'); // 'current', 'comparison'

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchMonthlyData = async (year = selectedYear, month = selectedMonth) => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/admin/monthly-summary?year=${year}&month=${month}`);
      if (response.data?.success) {
        setMonthlyData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      alert('Failed to fetch monthly sales data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      const currentMonthPromise = api.get(`/orders/admin/monthly-summary?year=${selectedYear}&month=${selectedMonth}`);
      const previousMonthPromise = selectedMonth === 1 
        ? api.get(`/orders/admin/monthly-summary?year=${selectedYear - 1}&month=12`)
        : api.get(`/orders/admin/monthly-summary?year=${selectedYear}&month=${selectedMonth - 1}`);
      
      const [currentResponse, previousResponse] = await Promise.all([currentMonthPromise, previousMonthPromise]);
      
      if (currentResponse.data?.success && previousResponse.data?.success) {
        setComparisonData({
          current: currentResponse.data.data,
          previous: previousResponse.data.data,
          currentPeriod: `${months[selectedMonth - 1]} ${selectedYear}`,
          previousPeriod: selectedMonth === 1 
            ? `December ${selectedYear - 1}` 
            : `${months[selectedMonth - 2]} ${selectedYear}`
        });
      }
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      alert('Failed to fetch comparison data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'current') {
      fetchMonthlyData();
    } else {
      fetchComparisonData();
    }
  }, [selectedMonth, selectedYear, viewMode]);

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getGrowthColor = (growth) => {
    return parseFloat(growth) >= 0 ? '#4caf50' : '#ff6b6b';
  };

  const calculateTotalFromDaily = (dailySummary) => {
    if (!dailySummary || dailySummary.length === 0) {
      return { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 };
    }
    
    const totalOrders = dailySummary.reduce((sum, day) => sum + day.totalOrders, 0);
    const totalRevenue = dailySummary.reduce((sum, day) => sum + day.totalRevenue, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return { totalOrders, totalRevenue, avgOrderValue };
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '25px',
        margin: '20px 0',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 15px 50px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #667eea',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          animation: 'spin 1s linear infinite',
          marginRight: '20px'
        }}></div>
        <p style={{ fontSize: '20px', color: '#666', fontWeight: '600' }}>Loading sales analytics...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '25px',
        padding: '30px',
        marginBottom: '30px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 15px 50px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', margin: 0, color: '#2c3e50' }}>
            📈 Monthly Sales Analytics
          </h2>
          
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setViewMode('current')}
              style={{
                background: viewMode === 'current' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'transparent',
                color: viewMode === 'current' ? 'white' : '#667eea',
                border: viewMode === 'current' ? 'none' : '2px solid #667eea',
                padding: '10px 20px',
                borderRadius: '15px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              📊 Current Month
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              style={{
                background: viewMode === 'comparison' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'transparent',
                color: viewMode === 'comparison' ? 'white' : '#667eea',
                border: viewMode === 'comparison' ? 'none' : '2px solid #667eea',
                padding: '10px 20px',
                borderRadius: '15px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              📈 Month Comparison
            </button>
          </div>
        </div>

        {/* Date Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '16px', fontWeight: '600', color: '#666' }}>
              Month:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              style={{
                padding: '12px 15px',
                border: '2px solid #f0f0f0',
                borderRadius: '15px',
                fontSize: '16px',
                outline: 'none',
                background: 'white',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '16px', fontWeight: '600', color: '#666' }}>
              Year:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                padding: '12px 15px',
                border: '2px solid #f0f0f0',
                borderRadius: '15px',
                fontSize: '16px',
                outline: 'none',
                background: 'white',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <button
            onClick={viewMode === 'current' ? () => fetchMonthlyData() : fetchComparisonData}
            style={{
              background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '15px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)'
            }}
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Current Month View */}
      {viewMode === 'current' && monthlyData && (
        <div>
          {/* Monthly Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '25px',
            marginBottom: '40px'
          }}>
            {(() => {
              const totals = calculateTotalFromDaily(monthlyData.dailySummary);
              return [
                {
                  title: 'Total Orders',
                  value: totals.totalOrders,
                  icon: '🛍️',
                  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  shadowColor: 'rgba(102, 126, 234, 0.3)'
                },
                {
                  title: 'Total Revenue',
                  value: `₹${totals.totalRevenue.toLocaleString()}`,
                  icon: '💰',
                  gradient: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                  shadowColor: 'rgba(78, 205, 196, 0.3)'
                },
                {
                  title: 'Avg Order Value',
                  value: `₹${Math.round(totals.avgOrderValue)}`,
                  icon: '📊',
                  gradient: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                  shadowColor: 'rgba(76, 175, 80, 0.3)'
                },
                {
                  title: 'Daily Average',
                  value: `${Math.round(totals.totalOrders / (monthlyData.dailySummary.length || 1))} orders`,
                  icon: '📈',
                  gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  shadowColor: 'rgba(255, 152, 0, 0.3)'
                }
              ].map((card, index) => (
                <div
                  key={index}
                  style={{
                    background: card.gradient,
                    color: 'white',
                    padding: '35px',
                    borderRadius: '25px',
                    textAlign: 'center',
                    boxShadow: `0 15px 40px ${card.shadowColor}`,
                    transform: 'translateY(0)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = `0 20px 50px ${card.shadowColor}`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 15px 40px ${card.shadowColor}`;
                  }}
                >
                  <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>{card.icon}</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px' }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '1.1rem', opacity: '0.9', fontWeight: '600' }}>
                    {card.title}
                  </div>
                </div>
              ));
            })()}
          </div>

          {/* Daily Breakdown Chart */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '25px',
            padding: '35px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 15px 50px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '700', margin: '0 0 25px 0', color: '#2c3e50' }}>
              📅 Daily Sales Breakdown - {months[selectedMonth - 1]} {selectedYear}
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(monthlyData.dailySummary.length, 7)}, 1fr)`,
                gap: '15px',
                minWidth: '800px',
                marginBottom: '25px'
              }}>
                {monthlyData.dailySummary.slice(0, 31).map((day, index) => {
                  const maxRevenue = Math.max(...monthlyData.dailySummary.map(d => d.totalRevenue));
                  const heightPercent = maxRevenue > 0 ? (day.totalRevenue / maxRevenue) * 100 : 0;
                  
                  return (
                    <div
                      key={index}
                      style={{
                        textAlign: 'center',
                        padding: '15px 8px',
                        background: 'rgba(102, 126, 234, 0.05)',
                        borderRadius: '15px',
                        border: '1px solid rgba(102, 126, 234, 0.1)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-3px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        height: `${Math.max(heightPercent, 10)}px`,
                        borderRadius: '8px',
                        marginBottom: '10px',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-25px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#666'
                        }}>
                          {day.totalOrders}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#2c3e50', marginBottom: '4px' }}>
                        Day {day._id.day}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>
                        ₹{day.totalRevenue.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Charts Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
              gap: '30px',
              marginTop: '30px'
            }}>
              {/* Daily Sales Bar Chart */}
              <SimpleBarChart
                data={monthlyData.dailySummary.map(day => ({
                  label: `Day ${day._id.day}`,
                  value: day.totalRevenue
                }))}
                title="📊 Daily Revenue Trend"
                color="#667eea"
              />

              {/* Daily Orders Line Chart */}
              <SimpleLineChart
                data={monthlyData.dailySummary.map(day => ({
                  label: `${day._id.day}`,
                  value: day.totalOrders
                }))}
                title="📈 Daily Orders Trend"
                color="#4ecdc4"
              />
            </div>
          </div>
        </div>
      )}

      {/* Comparison View */}
      {viewMode === 'comparison' && comparisonData && (
        <div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '25px',
            padding: '35px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 15px 50px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '700', margin: '0 0 30px 0', color: '#2c3e50', textAlign: 'center' }}>
              📈 Month-over-Month Comparison
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '25px'
            }}>
              {(() => {
                const currentTotals = calculateTotalFromDaily(comparisonData.current.dailySummary);
                const previousTotals = calculateTotalFromDaily(comparisonData.previous.dailySummary);
                
                const comparisons = [
                  {
                    metric: 'Total Orders',
                    current: currentTotals.totalOrders,
                    previous: previousTotals.totalOrders,
                    icon: '🛍️',
                    color: '#667eea'
                  },
                  {
                    metric: 'Total Revenue',
                    current: currentTotals.totalRevenue,
                    previous: previousTotals.totalRevenue,
                    icon: '💰',
                    color: '#4ecdc4',
                    format: 'currency'
                  },
                  {
                    metric: 'Avg Order Value',
                    current: currentTotals.avgOrderValue,
                    previous: previousTotals.avgOrderValue,
                    icon: '📊',
                    color: '#4caf50',
                    format: 'currency'
                  }
                ];
                
                return comparisons.map((item, index) => {
                  const growth = calculateGrowth(item.current, item.previous);
                  const growthColor = getGrowthColor(growth);
                  
                  return (
                    <div
                      key={index}
                      style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '20px',
                        border: `2px solid ${item.color}20`,
                        boxShadow: `0 10px 30px ${item.color}15`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <span style={{ fontSize: '2rem', marginRight: '12px' }}>{item.icon}</span>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2c3e50', margin: 0 }}>
                          {item.metric}
                        </h4>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                            {comparisonData.currentPeriod}
                          </div>
                          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: item.color }}>
                            {item.format === 'currency' ? `₹${Math.round(item.current).toLocaleString()}` : item.current}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                            {comparisonData.previousPeriod}
                          </div>
                          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#999' }}>
                            {item.format === 'currency' ? `₹${Math.round(item.previous).toLocaleString()}` : item.previous}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px',
                        background: `${growthColor}10`,
                        borderRadius: '12px',
                        border: `1px solid ${growthColor}30`
                      }}>
                        <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>
                          {parseFloat(growth) >= 0 ? '📈' : '📉'}
                        </span>
                        <span style={{
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          color: growthColor
                        }}>
                          {parseFloat(growth) >= 0 ? '+' : ''}{growth}%
                        </span>
                        <span style={{ fontSize: '14px', color: '#666', marginLeft: '8px' }}>
                          vs last month
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!monthlyData && !comparisonData && !loading && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '25px',
          padding: '60px 30px',
          textAlign: 'center',
          border: '2px dashed #ddd'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: '0.5' }}>📊</div>
          <h3 style={{ fontSize: '1.5rem', color: '#666', marginBottom: '10px' }}>No Sales Data Found</h3>
          <p style={{ color: '#999', fontSize: '16px' }}>
            No sales data available for the selected period.
          </p>
        </div>
      )}
    </div>
  );
};

export default MonthlySalesDashboard;
