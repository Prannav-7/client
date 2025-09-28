import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to check if the current user is an administrator
 * Only admin@gmail.com is considered an admin
 */
export const useAdmin = () => {
  const { user, isAuthenticated } = useAuth();
  
  const isAdmin = isAuthenticated && user?.email === 'admin@gmail.com';
  
  return {
    isAdmin,
    adminEmail: 'admin@gmail.com',
    currentUserEmail: user?.email || null,
    isAuthenticated
  };
};

export default useAdmin;
