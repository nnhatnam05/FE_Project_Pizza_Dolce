import React, { useCallback } from 'react';
import useLanguage from '../../../../hooks/useLanguage';
import './LanguageSelector.css';

const LanguageSelector = ({ onLanguageChange }) => {
  const { currentLanguage, changeLanguage, getAvailableLanguages, t } = useLanguage();
  const availableLanguages = getAvailableLanguages();

  const handleLanguageChange = useCallback((event) => {
    const newLanguage = event.target.value;
    console.log('LanguageSelector - handleLanguageChange called with:', newLanguage);
    console.log('LanguageSelector - currentLanguage:', currentLanguage);
    console.log('LanguageSelector - onLanguageChange prop:', onLanguageChange);
    
    if (newLanguage !== currentLanguage) {
      console.log('LanguageSelector - Language changed, calling changeLanguage');
      changeLanguage(newLanguage);
      
      // Hiển thị thông báo reload
      const languageName = newLanguage === 'en' ? 'English' : 'Tiếng Việt';
      console.log(`LanguageSelector - Language changed to ${languageName}, page will reload`);
      
      // Gọi callback để reload page
      if (onLanguageChange && typeof onLanguageChange === 'function') {
        console.log('LanguageSelector - Calling onLanguageChange callback');
        onLanguageChange(newLanguage);
      } else {
        console.warn('LanguageSelector - onLanguageChange is not a function:', onLanguageChange);
      }
    } else {
      console.log('LanguageSelector - Language unchanged, skipping callback');
    }
  }, [currentLanguage, changeLanguage, onLanguageChange]);

  return (
    <div className="language-selector">
      <label htmlFor="language-select" className="language-label">
        {t('filters.language')}:
      </label>
      <select
        id="language-select"
        value={currentLanguage}
        onChange={handleLanguageChange}
        className="language-select"
        aria-label={t('filters.language')}
        title={t('filters.languageChangeReload')}
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      <div className="language-hint">
        {t('filters.languageChangeHint')}
      </div>
    </div>
  );
};

export default LanguageSelector; 