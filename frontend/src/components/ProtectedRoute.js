import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
const ProtectedRoute = ({ children, allowedRoles }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Get token and role from localStorage
        const token = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');
        
        console.log('Checking auth - token:', token ? 'exists' : 'missing');
        console.log('Checking auth - stored role:', storedRole);
        
        if (!token) {
          console.log('No token found, not authorized');
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        // Verify token is valid by decoding
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          // Check if token is expired
          if (decoded.exp && decoded.exp < currentTime) {
            console.log('Token expired, not authorized');
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            setIsAuthorized(false);
            setIsLoading(false);
            return;
          }
          
          // Use role from token if available, otherwise use stored role
          const userRole = storedRole || decoded.role;
          
          // Check if user has allowed role
          if (allowedRoles && !allowedRoles.includes(userRole)) {
            console.log(`Role ${userRole} not in allowed roles:`, allowedRoles);
            setIsAuthorized(false);
            setIsLoading(false);
            return;
          }
          
          console.log('User authorized with role:', userRole);
          setIsAuthorized(true);
          setIsLoading(false);
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          setIsAuthorized(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setIsAuthorized(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    // Redirect to login page if not authorized
    console.log('Not authorized, redirecting to login');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  console.log('User is authorized, rendering protected content');
  return children;
};

export default ProtectedRoute;