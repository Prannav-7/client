import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666', fontSize: '16px' }}>Checking authentication...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Check if user is authenticated and is admin
  const isAdmin = isAuthenticated && user?.email === 'admin@gmail.com';

  if (!isAdmin) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '30px',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
          color: 'white',
          borderRadius: '50%',
          width: '100px',
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          boxShadow: '0 10px 30px rgba(255, 107, 107, 0.3)'
        }}>
          🔒
        </div>
        
        <div style={{ maxWidth: '500px' }}>
          <h2 style={{
            fontSize: '2.2rem',
            fontWeight: '800',
            color: '#2c3e50',
            marginBottom: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Admin Access Required
          </h2>
          
          <p style={{
            fontSize: '1.1rem',
            color: '#666',
            lineHeight: '1.6',
            marginBottom: '30px'
          }}>
            This page is restricted to administrators only. You need to be logged in as an administrator to access this feature.
          </p>

          <div style={{
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.2)',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <p style={{ 
              margin: 0,
              color: '#d63031',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              <strong>Access Requirements:</strong><br/>
              • Must be logged in as admin@gmail.com<br/>
              • Must have valid administrator credentials
            </p>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.location.href = '/login'}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
              }}
            >
              👤 Admin Login
            </button>

            <button
              onClick={() => window.location.href = '/'}
              style={{
                background: 'transparent',
                color: '#667eea',
                border: '2px solid #667eea',
                padding: '15px 30px',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#667eea';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#667eea';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🏠 Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is admin, render the protected content
  return children;
};

export default AdminRoute;
