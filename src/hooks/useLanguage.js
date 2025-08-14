import { useState, useEffect, useCallback } from 'react';
import { en } from '../locales/en';
import { vi } from '../locales/vi';

const LANGUAGES = {
  en,
  vi
};

const LANGUAGE_KEY = 'dashboard_language';

const useLanguage = () => {
  // Lấy ngôn ngữ từ localStorage hoặc mặc định là 'en'
  const getInitialLanguage = () => {
    try {
      const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
      return savedLanguage && LANGUAGES[savedLanguage] ? savedLanguage : 'en';
    } catch (error) {
      console.warn('Could not read language from localStorage:', error);
      return 'en';
    }
  };

  const [currentLanguage, setCurrentLanguage] = useState(getInitialLanguage);

  // Lưu ngôn ngữ vào localStorage
  const saveLanguage = useCallback((language) => {
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.warn('Could not save language to localStorage:', error);
    }
  }, []);

  // Thay đổi ngôn ngữ
  const changeLanguage = useCallback((language) => {
    if (LANGUAGES[language]) {
      setCurrentLanguage(language);
      saveLanguage(language);
    } else {
      console.warn(`Language '${language}' is not supported`);
    }
  }, [saveLanguage]);

  // Lấy text theo key
  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = LANGUAGES[currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key '${key}' not found for language '${currentLanguage}'`);
        return key; // Trả về key gốc nếu không tìm thấy
      }
    }
    
    return value || key;
  }, [currentLanguage]);

  // Lấy danh sách ngôn ngữ có sẵn
  const getAvailableLanguages = useCallback(() => {
    return Object.keys(LANGUAGES).map(code => ({
      code,
      name: LANGUAGES[code].filters.languages[code]
    }));
  }, []);

  // Lấy ngôn ngữ hiện tại
  const getCurrentLanguage = useCallback(() => {
    return {
      code: currentLanguage,
      name: LANGUAGES[currentLanguage].filters.languages[currentLanguage]
    };
  }, [currentLanguage]);

  // Reset về ngôn ngữ mặc định
  const resetToDefault = useCallback(() => {
    changeLanguage('en');
  }, [changeLanguage]);

  // Effect để lưu ngôn ngữ khi thay đổi
  useEffect(() => {
    saveLanguage(currentLanguage);
  }, [currentLanguage, saveLanguage]);

  return {
    // State
    currentLanguage,
    language: currentLanguage,
    
    // Functions
    changeLanguage,
    t,
    getAvailableLanguages,
    getCurrentLanguage,
    resetToDefault,
    
    // Constants
    LANGUAGES,
    DEFAULT_LANGUAGE: 'en'
  };
};

export default useLanguage; 