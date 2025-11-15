import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/pages/components/ui/toaster';
import { Toaster as Sonner } from '@/pages/components/ui/sonner';
import { TooltipProvider } from '@/pages/components/ui/tooltip';

// Supplier Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import ProductDashboard from './pages/ProductDashboard';
import AddProduct from './pages/AddProduct';
import TestPage from './pages/TestPage';
import SupplierStatus from './pages/SupplierStatus';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/status" element={<SupplierStatus />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<ProductDashboard />} /> 
          <Route path="/products/add" element={<AddProduct />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
