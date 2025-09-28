import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const QuickAdminLogin = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleQuickLogin = async () => {
    setLoading(true);
    try {
      const result = await login('admin@gmail.com', 'admin123');
      if (result.success) {
        onSuccess && onSuccess();
      } else {
        alert('Login failed: ' + result.message);
      }
    } catch (error) {
      alert('Login error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '32px',
          color: 'white'
        }}>
          👨‍💼
        </div>
        
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '8px'
        }}>
          Admin Login Required
        </h1>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '32px',
          fontSize: '16px'
        }}>
          Please login with admin credentials to access the dashboard
        </p>

        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <FiMail style={{
                position: 'absolute',
                left: '12px',
                color: '#6b7280'
              }} />
              <input
                type="email"
                value="admin@gmail.com"
                readOnly
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: '#f9fafb',
                  color: '#6b7280',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <FiLock style={{
                position: 'absolute',
                left: '12px',
                color: '#6b7280'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value="admin123"
                readOnly
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: '#f9fafb',
                  color: '#6b7280',
                  fontSize: '14px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleQuickLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            background: loading 
              ? '#9ca3af' 
              : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '16px'
          }}
        >
          {loading ? 'Logging in...' : 'Login as Admin'}
        </button>

        <p style={{
          fontSize: '12px',
          color: '#9ca3af',
          margin: 0
        }}>
          This will log you in as admin@gmail.com to access the professional dashboard
        </p>
      </div>
    </div>
  );
};

export default QuickAdminLogin;