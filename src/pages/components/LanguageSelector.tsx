import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages, Check } from "lucide-react";
import { TranslationPopup } from "./TranslationPopup";
import { 
  syncLanguageState, 
  applyTranslation as applyTranslationUtil,
  resetToEnglish 
} from "@/lib/translationUtils";
import { useTranslation } from "react-i18next";

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
];

const LanguageSelector = () => {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");
  const [showPopup, setShowPopup] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { i18n } = useTranslation();

  // Load saved language preference on mount
  useEffect(() => {
    // Sync and get effective language
    const effectiveLang = syncLanguageState();
    
    console.log("📍 Current language on load:", effectiveLang);
    setCurrentLanguage(effectiveLang);
    
    // Sync i18n
    if (i18n.language !== effectiveLang) {
      i18n.changeLanguage(effectiveLang);
    }
  }, [i18n]);

  const applyTranslation = (langCode: string, showAnimation: boolean = true) => {
    if (showAnimation) {
      setIsTranslating(true);
      setShowPopup(true);
      
      // Show animation then apply
      setTimeout(() => {
        setIsTranslating(false);
        applyTranslationUtil(langCode, true);
      }, 1500);
    } else {
      // Apply immediately
      applyTranslationUtil(langCode, true);
    }
  };

  const handleLanguageChange = (langCode: string) => {
    if (langCode === currentLanguage) return;

    setCurrentLanguage(langCode);
    
    // Change i18n language
    i18n.changeLanguage(langCode);
    
    if (langCode === "en") {
      // Reset to English using utility
      resetToEnglish();
    } else {
      // Translate to selected language with animation
      applyTranslation(langCode, true);
    }
  };

  const getCurrentLanguageName = () => {
    const lang = languages.find((l) => l.code === currentLanguage);
    return lang?.nativeName || "English";
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all"
          >
            <Languages className="w-4 h-4" />
            <span className="hidden sm:inline">{getCurrentLanguageName()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="cursor-pointer flex items-center justify-between"
            >
              <span>{language.nativeName}</span>
              {currentLanguage === language.code && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <TranslationPopup
        isOpen={showPopup}
        isTranslating={isTranslating}
        language={getCurrentLanguageName()}
      />
    </>
  );
};

export default LanguageSelector;
