import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import ProductDashboard from './pages/ProductDashboard';

const SupplierPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<object | null>(null);

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('supplierToken');
    if (token) {
      // Verify token and set user data
      try {
        // In a real implementation, you would verify the token with your backend
        const userData = JSON.parse(localStorage.getItem('supplierUser') || '{}');
        if (userData && Object.keys(userData).length > 0) {
          setIsAuthenticated(true);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('supplierToken');
        localStorage.removeItem('supplierUser');
      }
    }
  }, []);

  const handleLogin = (userData: object) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('supplierToken');
    localStorage.removeItem('supplierUser');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/supplier/login" replace />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/supplier/dashboard" replace /> : 
              <Login />
            } 
          />
          <Route 
            path="/onboarding" 
            element={
              isAuthenticated ? 
              <Navigate to="/supplier/dashboard" replace /> : 
              <Onboarding />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard /> : 
              <Navigate to="/supplier/login" replace />
            } 
          />
          <Route 
            path="/products" 
            element={
              isAuthenticated ? 
              <ProductDashboard /> : 
              <Navigate to="/supplier/login" replace />
            } 
          />
          <Route path="*" element={<Navigate to="/supplier/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default SupplierPortal;