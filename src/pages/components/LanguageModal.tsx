import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/pages/components/ui/button';

const LanguageModal = ({ onClose }: { onClose: () => void }) => {
  const { i18n, t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const languages = [
    {
      code: 'en',
      name: t('english'),
      nativeName: 'English',
      flag: '🇺🇸',
      description: 'English - Explore in English'
    },
    {
      code: 'hi',
      name: t('hindi'),
      nativeName: 'हिन्दी',
      flag: '🇮🇳',
      description: 'हिन्दी - हिंदी में अन्वेषण करें'
    }
  ];

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    i18n.changeLanguage(languageCode);
  };

  const handleContinue = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-card border-2 border-white/30 rounded-3xl p-8 max-w-md w-full bg-white/70 dark:bg-black/40 backdrop-blur-3xl shadow-4xl animate-scale-in relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl -z-10"></div>

        <div className="relative z-10 text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl animate-glow-pulse">
              <Globe className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gradient mb-2">{t('selectLanguage')}</h2>
          <p className="text-muted-foreground">{t('selectLanguageDesc')}</p>
        </div>

        {/* Language Options */}
        <div className="space-y-3 mb-8">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group ${
                selectedLanguage === lang.code
                  ? 'border-primary bg-primary/10 shadow-lg'
                  : 'border-white/30 bg-white/50 hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              <span className="text-4xl">{lang.flag}</span>
              <div className="flex-1 text-left">
                <p className="font-bold text-foreground text-lg">{lang.nativeName}</p>
                <p className="text-sm text-muted-foreground">{lang.description}</p>
              </div>
              {selectedLanguage === lang.code && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-6 rounded-xl hover:shadow-2xl transition-all duration-300 text-lg"
        >
          {t('continue')}
        </Button>

        {/* Info Text */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          💾 {t('selectLanguageDesc')} - Your choice will be saved automatically
        </p>
      </div>
    </div>
  );
};

export default LanguageModal;
