import { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
];

export const GTranslateDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect current language from URL or default to English
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam) {
      const lang = languages.find(l => l.code === langParam);
      if (lang) setCurrentLanguage(lang);
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
    setIsOpen(false);

    // Method 1: Try to trigger GTranslate combo select
    const gtCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (gtCombo) {
      gtCombo.value = lang.code;
      gtCombo.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    // Method 2: Try to find and click GTranslate links
    const gtLinks = document.querySelectorAll('a.goog-te-menu2-item span.text');
    gtLinks.forEach((link) => {
      if (link.textContent?.includes(lang.nativeName) || link.textContent?.includes(lang.name)) {
        (link.parentElement as HTMLElement)?.click();
      }
    });

    // Method 3: Use hash method for GTranslate
    if (lang.code === 'en') {
      // Reset to English - reload page
      window.location.hash = '';
      window.location.reload();
    } else {
      // Set language hash
      window.location.hash = `#googtrans(en|${lang.code})`;
      window.location.reload();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
      >
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-foreground hidden sm:inline">{currentLanguage.nativeName}</span>
        <span className="text-foreground sm:hidden">{currentLanguage.code.toUpperCase()}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-border overflow-hidden z-50 animate-slide-up">
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang)}
                  className={`w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors ${
                    currentLanguage.code === lang.code
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-accent text-foreground'
                  }`}
                >
                  <div>
                    <div className="font-medium text-sm">{lang.nativeName}</div>
                    <div className="text-xs text-muted-foreground">{lang.name}</div>
                  </div>
                  {currentLanguage.code === lang.code && (
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GTranslateDropdown;
