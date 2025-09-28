import React from 'react';

const SimpleBarChart = ({ data, title, color = '#667eea' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#666'
      }}>
        No data available for chart
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '25px',
      padding: '30px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 15px 50px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{
        fontSize: '1.4rem',
        fontWeight: '700',
        marginBottom: '25px',
        color: '#2c3e50',
        textAlign: 'center'
      }}>
        {title}
      </h3>
      
      <div style={{
        display: 'flex',
        alignItems: 'end',
        justifyContent: 'space-around',
        height: '300px',
        padding: '0 20px',
        borderBottom: '2px solid #f0f0f0',
        gap: '10px'
      }}>
        {data.map((item, index) => {
          const height = maxValue > 0 ? (item.value / maxValue) * 250 : 10;
          
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                minWidth: '60px'
              }}
            >
              {/* Value Label on top */}
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#666',
                marginBottom: '8px',
                textAlign: 'center'
              }}>
                {typeof item.value === 'number' && item.value > 1000 
                  ? `₹${(item.value / 1000).toFixed(1)}K` 
                  : item.value.toLocaleString()
                }
              </div>
              
              {/* Bar */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '40px',
                  height: `${height}px`,
                  background: `linear-gradient(to top, ${color}, ${color}88)`,
                  borderRadius: '8px 8px 0 0',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: `0 4px 15px ${color}30`
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'scaleX(1.2)';
                  e.target.style.boxShadow = `0 6px 20px ${color}50`;
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'scaleX(1)';
                  e.target.style.boxShadow = `0 4px 15px ${color}30`;
                }}
              />
              
              {/* Label */}
              <div style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#2c3e50',
                marginTop: '8px',
                textAlign: 'center',
                lineHeight: '1.2'
              }}>
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SimpleLineChart = ({ data, title, color = '#4ecdc4' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#666'
      }}>
        No data available for trend chart
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue || 1;

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '25px',
      padding: '30px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 15px 50px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{
        fontSize: '1.4rem',
        fontWeight: '700',
        marginBottom: '25px',
        color: '#2c3e50',
        textAlign: 'center'
      }}>
        {title}
      </h3>
      
      <div style={{
        position: 'relative',
        height: '250px',
        padding: '20px',
        borderRadius: '15px',
        background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)'
      }}>
        <svg
          width="100%"
          height="100%"
          style={{ overflow: 'visible' }}
        >
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={`${i * 25}%`}
              x2="100%"
              y2={`${i * 25}%`}
              stroke="#e0e0e0"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          ))}
          
          {/* Line path */}
          <path
            d={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((point.value - minValue) / range) * 100;
              return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
            }).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((point.value - minValue) / range) * 100;
            
            return (
              <g key={index}>
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={`${x}%`}
                  y={`${y - 8}%`}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#666"
                  fontWeight="600"
                >
                  {point.value}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '10px',
          paddingTop: '10px',
          borderTop: '1px solid #e0e0e0'
        }}>
          {data.map((point, index) => (
            <span
              key={index}
              style={{
                fontSize: '11px',
                color: '#666',
                fontWeight: '600'
              }}
            >
              {point.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export { SimpleBarChart, SimpleLineChart };
