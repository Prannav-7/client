import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';

const AuthDebug = () => {
  const { user, isAuthenticated } = useAuth();
  const { isAdmin, adminEmail, currentUserEmail } = useAdmin();

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      minWidth: '250px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#ffd700' }}>🔍 Auth Debug</h4>
      <div><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
      <div><strong>Current User:</strong> {currentUserEmail || 'None'}</div>
      <div><strong>Is Admin:</strong> {isAdmin ? '✅ Yes' : '❌ No'}</div>
      <div><strong>Admin Email:</strong> {adminEmail}</div>
      <div><strong>User Object:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</div>
      <div><strong>Token Present:</strong> {localStorage.getItem('token') ? '✅ Yes' : '❌ No'}</div>
    </div>
  );
};

export default AuthDebug;