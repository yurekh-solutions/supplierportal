/**
 * Utility function to fix image URLs for both development and production environments
 * Ensures images are loaded from the correct backend server
 */
export const getImageUrl = (imageUrl: string | undefined | null): string => {
  if (!imageUrl) return '';

  // Determine if we're in production (Vercel deployment)
  const isProduction = 
    window.location.hostname.includes('vercel.app') || 
    window.location.hostname.includes('vercel.com');
  
  const backendBaseUrl = isProduction
    ? 'https://backendmatrix.onrender.com'
    : 'http://localhost:5000';

  let fixedUrl = imageUrl;

  // Case 1: Relative path starting with /uploads
  if (fixedUrl.startsWith('/uploads')) {
    fixedUrl = backendBaseUrl + fixedUrl;
  }
  // Case 2: Contains localhost in the URL
  else if (fixedUrl.includes('localhost')) {
    fixedUrl = fixedUrl.replace(/http:\/\/localhost:\d+/, backendBaseUrl);
  }
  // Case 3: Already has full URL but wrong backend in production
  else if (isProduction && fixedUrl.startsWith('http://')) {
    // Ensure we're using the correct production backend
    if (!fixedUrl.includes('backendmatrix.onrender.com')) {
      fixedUrl = fixedUrl.replace(/https?:\/\/[^/]+/, backendBaseUrl);
    }
  }

  return fixedUrl;
};

/**
 * Get a fallback placeholder image URL
 */
export const getFallbackImageUrl = (text: string = 'No Image'): string => {
  return `https://placehold.co/400x300/e5e7eb/9ca3af?text=${encodeURIComponent(text)}`;
};
