/**
 * Google Translate Cookie Management Utilities
 * 
 * This module provides robust translation persistence across:
 * - Page refreshes (F5)
 * - Hard refreshes (Ctrl+F5)
 * - Navigation between pages
 * - Browser restarts
 * - Different domains/subdomains
 */

const COOKIE_NAME = "googtrans";
const STORAGE_KEY = "preferredLanguage";
const RELOAD_FLAG_KEY = "gt_reload_pending";

/**
 * Set Google Translate cookie with multiple strategies for maximum compatibility
 * Handles all navigation scenarios including hard refresh and cross-domain
 */
export const setGoogleTranslateCookie = (langCode: string): void => {
  const cookieValue = langCode === "en" ? "" : `/en/${langCode}`;
  const domain = window.location.hostname;
  
  // STEP 1: Clear all existing cookies (prevents conflicts)
  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
  document.cookie = `${COOKIE_NAME}=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
  document.cookie = `${COOKIE_NAME}=; path=/; domain=.${domain}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
  
  // STEP 2: Set new cookie with multiple strategies
  if (cookieValue) {
    // Strategy 1: Path-only (works for single domain)
    document.cookie = `${COOKIE_NAME}=${cookieValue}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Strategy 2: With domain (handles navigation within same domain)
    document.cookie = `${COOKIE_NAME}=${cookieValue}; path=/; domain=${domain}; max-age=31536000; SameSite=Lax`;
    
    // Strategy 3: With leading dot (handles subdomains)
    if (domain.split('.').length > 1) {
      document.cookie = `${COOKIE_NAME}=${cookieValue}; path=/; domain=.${domain}; max-age=31536000; SameSite=Lax`;
    }
  }
  
  console.log(`🍪 Translation cookie updated: ${COOKIE_NAME}=${cookieValue || '(cleared)'}`);
};

/**
 * Get current language from Google Translate cookie
 */
export const getGoogleTranslateCookie = (): string => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(`${COOKIE_NAME}=`)) {
      const value = cookie.substring(`${COOKIE_NAME}=`.length);
      if (value && value.includes('/')) {
        const parts = value.split('/');
        return parts[parts.length - 1] || 'en';
      }
    }
  }
  return 'en';
};

/**
 * Save language preference to localStorage
 */
export const saveLanguagePreference = (langCode: string): void => {
  localStorage.setItem(STORAGE_KEY, langCode);
};

/**
 * Get saved language preference from localStorage
 */
export const getLanguagePreference = (): string | null => {
  return localStorage.getItem(STORAGE_KEY);
};

/**
 * Synchronize localStorage and cookie
 * Returns the effective language code
 */
export const syncLanguageState = (): string => {
  const savedLanguage = getLanguagePreference();
  const cookieLang = getGoogleTranslateCookie();
  
  // Priority: Cookie > localStorage (cookie is what Google Translate uses)
  const effectiveLang = cookieLang !== "en" ? cookieLang : (savedLanguage || "en");
  
  // Sync localStorage with cookie
  if (effectiveLang !== savedLanguage) {
    saveLanguagePreference(effectiveLang);
  }
  
  return effectiveLang;
};

/**
 * Check if a reload is needed to apply translation
 */
export const isReloadPending = (): boolean => {
  return sessionStorage.getItem(RELOAD_FLAG_KEY) === "true";
};

/**
 * Mark that a reload is pending
 */
export const setReloadPending = (): void => {
  sessionStorage.setItem(RELOAD_FLAG_KEY, "true");
};

/**
 * Clear reload pending flag
 */
export const clearReloadPending = (): void => {
  sessionStorage.removeItem(RELOAD_FLAG_KEY);
};

/**
 * Apply translation by setting cookie and reloading
 */
export const applyTranslation = (langCode: string, forceReload: boolean = true): void => {
  setGoogleTranslateCookie(langCode);
  saveLanguagePreference(langCode);
  clearReloadPending();
  
  if (forceReload) {
    // Use replace to avoid adding to history
    window.location.replace(window.location.pathname + window.location.search);
  }
};

/**
 * Reset to English (clear translation)
 */
export const resetToEnglish = (): void => {
  setGoogleTranslateCookie("en");
  saveLanguagePreference("en");
  clearReloadPending();
  window.location.replace(window.location.pathname + window.location.search);
};
