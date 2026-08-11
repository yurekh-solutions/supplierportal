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
    return 'https://backendmatrix-cox3.onrender.com/api';
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

/**
 * Wake up the Render free tier server before making API calls.
 * Render sleeps after 15 min of inactivity; cold start takes 30-60s.
 */
export const wakeUpServer = async (): Promise<boolean> => {
  try {
    console.log('⏳ Waking up backend server...');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    console.log('✅ Server is awake');
    return true;
  } catch {
    console.log('⚠️ Wake-up ping failed, server may still be booting...');
    return false;
  }
};

/**
 * Fetch wrapper with timeout support for Render cold starts.
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeoutMs: number = 90000
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    return response;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
};
