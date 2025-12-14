/**
 * Shared API URL detection utility for all RitzYard frontends
 * Intelligently detects environment and returns appropriate API URL
 */

export const getApiUrl = (): string => {
  if (typeof window === 'undefined') {
    // Server-side rendering fallback
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  }

  const hostname = window.location.hostname;
  console.log('🌐 Current hostname:', hostname);

  // Development: localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('💻 Development mode: Using localhost backend');
    return 'http://localhost:5000/api';
  }

  // Production: Vercel deployments
  if (hostname.includes('vercel.app') || hostname === 'ritzyard.com' || hostname === 'www.ritzyard.com') {
    console.log('✅ Production mode: Using Render backend');
    return 'https://backendmatrix.onrender.com/api';
  }

  // Fallback to environment variable
  if (import.meta.env.VITE_API_URL) {
    console.log('⚙️ Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }

  // Last resort: localhost
  console.log('⚠️ Defaulting to localhost backend');
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiUrl();
