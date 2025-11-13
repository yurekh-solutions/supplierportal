// Supplier Portal Entry Point
export { default as SupplierDashboard } from './pages/Dashboard';
export { default as SupplierLogin } from './pages/Login';
export { default as SupplierOnboarding } from './pages/Onboarding';
export { default as SupplierProductDashboard } from './pages/ProductDashboard';
export { default as SupplierTestPage } from './pages/TestPage';
export { default as SupplierLayout } from './components/SupplierLayout';
export { default as SupplierHeader } from './components/SupplierHeader';

// Supplier Portal Routes
export const supplierRoutes = [
  {
    path: '/supplier',
    component: './pages/Login',
  },
  {
    path: '/supplier/login',
    component: './pages/Login',
  },
  {
    path: '/supplier/onboarding',
    component: './pages/Onboarding',
  },
  {
    path: '/supplier/dashboard',
    component: './pages/Dashboard',
  },
  {
    path: '/supplier/products',
    component: './pages/ProductDashboard',
  },
];