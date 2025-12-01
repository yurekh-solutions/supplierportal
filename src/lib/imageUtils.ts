/**
 * Image URL Utility Functions
 * Handles image URL resolution for both development and production environments
 * Supports Cloudinary, relative paths, localhost, and various backend URLs
 */

/**
 * Get the appropriate backend base URL based on the current environment
 */
export const getBackendBaseUrl = (): string => {
  // Check if running on Vercel production
  const isProduction = window.location.hostname.includes('vercel.app') || 
                      window.location.hostname.includes('vercel.com');
  
  return isProduction 
    ? 'https://backendmatrix.onrender.com'
    : 'http://localhost:5000';
};

/**
 * Fix image URLs to work correctly in both development and production
 * Handles multiple URL formats:
 * 1. Cloudinary URLs - kept as-is
 * 2. Relative paths (/uploads/...) - prepended with backend base URL
 * 3. Localhost URLs - converted to production backend URL
 * 4. Incorrect backend URLs - fixed to correct production URL
 * 5. Filesystem paths - extracted and cleaned
 */
export const getFixedImageUrl = (imageUrl?: string | null): string => {
  if (!imageUrl) {
    return '';
  }
  
  const backendBaseUrl = getBackendBaseUrl();
  
  // Case 1: Cloudinary URLs (already https) - keep as-is
  if (imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com')) {
    return imageUrl;
  }
  
  // Case 2: Relative path starting with /uploads
  if (imageUrl.startsWith('/uploads')) {
    return backendBaseUrl + imageUrl;
  }
  
  // Case 2b: Filesystem path with /uploads (e.g., /opt/render/project/src/uploads/...)
  if (imageUrl.includes('/uploads/')) {
    const uploadsIndex = imageUrl.indexOf('/uploads/');
    const cleanPath = imageUrl.substring(uploadsIndex);
    return backendBaseUrl + cleanPath;
  }
  
  // Case 3: Contains localhost in the URL - replace with backend base URL
  if (imageUrl.includes('localhost')) {
    return imageUrl.replace(/http:\/\/localhost:\d+/, backendBaseUrl);
  }
  
  // Case 4: Full URL but need to validate/fix protocol and domain
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // If it's a Cloudinary URL, return as-is
    if (imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com')) {
      return imageUrl;
    }
    
    // If in production and not using correct backend domain
    const isProduction = window.location.hostname.includes('vercel.app') || 
                        window.location.hostname.includes('vercel.com');
    
    if (isProduction && !imageUrl.includes('backendmatrix.onrender.com')) {
      // Replace any backend domain with the correct one
      return imageUrl.replace(/https?:\/\/[^/]+/, backendBaseUrl);
    }
    
    // Return as-is if already correct
    return imageUrl;
  }
  
  // Case 5: Any other format - try to prepend backend URL
  return backendBaseUrl + (imageUrl.startsWith('/') ? '' : '/') + imageUrl;
};

/**
 * Get image source with error handling and fallback
 * Returns the fixed image URL or a placeholder if no image
 */
export const getImageSource = (imageUrl?: string | null): {
  src: string;
  hasFallback: boolean;
} => {
  const fixedUrl = getFixedImageUrl(imageUrl);
  
  return {
    src: fixedUrl || 'https://placehold.co/400x300/6366f1/ffffff?text=Product',
    hasFallback: !fixedUrl
  };
};

/**
 * Resolve multiple image URLs at once
 * Useful for products with multiple images
 */
export const resolveImageUrls = (imageUrls?: string[]): string[] => {
  if (!imageUrls || !Array.isArray(imageUrls)) return [];
  return imageUrls.map(url => getFixedImageUrl(url)).filter(url => url);
};

/**
 * Test if an image URL is accessible
 * Useful for checking image validity before rendering
 */
export const isImageAccessible = async (imageUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

export default {
  getBackendBaseUrl,
  getFixedImageUrl,
  getImageSource,
  resolveImageUrls,
  isImageAccessible
};
