import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';
import { Toaster } from '@/pages/components/ui/toaster';
import { Toaster as Sonner } from '@/pages/components/ui/sonner';
import { TooltipProvider } from '@/pages/components/ui/tooltip';
import GoogleTranslateWidget from './pages/components/GoogleTranslateWidget';
import FirstVisitLanguageModal from './pages/components/FirstVisitLanguageModal';
import { TranslationPopup } from './pages/components/TranslationPopup';
import { applyTranslation } from './lib/translationUtils';
import ScrollToTop from './components/ScrollToTop';
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
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const handleLanguageSelect = (langCode: string) => {
    // Show translation popup
    setIsTranslating(true);
    setSelectedLanguage(langCode === 'hi' ? 'Hindi' : 'English');
    
    // Apply translation with delay
    setTimeout(() => {
      applyTranslation(langCode, true);
      setIsTranslating(false);
    }, 2000);
  };
  return (
    <I18nextProvider i18n={i18n}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {/* Google Translate Widget - Hidden Implementation */}
        <GoogleTranslateWidget />
        
        {/* First Visit Language Selection Modal */}
        <FirstVisitLanguageModal onLanguageSelect={handleLanguageSelect} />
        
        {/* Translation Progress Popup */}
        <TranslationPopup 
          isOpen={isTranslating} 
          isTranslating={isTranslating} 
          language={selectedLanguage} 
        />
        
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          {/* ✅ Correct placement for ScrollToTop - Inside BrowserRouter */}
          <ScrollToTop />
          
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
    </I18nextProvider>
  );
}

export default App;
