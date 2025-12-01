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
  let processedUrl = imageUrl;
  
  // Case 1: Cloudinary URLs (already https) - keep as-is
  if (processedUrl.includes('cloudinary.com') || processedUrl.includes('res.cloudinary.com')) {
    return processedUrl;
  }
  
  // Case 2: Relative path starting with /uploads
  if (processedUrl.startsWith('/uploads')) {
    return backendBaseUrl + processedUrl;
  }
  
  // Case 2b: Filesystem path with /uploads (e.g., /opt/render/project/src/uploads/...)
  if (processedUrl.includes('/uploads/')) {
    const uploadsIndex = processedUrl.indexOf('/uploads/');
    const cleanPath = processedUrl.substring(uploadsIndex);
    return backendBaseUrl + cleanPath;
  }
  
  // Case 3: Contains localhost in the URL - replace with backend base URL
  if (processedUrl.includes('localhost')) {
    return processedUrl.replace(/http:\/\/localhost:\d+/, backendBaseUrl);
  }
  
  // Case 4: Full URL but need to validate/fix protocol and domain
  if (processedUrl.startsWith('http://') || processedUrl.startsWith('https://')) {
    // If it's a Cloudinary URL, return as-is
    if (processedUrl.includes('cloudinary.com') || processedUrl.includes('res.cloudinary.com')) {
      return processedUrl;
    }
    
    // If in production and not using correct backend domain
    const isProduction = window.location.hostname.includes('vercel.app') || 
                        window.location.hostname.includes('vercel.com');
    
    if (isProduction && !processedUrl.includes('backendmatrix.onrender.com')) {
      // Replace any backend domain with the correct one
      return processedUrl.replace(/https?:\/\/[^/]+/, backendBaseUrl);
    }
    
    // Return as-is if already correct
    return processedUrl;
  }
  
  // Case 5: Any other format - try to prepend backend URL
  return backendBaseUrl + (processedUrl.startsWith('/') ? '' : '/') + processedUrl;
};

/**
 * Get image source with error handling and fallback
 * Returns the fixed image URL with fallback support
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
 * Handle image errors with fallback strategies
 * Tries multiple fallback options when image fails to load
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const img = event.currentTarget;
  const currentSrc = img.src;
  
  // Don't retry if already a fallback placeholder
  if (currentSrc.includes('placehold.co') || currentSrc.includes('unsplash.com')) {
    return;
  }
  
  // Fallback 1: Try with data-retry attribute if not already retried
  if (!img.getAttribute('data-retry')) {
    img.setAttribute('data-retry', 'true');
    // Give the image one more chance to load
    img.src = currentSrc;
    return;
  }
  
  // Fallback 2: Use placeholder
  img.src = 'https://placehold.co/400x300/e5e7eb/9ca3af?text=No+Image';
};

/**
 * Handle image error with retry for product cards
 * Provides better fallback handling
 */
export const handleImageErrorWithFallback = (event: React.SyntheticEvent<HTMLImageElement>, fallbackUrl?: string) => {
  const img = event.currentTarget;
  const originalSrc = img.getAttribute('data-original-src') || img.src;
  
  // Store original source if not already stored
  if (!img.getAttribute('data-original-src')) {
    img.setAttribute('data-original-src', img.src);
  }
  
  // Check retry count
  const retryCount = parseInt(img.getAttribute('data-retry-count') || '0');
  
  // If this is a Cloudinary image and first error, retry once
  if (originalSrc.includes('cloudinary.com') && retryCount === 0) {
    img.setAttribute('data-retry-count', '1');
    // Add cache-busting parameter and retry
    setTimeout(() => {
      img.src = originalSrc.includes('?') 
        ? originalSrc + '&t=' + Date.now() 
        : originalSrc + '?t=' + Date.now();
    }, 300);
    return;
  }
  
  // If fallback provided, try it
  if (fallbackUrl && !img.getAttribute('data-fallback-tried')) {
    img.setAttribute('data-fallback-tried', 'true');
    img.src = fallbackUrl;
    return;
  }
  
  // Otherwise use placeholder
  img.src = 'https://placehold.co/400x300/e5e7eb/9ca3af?text=No+Image';
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

/**
 * Get alternative image URL if primary fails
 * Useful for having multiple fallback sources
 */
export const getAlternativeImageUrl = (imageUrl?: string | null, includeUnsplash: boolean = true): string => {
  if (imageUrl) {
    return getFixedImageUrl(imageUrl);
  }
  
  // If no image, return a nice placeholder
  if (includeUnsplash) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop';
  }
  
  return 'https://placehold.co/400x300/e5e7eb/9ca3af?text=No+Image';
};

export default {
  getBackendBaseUrl,
  getFixedImageUrl,
  getImageSource,
  resolveImageUrls,
  isImageAccessible
};
