import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { translations } from '../i18n/translations';
import type { Language, TranslationKey } from '../i18n/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    t: (key: TranslationKey) => string;
    dir: 'ltr' | 'rtl';
    isRTL: boolean;
}

const LANGUAGE_STORAGE_KEY = 'preferred_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Get initial language from localStorage or default to 'en'
const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored === 'en' || stored === 'ar') {
            return stored;
        }
    }
    return 'en';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(getInitialLanguage);

    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const isRTL = language === 'ar';

    // Set language with persistence
    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }, []);

    // Toggle between languages
    const toggleLanguage = useCallback(() => {
        const newLang = language === 'en' ? 'ar' : 'en';
        setLanguage(newLang);
    }, [language, setLanguage]);

    // Apply RTL/LTR to document
    useEffect(() => {
        document.documentElement.setAttribute('dir', dir);
        document.documentElement.lang = language;

        // Add RTL class to body for CSS styling
        if (isRTL) {
            document.body.classList.add('rtl');
            document.body.classList.remove('ltr');
        } else {
            document.body.classList.add('ltr');
            document.body.classList.remove('rtl');
        }
    }, [language, dir, isRTL]);

    // Translation function with fallback
    const t = useCallback((key: TranslationKey): string => {
        const translation = translations[language]?.[key];
        if (!translation) {
            console.warn(`Missing translation for key: ${key} in language: ${language}`);
            return translations['en'][key] || String(key);
        }
        return translation;
    }, [language]);

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            toggleLanguage,
            t,
            dir,
            isRTL
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

// Export a hook for just the translation function (performance optimization)
export const useTranslation = () => {
    const { t, language, isRTL, dir } = useLanguage();
    return { t, language, isRTL, dir };
};
