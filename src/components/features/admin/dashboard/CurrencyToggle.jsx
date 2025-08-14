import React from 'react';
import useLanguage from '../../../../hooks/useLanguage';
import './CurrencyToggle.css';

const CurrencyToggle = ({ currency, onCurrencyChange, className = '' }) => {
  const { t } = useLanguage();
  
  const handleCurrencyChange = (newCurrency) => {
    if (onCurrencyChange && typeof onCurrencyChange === 'function') {
      onCurrencyChange(newCurrency);
    }
  };

  return (
    <div className={`currency-toggle ${className}`}>
      <div className="toggle-label">
        <span className="toggle-icon">💱</span>
        <span className="toggle-text">{t('filters.currency')}:</span>
      </div>
      
      <div className="toggle-buttons">
        <button
          className={`toggle-button ${currency === 'USD' ? 'active' : ''}`}
          onClick={() => handleCurrencyChange('USD')}
          title={t('filters.currencies.USD')}
        >
          <span className="currency-symbol">$</span>
          <span className="currency-code">USD</span>
        </button>
        
        <button
          className={`toggle-button ${currency === 'VND' ? 'active' : ''}`}
          onClick={() => handleCurrencyChange('VND')}
          title={t('filters.currencies.VND')}
        >
          <span className="currency-symbol">₫</span>
          <span className="currency-code">VND</span>
        </button>
      </div>
    </div>
  );
};

export default CurrencyToggle; 