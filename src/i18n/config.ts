import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';

// Get saved language from localStorage or default to English
const getSavedLanguage = () => {
  const saved = localStorage.getItem('preferredLanguage');
  return saved || 'en';
};

i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      hi: { translation: hiTranslations },
    },
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    ns: ['translation'],
    defaultNS: 'translation',
    react: {
      useSuspense: false,
    },
  });

// Listen for language changes and save to localStorage
i18next.on('languageChanged', (lng) => {
  localStorage.setItem('preferredLanguage', lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  
  // Trigger storage event to update HTML meta tags
  window.dispatchEvent(new Event('storage'));
});

export default i18next;
