import React from 'react';
import { useAdmin } from '../hooks/useAdmin';

const AdminIndicator = ({ showStatus = false }) => {
  const { isAdmin, currentUserEmail } = useAdmin();

  if (!isAdmin) return null;

  return (
    <>
      {showStatus && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '25px',
          fontSize: '12px',
          fontWeight: '600',
          boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          animation: 'pulse 2s infinite'
        }}>
          <span>🔑</span>
          <span>Admin Mode Active</span>
          <style>{`
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.7; }
              100% { opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default AdminIndicator;
