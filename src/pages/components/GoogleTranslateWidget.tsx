import { useEffect } from "react";
import { 
  setGoogleTranslateCookie, 
  getGoogleTranslateCookie,
  getLanguagePreference,
  isReloadPending,
  setReloadPending,
  clearReloadPending
} from "@/lib/translationUtils";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: {
      translate: {
        TranslateElement: {
          new (config: unknown, elementId: string): void;
          InlineLayout: {
            SIMPLE: number;
          };
        };
      };
    };
  }
}

const GoogleTranslateWidget = () => {
  useEffect(() => {
    // Function to aggressively hide Google Translate UI elements
    const hideGoogleTranslateUI = () => {
      // Hide all Google Translate related elements
      const selectors = [
        '.goog-te-banner-frame',
        '.goog-te-banner',
        '.skiptranslate',
        'iframe.skiptranslate',
        '.goog-te-gadget',
        '.goog-te-combo',
        '.goog-te-balloon-frame',
        '.goog-te-menu-frame',
        '.goog-te-spinner-pos',
        '.goog-te-ftab',
        'body > .skiptranslate',
        'iframe[src*="translate.google.com"]',
        'iframe[src*="translate.googleapis.com"]',
        '.goog-te-spinner',
        '.goog-te-spinner-animation',
        '.goog-te-spinner-container',
        '.VIpgJd-ZVi9od-aZ2wEe-wOHMyf',
        '.VIpgJd-ZVi9od-aZ2wEe',
        'img[src*="translate.google.com"]',
        'img[src*="loading"]',
        '[role="progressbar"]',
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.position = 'absolute';
            el.style.top = '-9999px';
            el.style.left = '-9999px';
            el.style.zIndex = '-9999';
            el.style.pointerEvents = 'none';
          }
        });
      });

      // Ensure body has no top offset
      document.body.style.top = '0';
      document.body.style.position = 'static';
    };

    // Add the Google Translate script
    const addScript = () => {
      // Check if script already exists
      if (document.querySelector('script[src*="translate.google.com"]')) {
        return;
      }

      // Initialize Google Translate
      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,hi",
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
              multilanguagePage: true,
            },
            "google_translate_element"
          );
          
          console.log("✅ Google Translate initialized");
          
          // Immediately hide any UI elements
          hideGoogleTranslateUI();
          
          // Get both preferences
          const savedLanguage = getLanguagePreference();
          const cookieLang = getGoogleTranslateCookie();
          
          console.log("📌 localStorage:", savedLanguage, "| 🍪 Cookie:", cookieLang);
          
          // Handle synchronization for all navigation scenarios
          if (savedLanguage && savedLanguage !== "en") {
            if (cookieLang !== savedLanguage) {
              console.log("🔄 Syncing cookie with localStorage...");
              setGoogleTranslateCookie(savedLanguage);
              
              // Prevent infinite reload loop with flag
              if (!isReloadPending()) {
                setReloadPending();
                setTimeout(() => {
                  window.location.replace(window.location.pathname + window.location.search);
                }, 200);
              }
            } else {
              // Already in sync
              clearReloadPending();
            }
          } else if (!savedLanguage && cookieLang && cookieLang !== "en") {
            // Cookie exists but localStorage missing - sync back
            console.log("🔄 Syncing localStorage with cookie...");
            localStorage.setItem("preferredLanguage", cookieLang);
          } else {
            // Both are English or in sync
            clearReloadPending();
          }
        }
      };

      // Load Google Translate script
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.getElementsByTagName("head")[0].appendChild(script);
    };

    addScript();
    
    // Monitor and hide Google Translate UI continuously
    const observer = new MutationObserver(() => {
      hideGoogleTranslateUI();
    });

    // Observe the entire document for any Google Translate elements
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Run hide function periodically as a safety net
    const interval = setInterval(hideGoogleTranslateUI, 500);

    // Initial hide
    hideGoogleTranslateUI();

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Completely hidden Google Translate widget */}
      <div
        id="google_translate_element"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          visibility: "hidden",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
      
      {/* Hide Google Translate banner and UI elements - COMPLETELY INVISIBLE */}
      <style>{`
        /* CRITICAL: Hide ALL Google Translate UI elements including loading spinners */
        .goog-te-banner-frame,
        .goog-te-banner,
        .skiptranslate,
        iframe.skiptranslate,
        .goog-te-gadget,
        .goog-te-combo,
        .goog-te-menu-value,
        .goog-te-balloon-frame,
        div#google_translate_element,
        #google_translate_element,
        .goog-te-spinner-pos,
        .goog-te-ftab,
        .goog-logo-link,
        .goog-te-gadget-simple,
        .goog-te-menu-frame,
        .goog-te-menu2,
        body > .skiptranslate,
        body > .goog-te-banner-frame,
        .goog-te-spinner,
        .goog-te-spinner-animation,
        .goog-te-spinner-container,
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
        .VIpgJd-ZVi9od-aZ2wEe,
        img[src*="translate.google.com"],
        img[src*="loading.gif"],
        [role="progressbar"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          width: 0 !important;
          position: absolute !important;
          top: -9999px !important;
          left: -9999px !important;
          z-index: -9999 !important;
          pointer-events: none !important;
        }
        
        /* Prevent body top offset from Google Translate */
        body {
          top: 0 !important;
          position: static !important;
        }
        
        /* Hide Google Translate toolbar and dropdowns */
        .goog-te-gadget,
        .goog-te-combo,
        select.goog-te-combo {
          display: none !important;
          visibility: hidden !important;
        }
        
        /* Hide floating translation widgets */
        .goog-te-balloon-frame {
          display: none !important;
        }
        
        /* Hide any iframe elements from Google Translate */
        iframe[src*="translate.google.com"],
        iframe[src*="translate.googleapis.com"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          position: absolute !important;
          top: -9999px !important;
          left: -9999px !important;
        }
        
        /* Ensure no visual artifacts during translation */
        html.translated-ltr,
        html.translated-rtl {
          margin-top: 0 !important;
        }
        
        /* Hide Google Translate attribution */
        .goog-logo-link,
        .goog-logo-link:link,
        .goog-logo-link:visited,
        .goog-logo-link:hover,
        .goog-logo-link:active {
          display: none !important;
          visibility: hidden !important;
        }
      `}</style>
    </>
  );
};

export default GoogleTranslateWidget;
